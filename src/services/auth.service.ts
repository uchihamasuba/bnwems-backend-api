import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { env } from '../config/env';
import { prisma } from '../config/database';
import { AppError } from '../middlewares/error.middleware';

export const login = async (username: string, passwordString: string, deviceToken?: string, deviceType?: string) => {
  const user = await prisma.user.findUnique({
    where: { username },
    include: { role: true },
  });

  if (!user || !(await bcrypt.compare(passwordString, user.passwordHash))) {
    throw new AppError('Sai username hoặc password', 400, 'MSG-LG-02');
  }

  if (user.status !== 'active') {
    throw new AppError('Tài khoản bị vô hiệu hóa hoặc đình chỉ', 403, 'MSG-LG-03');
  }

  // Generate token
  const token = jwt.sign(
    { userId: user.id.toString(), role: user.role.name },
    env.JWT_SECRET,
    { expiresIn: '1d' } // Example expiration
  );

  // If device token provided, save/update it
  if (deviceToken && deviceType) {
    await prisma.userDevice.upsert({
      where: { deviceToken },
      update: {
        userId: user.id,
        deviceType,
      },
      create: {
        userId: user.id,
        deviceToken,
        deviceType,
      },
    });
  }

  // BigInt serialization is handled in response but here we can map it to string/number if needed
  // Return user info
  return {
    token,
    user: {
      id: Number(user.id),
      full_name: user.fullName,
      username: user.username,
      role: user.role.name,
    },
  };
};

export const logout = async (deviceToken?: string) => {
  if (deviceToken) {
    await prisma.userDevice.deleteMany({
      where: { deviceToken },
    });
  }
};

export const forgotPassword = async (username: string) => {
  const user = await prisma.user.findUnique({ where: { username } });
  if (!user || user.status !== 'active') {
    return;
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  await prisma.passwordResetToken.create({
    data: {
      userId: user.id,
      otp,
      expiresAt,
    }
  });

  console.log(`[Mock Email/SMS] OTP for ${username} is ${otp}`);
};

export const verifyForgotPasswordOTP = async (username: string, otp: string) => {
  const user = await prisma.user.findUnique({ where: { username } });
  if (!user || user.status !== 'active') {
    throw new AppError('OTP sai hoặc hết hạn', 400);
  }

  const validToken = await prisma.passwordResetToken.findFirst({
    where: {
      userId: user.id,
      otp,
      isUsed: false,
      expiresAt: { gt: new Date() }
    },
    orderBy: { createdAt: 'desc' }
  });

  if (!validToken) {
    throw new AppError('OTP sai hoặc hết hạn', 400);
  }

  const crypto = await import('crypto');
  const resetTokenStr = crypto.randomBytes(32).toString('hex');
  const resetExpiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

  await prisma.passwordResetToken.update({
    where: { id: validToken.id },
    data: {
      isUsed: true,
      otp: null,
      token: resetTokenStr,
      expiresAt: resetExpiresAt
    }
  });

  return { reset_token: resetTokenStr, expires_in: 15 * 60 };
};

export const resetPassword = async (resetToken: string, newPassword: string) => {
  const prt = await prisma.passwordResetToken.findUnique({
    where: { token: resetToken },
    include: { user: true }
  });

  if (!prt || prt.isUsed || prt.expiresAt < new Date()) {
    throw new AppError('Token không hợp lệ hoặc đã hết hạn', 400, 'MSG-AUTH0302');
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: { id: prt.userId },
    data: { passwordHash }
  });

  await prisma.passwordResetToken.update({
    where: { id: prt.id },
    data: { isUsed: true }
  });

  await prisma.userDevice.deleteMany({
    where: { userId: prt.userId }
  });
};

export const refresh = async (oldToken: string) => {
  // Normally you'd verify if the old token is valid, check against DB, etc.
  try {
    // If it's valid, we decode it
    const decoded = jwt.verify(oldToken, env.JWT_SECRET, { ignoreExpiration: true }) as { userId: string; role: string };
    
    const user = await prisma.user.findUnique({ 
      where: { id: BigInt(decoded.userId) },
      include: { role: true }
    });
    if (!user || user.status !== 'active') {
      throw new AppError('Invalid token or inactive user', 401, 'MSG-AUTH-01');
    }

    const token = jwt.sign(
      { userId: user.id.toString(), role: user.role.name },
      env.JWT_SECRET,
      { expiresIn: '1d' }
    );
    return { token };
  } catch (error) {
    throw new AppError('Invalid token', 401, 'MSG-AUTH-01');
  }
};