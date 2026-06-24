import { prisma } from '../config/database';
import { AppError } from '../middlewares/error.middleware';

class PolicyService {
  public async getPolicies(policyType?: string, isActiveParam?: string) {
    const whereClause: any = {};
    if (policyType) whereClause.policyType = policyType;
    if (isActiveParam !== undefined) whereClause.isActive = isActiveParam === 'true';

    const policies = await prisma.businessPolicy.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
    });

    return policies;
  }

  public async createPolicy(data: any, actionUserId: string) {
    const { policyType, name, rules } = data;

    const newPolicy = await prisma.businessPolicy.create({
      data: { policyType, name, rules },
    });

    await prisma.auditLog.create({
      data: {
        userId: actionUserId,
        action: 'CREATE_POLICY',
        entityType: 'BusinessPolicy',
        entityId: newPolicy.id,
      },
    });

    return newPolicy;
  }

  public async updatePolicy(id: string, rules: any, actionUserId: string) {
    const policy = await prisma.businessPolicy.findUnique({ where: { id } });
    if (!policy) throw new AppError('Policy not found', 404);

    await prisma.businessPolicy.update({
      where: { id },
      data: { rules },
    });

    await prisma.auditLog.create({
      data: {
        userId: actionUserId,
        action: 'UPDATE_POLICY',
        entityType: 'BusinessPolicy',
        entityId: id,
      },
    });
  }
}

export const policyService = new PolicyService();
