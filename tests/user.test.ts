/**
 * @file user.test.ts
 * Unit tests for User Management Service.
 */

jest.mock('../src/config/database', () => ({
  __esModule: true,
  default: {
    user: {
      findMany: jest.fn(),
      count: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    role: { findUnique: jest.fn() },
    auditLog: { create: jest.fn() },
  },
}));

jest.mock('bcryptjs', () => ({
  hash: jest.fn(() => 'hashedpassword123'),
  compare: jest.fn(),
}));

import { userService } from '../src/services/user.service';
import prisma from '../src/config/database';

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

describe('UserService — getUsers()', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should return paginated user list', async () => {
    const mockUsers = [
      { id: 1, username: 'admin_test', fullName: 'Admin Test', email: 'admin@test.com', phone: null, status: 'ACTIVE', lastLoginAt: null, createdAt: new Date(), role: { id: 1, roleName: 'Administrator' } },
    ];
    (mockPrisma.user.findMany as jest.Mock).mockResolvedValue(mockUsers);
    (mockPrisma.user.count as jest.Mock).mockResolvedValue(1);

    const result = await userService.getUsers({ page: 1, limit: 10 });

    expect(result.pagination.totalItems).toBe(1);
    expect(result.pagination.currentPage).toBe(1);
    expect(result.data).toHaveLength(1);
    expect(result.data[0].username).toBe('admin_test');
  });
});

describe('UserService — createUser()', () => {
  const mockRole = { id: 2, roleName: 'Manager', description: null, isActive: true, createdAt: new Date(), updatedAt: new Date() };

  beforeEach(() => jest.clearAllMocks());

  it('should create user successfully with unique username/email', async () => {
    (mockPrisma.user.findFirst as jest.Mock).mockResolvedValue(null); // No duplicate
    (mockPrisma.role.findUnique as jest.Mock).mockResolvedValue(mockRole);
    (mockPrisma.user.create as jest.Mock).mockResolvedValue({ id: 15, username: 'tech_dung', createdAt: new Date() });

    const result = await userService.createUser({
      username: 'tech_dung',
      password: 'InitP@ss123',
      fullName: 'Trần Việt Dũng',
      email: 'dungtv@fpt.edu.vn',
      phone: '0987654321',
      roleId: 2,
    });

    expect(result.username).toBe('tech_dung');
    expect(result.id).toBe(15);
  });

  it('should throw 400 when username already exists', async () => {
    (mockPrisma.user.findFirst as jest.Mock).mockResolvedValue({ id: 5, username: 'tech_dung' });

    await expect(
      userService.createUser({
        username: 'tech_dung',
        password: 'InitP@ss123',
        fullName: 'Dupe User',
        email: 'dupe@test.com',
        roleId: 2,
      })
    ).rejects.toMatchObject({ statusCode: 400 });
  });

  it('should throw 400 when role is inactive', async () => {
    (mockPrisma.user.findFirst as jest.Mock).mockResolvedValue(null);
    (mockPrisma.role.findUnique as jest.Mock).mockResolvedValue({ ...mockRole, isActive: false });

    await expect(
      userService.createUser({
        username: 'new_user',
        password: 'InitP@ss123',
        fullName: 'New User',
        email: 'new@test.com',
        roleId: 99,
      })
    ).rejects.toMatchObject({ statusCode: 400 });
  });
});

describe('UserService — deactivateUser()', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should throw 400 when user tries to deactivate themselves', async () => {
    await expect(userService.deactivateUser(1, 1)).rejects.toMatchObject({ statusCode: 400 });
  });

  it('should throw 404 when target user is not found', async () => {
    (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(null);
    await expect(userService.deactivateUser(99, 1)).rejects.toMatchObject({ statusCode: 404 });
  });
});
