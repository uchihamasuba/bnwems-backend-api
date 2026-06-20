import { prisma } from '../config/database';
import { AppError } from '../middlewares/error.middleware';
import bcrypt from 'bcryptjs';

// me operations
export const getProfile = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: BigInt(userId) },
    include: { role: true },
  });
  if (!user) throw new AppError('User not found', 404);

  return {
    id: Number(user.id),
    full_name: user.fullName,
    username: user.username,
    email: user.email,
    phone: user.phone,
    role: user.role.name,
    status: user.status,
    created_at: user.createdAt,
  };
};

export const updateProfile = async (userId: string, data: { full_name?: string; email?: string; phone?: string }) => {
  await prisma.user.update({
    where: { id: BigInt(userId) },
    data: {
      fullName: data.full_name,
      email: data.email,
      phone: data.phone,
    },
  });
};

export const changePassword = async (userId: string, currentPassword?: string, newPassword?: string, ipAddress?: string, userAgent?: string) => {
  if (!currentPassword || !newPassword) {
    throw new AppError('Mật khẩu không hợp lệ', 400, 'MSG-CP-03');
  }

  const user = await prisma.user.findUnique({ where: { id: BigInt(userId) } });
  if (!user) throw new AppError('User not found', 404);

  if (!(await bcrypt.compare(currentPassword, user.passwordHash))) {
    throw new AppError('Mật khẩu hiện tại không đúng', 400, 'MSG-CP-02');
  }

  // Password policy check: at least 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  if (!passwordRegex.test(newPassword)) {
    throw new AppError('Mật khẩu mới không đạt chính sách (ít nhất 8 ký tự, gồm chữ hoa, chữ thường, số và ký tự đặc biệt)', 400, 'MSG-CP-03');
  }

  const newHash = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({
    where: { id: BigInt(userId) },
    data: { passwordHash: newHash },
  });

  // Ghi audit log theo BR-CP06
  await prisma.auditLog.create({
    data: {
      userId: user.id,
      action: 'CHANGE_PASSWORD',
      entityType: 'User',
      entityId: user.id,
      ipAddress: ipAddress || null,
      userAgent: userAgent || null,
      oldValues: { passwordChanged: false },
      newValues: { passwordChanged: true }
    }
  });
};

// notifications
export const getNotifications = async (userId: string, page = 1, limit = 20, isRead?: boolean) => {
  const where: any = { userId: BigInt(userId) };
  if (isRead !== undefined) {
    where.isRead = isRead;
  }

  const skip = (page - 1) * limit;
  const [data, total] = await Promise.all([
    prisma.notification.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.notification.count({ where }),
  ]);

  return {
    data: data.map((n: any) => ({
      ...n,
      id: Number(n.id),
      userId: Number(n.userId),
      relatedEntityId: n.relatedEntityId ? Number(n.relatedEntityId) : null,
    })),
    meta: {
      page,
      limit,
      total,
      total_pages: Math.ceil(total / limit),
    },
  };
};

export const markNotificationRead = async (userId: string, notificationId: string) => {
  const notification = await prisma.notification.findUnique({ where: { id: BigInt(notificationId) } });
  if (!notification || notification.userId !== BigInt(userId)) {
    throw new AppError('Not found', 404);
  }

  const updated = await prisma.notification.update({
    where: { id: BigInt(notificationId) },
    data: { isRead: true, readAt: new Date() },
  });

  return { id: Number(updated.id), is_read: updated.isRead };
};

// Admin User Operations
export const getAllUsers = async (page = 1, limit = 20, search?: string, roleId?: string, status?: string) => {
  try {
    const where: any = {};
    if (search) {
      where.OR = [
        { fullName: { contains: search } },
        { username: { contains: search } },
        { email: { contains: search } },
        { phone: { contains: search } },
      ];
    }
    if (roleId) where.roleId = BigInt(roleId);
    if (status) where.status = status;

    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        include: { role: true },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where }),
    ]);

    return {
      data: users.map((u: any) => ({
        id: Number(u.id),
        full_name: u.fullName,
        username: u.username,
        email: u.email,
        phone: u.phone,
        status: u.status,
        role: u.role ? {
          id: Number(u.role.id),
          name: u.role.name,
        } : null
      })),
      meta: {
        page,
        limit,
        total,
        total_pages: Math.ceil(total / limit),
      }
    };
  } catch (error) {
    throw error;
  }
};

export const createUser = async (data: { full_name?: string; fullName?: string; username: string; password?: string; email?: string; phone?: string; role_id?: number; roleId?: number; created_by: string }) => {
  const exists = await prisma.user.findUnique({ where: { username: data.username } });
  if (exists) {
    throw new AppError('Username đã tồn tại', 409, 'MSG-AU-03');
  }

  const roleIdInput = data.role_id || data.roleId;
  if (!roleIdInput) throw new AppError('Role is required', 400);

  const role = await prisma.role.findUnique({ where: { id: BigInt(roleIdInput) } });
  if (!role) throw new AppError('Role not found', 404);
  if (role.status === 'inactive') {
    throw new AppError('Vai trò inactive, không được gán', 409, 'MSG-AU-04');
  }

  const hash = await bcrypt.hash(data.password || 'initPass123', 10);
  const fullNameInput = data.full_name || data.fullName || '';

  const user = await prisma.user.create({
    data: {
      fullName: fullNameInput,
      username: data.username,
      passwordHash: hash,
      email: data.email,
      phone: data.phone,
      roleId: BigInt(roleIdInput),
      createdBy: BigInt(data.created_by),
    }
  });

  return {
    id: Number(user.id),
    username: user.username,
    status: user.status,
  };
};

export const updateUser = async (id: string, data: { full_name?: string; email?: string; phone?: string }) => {
  await prisma.user.update({
    where: { id: BigInt(id) },
    data: {
      fullName: data.full_name,
      email: data.email,
      phone: data.phone,
    }
  });
  return { id: Number(id) };
};

export const updateUserStatus = async (adminId: string, id: string, status: string) => {
  if (adminId === id) {
    throw new AppError('Admin tự vô hiệu hóa chính mình', 409, 'MSG-DU-02');
  }
  if (!['active', 'inactive', 'suspended'].includes(status)) {
    throw new AppError('Trạng thái không hợp lệ', 400, 'MSG-DU-03');
  }

  await prisma.user.update({
    where: { id: BigInt(id) },
    data: { status }
  });
  return { id: Number(id), status };
};

export const getAssignments = async (userId: string, page = 1, limit = 20, assignedDate?: string, status?: string) => {
  const skip = (page - 1) * limit;
  const where: any = { userId: BigInt(userId) };
  if (assignedDate) where.assignedDate = new Date(assignedDate);
  if (status) where.status = status;

  const [data, total] = await Promise.all([
    prisma.assignment.findMany({
      where,
      skip,
      take: limit,
      orderBy: { assignedDate: 'desc' },
      include: { order: true }
    }),
    prisma.assignment.count({ where })
  ]);

  const formattedData = data.map(a => ({
    id: Number(a.id),
    order: a.order ? {
      id: Number(a.order.id),
      code: a.order.code,
      event_date: a.order.eventDate,
      venue_name: a.order.venueName
    } : null,
    assigned_date: a.assignedDate,
    session_type: a.sessionType,
    role_in_event: a.roleInEvent,
    status: a.status
  }));

  return { data: formattedData, meta: { page, limit, total, total_pages: Math.ceil(total / limit) } };
};

export const resetPassword = async (adminId: string, id: string, newPassword?: string) => {
  if (adminId === id) {
    throw new AppError('Đặt lại mật khẩu của chính mình', 409, 'MSG-RP-02');
  }
  
  const user = await prisma.user.findUnique({ where: { id: BigInt(id) } });
  if (!user) throw new AppError('User not found', 404);
  if (user.status !== 'active') {
    throw new AppError('Tài khoản đang inactive', 409, 'MSG-RP-03');
  }

  const hash = await bcrypt.hash(newPassword || 'resetPass456', 10);
  await prisma.user.update({
    where: { id: BigInt(id) },
    data: { passwordHash: hash }
  });
  return { id: Number(id) };
};

export const assignRole = async (id: string, roleId: number) => {
  const role = await prisma.role.findUnique({ where: { id: BigInt(roleId) } });
  if (!role || role.status === 'inactive') {
    throw new AppError('Vai trò không tồn tại hoặc inactive', 409, 'MSG-AR-02');
  }

  await prisma.user.update({
    where: { id: BigInt(id) },
    data: { roleId: BigInt(roleId) }
  });
  return { id: Number(id), role_id: roleId };
};