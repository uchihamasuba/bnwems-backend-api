import prisma from '../config/database';

export const policyService = {
  async createPolicy(payload: {
    policyName: string;
    type: string;
    rulesJson: object;
    effectiveDate: string;
  }) {
    const policy = await prisma.policy.create({
      data: {
        policyName: payload.policyName,
        type: payload.type as 'DEPOSIT' | 'CANCELLATION' | 'COMPENSATION' | 'ADDITIONAL_FEE' | 'WAGE_RULE',
        rulesJson: payload.rulesJson,
        effectiveDate: new Date(payload.effectiveDate),
        isActive: true,
      },
    });

    return policy;
  },

  async getPolicies(type?: string) {
    const where: Record<string, unknown> = { isActive: true };
    if (type) where.type = type;
    return prisma.policy.findMany({ where, orderBy: { effectiveDate: 'desc' } });
  },
};
