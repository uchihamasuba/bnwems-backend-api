/**
 * @file auth.test.ts
 * Unit & Integration tests for Authentication Module.
 * Tests service logic in isolation using mocked Prisma client.
 */

// Mock prisma before importing services
jest.mock('../src/config/database', () => ({
  __esModule: true,
  default: {
    user: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    auditLog: { create: jest.fn() },
    $connect: jest.fn(),
    $disconnect: jest.fn(),
  },
  prisma: {
    user: { findFirst: jest.fn(), update: jest.fn() },
    auditLog: { create: jest.fn() },
  },
}));

// Mock bcryptjs
jest.mock('bcryptjs', () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));

// Mock jsonwebtoken
jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(() => 'mock.jwt.token'),
  verify: jest.fn(),
}));

import bcrypt from 'bcryptjs';
import { authService } from '../src/services/auth.service';
import prisma from '../src/config/database';

const mockPrisma = prisma as jest.Mocked<typeof prisma>;
const mockBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

describe('AuthService — login()', () => {
  const mockUser = {
    id: 1,
    username: 'manager_test',
    fullName: 'Test Manager',
    email: 'test@bnwems.com',
    passwordHash: 'hashedpassword',
    status: 'ACTIVE' as const,
    roleId: 2,
    lastLoginAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    phone: null,
    role: {
      id: 2,
      roleName: 'Manager',
      description: null,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      rolePermissions: [
        { id: 1, roleId: 2, permission: 'VIEW_ORDER_LIST' },
        { id: 2, roleId: 2, permission: 'CREATE_QUOTATION' },
      ],
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return token and user data on successful login', async () => {
    (mockPrisma.user.findFirst as jest.Mock).mockResolvedValue(mockUser);
    (mockPrisma.user.update as jest.Mock).mockResolvedValue(mockUser);
    (mockPrisma.auditLog.create as jest.Mock).mockResolvedValue({});
    (mockBcrypt.compare as jest.Mock).mockResolvedValue(true);

    const result = await authService.login({ username: 'manager_test', password: 'P@ssword2026' });

    expect(result).toHaveProperty('token', 'mock.jwt.token');
    expect(result.user.username).toBe('manager_test');
    expect(result.user.role.roleName).toBe('Manager');
    expect(result.user.role.permissions).toContain('VIEW_ORDER_LIST');
  });

  it('should throw 401 when user is not found', async () => {
    (mockPrisma.user.findFirst as jest.Mock).mockResolvedValue(null);

    await expect(authService.login({ username: 'unknown', password: 'pass' })).rejects.toMatchObject({
      statusCode: 401,
    });
  });

  it('should throw 403 when user account is DEACTIVATED', async () => {
    (mockPrisma.user.findFirst as jest.Mock).mockResolvedValue({ ...mockUser, status: 'DEACTIVATED' });

    await expect(authService.login({ username: 'manager_test', password: 'P@ssword2026' })).rejects.toMatchObject({
      statusCode: 403,
    });
  });

  it('should throw 401 when password is incorrect', async () => {
    (mockPrisma.user.findFirst as jest.Mock).mockResolvedValue(mockUser);
    (mockBcrypt.compare as jest.Mock).mockResolvedValue(false);

    await expect(authService.login({ username: 'manager_test', password: 'WrongPassword' })).rejects.toMatchObject({
      statusCode: 401,
    });
  });
});

describe('AuthService — changePassword()', () => {
  const mockUser = {
    id: 1,
    username: 'manager_test',
    passwordHash: 'hashedpassword',
    status: 'ACTIVE' as const,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should throw 401 when old password is incorrect', async () => {
    (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
    (mockBcrypt.compare as jest.Mock).mockResolvedValue(false);

    await expect(
      authService.changePassword({ userId: 1, oldPassword: 'wrong', newPassword: 'NewP@ss2026!' })
    ).rejects.toMatchObject({ statusCode: 401 });
  });

  it('should throw 400 when new password does not meet complexity requirements', async () => {
    (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
    (mockBcrypt.compare as jest.Mock).mockResolvedValue(true);

    await expect(
      authService.changePassword({ userId: 1, oldPassword: 'P@ssword2026', newPassword: 'weakpass' })
    ).rejects.toMatchObject({ statusCode: 400 });
  });
});
