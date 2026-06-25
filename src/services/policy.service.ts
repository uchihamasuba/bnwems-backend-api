import { prisma } from '../config/database';
import { AppError } from '../middlewares/error.middleware';

class PolicyService {
  public async getPolicies(policyType?: string, isActiveParam?: string) {
    const whereClause: any = {};
    if (policyType) whereClause.policyType = policyType;
    if (isActiveParam !== undefined) {
      whereClause.status = isActiveParam === 'true' ? 'active' : 'inactive';
    }

    const policies = await prisma.businessPolicy.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
    });

    return policies.map(p => ({
      ...p,
      rules: p.config // Map config back to rules for API compatibility
    }));
  }

  public async createPolicy(data: any, actionUserId: string) {
    const { policyType, name, rules } = data;

    const newPolicy = await prisma.businessPolicy.create({
      data: { 
        policyType, 
        name, 
        config: rules,
        effectiveFrom: new Date(), // default to now
        createdBy: BigInt(actionUserId)
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: BigInt(actionUserId),
        action: 'CREATE_POLICY',
        entityType: 'BusinessPolicy',
        entityId: newPolicy.policyId,
      },
    });

    return newPolicy;
  }

  public async updatePolicy(id: string, rules: any, actionUserId: string) {
    const policy = await prisma.businessPolicy.findUnique({ where: { policyId: BigInt(id) } });
    if (!policy) throw new AppError('Policy not found', 404);

    await prisma.businessPolicy.update({
      where: { policyId: BigInt(id) },
      data: { config: rules },
    });

    await prisma.auditLog.create({
      data: {
        userId: BigInt(actionUserId),
        action: 'UPDATE_POLICY',
        entityType: 'BusinessPolicy',
        entityId: BigInt(id),
      },
    });
  }
}

export const policyService = new PolicyService();
