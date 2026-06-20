import prisma from '../config/database';
import { AppError } from '../middlewares/error.middleware';

export class PolicyService {
  static async getBusinessPolicies() {
    const policies = await prisma.businessPolicy.findMany({
      orderBy: { code: 'asc' }
    });

    return policies.map(p => ({
      code: p.code,
      name: p.name,
      policy_value: Number(p.policyValue),
      unit: p.unit,
      description: p.description
    }));
  }

  static async updateBusinessPolicy(code: string, data: { policy_value: number; unit?: string; description?: string }, updatedBy: number) {
    const policy = await prisma.businessPolicy.findUnique({ where: { code } });
    if (!policy) {
      throw new AppError('Chính sách không tồn tại', 404, 'MSG-DP-03');
    }

    if (data.policy_value < 0) {
      throw new AppError('Giá trị chính sách không hợp lệ', 400, 'MSG-DP-02');
    }

    const updatedPolicy = await prisma.businessPolicy.update({
      where: { code },
      data: {
        policyValue: data.policy_value,
        ...(data.unit && { unit: data.unit }),
        ...(data.description !== undefined && { description: data.description }),
        updatedBy
      }
    });

    return {
      code: updatedPolicy.code,
      policy_value: Number(updatedPolicy.policyValue),
      unit: updatedPolicy.unit
    };
  }

  static async getWageRules() {
    const rules = await prisma.wageRule.findMany({
      include: { role: { select: { name: true } } },
      orderBy: { validFrom: 'desc' }
    });

    return rules.map(r => ({
      id: Number(r.id),
      role_id: Number(r.roleId),
      role_name: r.role.name,
      session_type: r.sessionType,
      wage_amount: Number(r.wageAmount),
      valid_from: r.validFrom,
      valid_to: r.validTo
    }));
  }

  static async createWageRule(data: { role_id: number; session_type: string; wage_amount: number; valid_from: string }, createdBy: number) {
    if (!data.role_id || !data.session_type || !data.wage_amount || !data.valid_from) {
      throw new AppError('Thiếu thông tin bắt buộc', 400, 'MSG-WR-02');
    }

    if (data.wage_amount <= 0) {
      throw new AppError('Mức lương phải lớn hơn 0', 400, 'MSG-WR-02');
    }

    const role = await prisma.role.findUnique({ where: { id: data.role_id } });
    if (!role) {
      throw new AppError('Vai trò không tồn tại', 404, 'MSG-WR-05');
    }

    const validFromDate = new Date(data.valid_from);

    const result = await prisma.$transaction(async (tx) => {
      // Find currently active rule for the same role and session
      const currentRule = await tx.wageRule.findFirst({
        where: {
          roleId: data.role_id,
          sessionType: data.session_type,
          validTo: null
        }
      });

      // If existing rule starts after the new rule, that's a conflict
      if (currentRule && currentRule.validFrom >= validFromDate) {
        throw new AppError('Đã có quy tắc hiện hành cho vai trò và ca này với ngày hiệu lực sau hoặc bằng', 409, 'MSG-WR-03');
      }

      if (currentRule) {
        // Close the old rule
        await tx.wageRule.update({
          where: { id: currentRule.id },
          data: { validTo: validFromDate }
        });
      }

      const newRule = await tx.wageRule.create({
        data: {
          roleId: data.role_id,
          sessionType: data.session_type,
          wageAmount: data.wage_amount,
          validFrom: validFromDate,
          createdBy
        }
      });

      return newRule;
    });

    return {
      id: Number(result.id),
      role_id: Number(result.roleId),
      session_type: result.sessionType,
      wage_amount: Number(result.wageAmount),
      valid_from: result.validFrom,
      valid_to: result.validTo
    };
  }

  static async updateWageRule(id: number, data: { wage_amount?: number; valid_from?: string }) {
    const rule = await prisma.wageRule.findUnique({ where: { id } });
    if (!rule) {
      throw new AppError('Quy tắc lương không tồn tại', 404, 'MSG-WR-04');
    }

    if (data.wage_amount !== undefined && data.wage_amount <= 0) {
      throw new AppError('Mức lương phải lớn hơn 0', 400, 'MSG-WR-02');
    }

    const updatedRule = await prisma.wageRule.update({
      where: { id },
      data: {
        ...(data.wage_amount && { wageAmount: data.wage_amount }),
        ...(data.valid_from && { validFrom: new Date(data.valid_from) })
      }
    });

    return { id: Number(updatedRule.id) };
  }
}