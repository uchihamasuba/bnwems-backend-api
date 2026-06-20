import { prisma } from '../config/database';
import { AppError } from '../middlewares/error.middleware';

export const getAllRoles = async () => {
  const roles = await prisma.role.findMany({
    include: {
      _count: {
        select: { users: true, rolePermissions: true }
      }
    }
  });

  return roles.map((r: any) => ({
    id: Number(r.id),
    name: r.name,
    description: r.description,
    status: r.status,
    user_count: r._count.users,
  }));
};

export const createRole = async (data: { name: string; description?: string }) => {
  const exists = await prisma.role.findUnique({ where: { name: data.name } });
  if (exists) throw new AppError('Tên vai trò đã tồn tại', 409, 'MSG-ROLE-02');

  const role = await prisma.role.create({
    data: {
      name: data.name,
      description: data.description,
    }
  });

  return {
    id: Number(role.id),
    name: role.name,
    status: role.status,
  };
};

export const updateRole = async (id: string, data: { name?: string; description?: string }) => {
  if (data.name) {
    const exists = await prisma.role.findFirst({ where: { name: data.name, id: { not: BigInt(id) } } });
    if (exists) throw new AppError('Tên vai trò đã tồn tại', 409, 'MSG-ROLE-02');
  }

  const role = await prisma.role.update({
    where: { id: BigInt(id) },
    data: {
      name: data.name,
      description: data.description,
    }
  });

  return { id: Number(role.id), status: role.status };
};

export const updateRoleStatus = async (id: string, status: string) => {
  if (!['active', 'inactive'].includes(status)) {
    throw new AppError('Trạng thái không hợp lệ', 400, 'MSG-ROLE-04');
  }

  const role = await prisma.role.update({
    where: { id: BigInt(id) },
    data: { status }
  });

  return { id: Number(role.id), status: role.status };
};

export const getUsersByRole = async (id: string) => {
  const users = await prisma.user.findMany({
    where: { roleId: BigInt(id) },
  });

  return users.map((u: any) => ({
    id: Number(u.id),
    username: u.username,
    full_name: u.fullName,
  }));
};

export const assignPermissionsToRole = async (id: string, permissionIds: number[]) => {
  const role = await prisma.role.findUnique({ where: { id: BigInt(id) } });
  if (!role || role.status === 'inactive') {
    throw new AppError('Vai trò inactive', 409, 'MSG-PR-02');
  }

  await prisma.$transaction(async (tx: any) => {
    await tx.rolePermission.deleteMany({ where: { roleId: BigInt(id) } });
    const dataToInsert = permissionIds.map(pid => ({
      roleId: BigInt(id),
      permissionId: BigInt(pid)
    }));
    if (dataToInsert.length > 0) {
      await tx.rolePermission.createMany({ data: dataToInsert });
    }
  });

  return { role_id: Number(id), permission_ids: permissionIds };
};

export const getAllPermissions = async () => {
  const permissions = await prisma.permission.findMany();
  return permissions.map((p: any) => ({
    id: Number(p.id),
    name: p.name,
    code: p.code,
  }));
};
