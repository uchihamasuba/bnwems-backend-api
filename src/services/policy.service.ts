import { prisma } from '../config/database';
import { AppError } from '../middlewares/error.middleware';
import { PolicyType } from '@prisma/client';

class PolicyService {
  public async getPolicies(policyType?: PolicyType, isActive?: boolean) {
    const whereClause: any = {};
    if (policyType) whereClause.policyType = policyType;
    if (isActive !== undefined) whereClause.isActive = isActive;

    const policies = await prisma.businessPolicy.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
    });

    return { policies, totalCount: policies.length };
  }

  public async createPolicy(data: any) {
    const existing = await prisma.businessPolicy.findUnique({
      where: { policyCode: data.policyCode },
    });
    if (existing) {
      throw new AppError('Mã chính sách đã tồn tại', 400);
    }

    return await prisma.businessPolicy.create({
      data: {
        policyCode: data.policyCode,
        policyName: data.policyName,
        policyType: data.policyType,
        policyValue: data.policyValue,
        unit: data.unit,
        description: data.description,
      },
    });
  }

  public async updatePolicy(id: string, data: any) {
    const existing = await prisma.businessPolicy.findUnique({
      where: { policyId: BigInt(id) },
    });
    if (!existing) throw new AppError('Không tìm thấy chính sách', 404);

    const updateData: any = {};
    if (data.policyValue !== undefined) updateData.policyValue = data.policyValue;
    if (data.unit !== undefined) updateData.unit = data.unit;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;
    if (data.description !== undefined) updateData.description = data.description;

    return await prisma.businessPolicy.update({
      where: { policyId: BigInt(id) },
      data: updateData,
    });
  }
}

export const policyService = new PolicyService();
