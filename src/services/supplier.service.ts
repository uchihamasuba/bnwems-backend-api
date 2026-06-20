import prisma from '../config/database';
import { AppError } from '../middlewares/error.middleware';

export class SupplierService {
  static async getSuppliers(page: number = 1, limit: number = 20, search?: string, status?: string) {
    const skip = (page - 1) * limit;
    
    const whereClause: any = {};
    if (search) {
      whereClause.name = { contains: search };
    }
    if (status) {
      whereClause.status = status;
    }

    const [suppliers, total] = await Promise.all([
      prisma.supplier.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.supplier.count({ where: whereClause })
    ]);

    return {
      data: suppliers.map(s => ({
        ...s,
        id: Number(s.id),
        createdBy: s.createdBy ? Number(s.createdBy) : null
      })),
      meta: {
        page,
        limit,
        total,
        total_pages: Math.ceil(total / limit)
      }
    };
  }

  static async createSupplier(data: { name: string; contact_person?: string; phone?: string; email?: string; address?: string }, createdBy: number) {
    if (!data.name) {
        throw new AppError('Tên nhà cung cấp là bắt buộc', 400, 'MSG-SUP-02');
    }

    const newSupplier = await prisma.supplier.create({
      data: {
        name: data.name,
        contactPerson: data.contact_person,
        phone: data.phone,
        email: data.email,
        address: data.address,
        createdBy
      }
    });

    return {
      id: Number(newSupplier.id),
      name: newSupplier.name,
      status: newSupplier.status
    };
  }

  static async updateSupplier(id: number, data: { name?: string; contact_person?: string; phone?: string; email?: string; address?: string }) {
    const supplier = await prisma.supplier.findUnique({ where: { id } });
    if (!supplier) {
      throw new AppError('Nhà cung cấp không tồn tại', 404, 'MSG-SUP-03');
    }

    const updatedSupplier = await prisma.supplier.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.contact_person !== undefined && { contactPerson: data.contact_person }),
        ...(data.phone !== undefined && { phone: data.phone }),
        ...(data.email !== undefined && { email: data.email }),
        ...(data.address !== undefined && { address: data.address })
      }
    });

    return { id: Number(updatedSupplier.id) };
  }

  static async updateSupplierStatus(id: number, status: string) {
    const supplier = await prisma.supplier.findUnique({ where: { id } });
    if (!supplier) {
      throw new AppError('Nhà cung cấp không tồn tại', 404, 'MSG-SUP-03');
    }

    const updatedSupplier = await prisma.supplier.update({
      where: { id },
      data: { status }
    });

    return { id: Number(updatedSupplier.id), status: updatedSupplier.status };
  }

  static async createSupplierPayable(data: {
    supplier_id: number;
    order_id?: number;
    transaction_type: string;
    transaction_date: string;
    due_date?: string;
    reference_code?: string;
    items: Array<{ catalog_item_id: number; quantity: number; unit_price: number }>;
  }, createdBy: number) {
    if (!data.supplier_id || !data.transaction_type || !data.items || data.items.length === 0) {
      throw new AppError('Thiếu thông tin bắt buộc hoặc danh sách mặt hàng trống', 400, 'MSG-SPU-02');
    }

    const supplier = await prisma.supplier.findUnique({ where: { id: data.supplier_id } });
    if (!supplier) {
      throw new AppError('Nhà cung cấp không tồn tại', 404, 'MSG-SPU-03');
    }

    let totalAmount = 0;
    const payableItemsData = data.items.map(item => {
      const totalPrice = item.quantity * item.unit_price;
      totalAmount += totalPrice;
      return {
        catalogItemId: item.catalog_item_id,
        quantity: item.quantity,
        unitPrice: item.unit_price,
        totalPrice
      };
    });

    if (totalAmount <= 0) {
      throw new AppError('Tổng số tiền phải lớn hơn 0', 400, 'MSG-SPU-02');
    }

    const result = await prisma.$transaction(async (tx) => {
      const payable = await tx.supplierPayable.create({
        data: {
          supplierId: data.supplier_id,
          transactionType: data.transaction_type,
          transactionDate: new Date(data.transaction_date),
          dueDate: data.due_date ? new Date(data.due_date) : null,
          referenceCode: data.reference_code,
          totalAmount,
          paidAmount: 0,
          status: 'unpaid',
          createdBy,
          items: {
            create: payableItemsData
          }
        }
      });
      return payable;
    });

    return {
      id: Number(result.id),
      supplier_id: Number(result.supplierId),
      total_amount: Number(result.totalAmount),
      paid_amount: Number(result.paidAmount),
      status: result.status
    };
  }

  static async createSupplierPayableInternal(data: any) {
    const totalAmount = data.items.reduce((sum: number, item: any) => sum + (item.quantity * item.unit_price), 0);

    const payable = await prisma.supplierPayable.create({
      data: {
        supplierId: BigInt(data.supplier_id),
        transactionType: data.transaction_type,
        transactionDate: new Date(data.transaction_date),
        totalAmount: totalAmount,
        status: data.transaction_type === 'return' ? 'completed' : 'pending',
        createdBy: BigInt(data.created_by),
        items: {
          create: data.items.map((item: any) => ({
            catalogItemId: BigInt(item.catalog_item_id),
            quantity: item.quantity,
            unitPrice: item.unit_price,
            totalPrice: item.quantity * item.unit_price,
            notes: item.notes
          }))
        }
      }
    });

    return { id: Number(payable.id), transaction_type: payable.transactionType };
  }

  static async receiptSupplierPayable(id: string, data: any, userId: string) {
    const updated = await prisma.supplierPayable.update({
      where: { id: BigInt(id) },
      data: { status: 'received' }
    });

    return { id: Number(updated.id) };
  }

  static async getSupplierPayables(page: number = 1, limit: number = 20, supplierId?: number, status?: string) {
    const skip = (page - 1) * limit;
    
    const whereClause: any = {};
    if (supplierId) {
      whereClause.supplierId = supplierId;
    }
    if (status) {
      whereClause.status = status;
    }

    const [payables, total] = await Promise.all([
      prisma.supplierPayable.findMany({
        where: whereClause,
        include: { supplier: { select: { id: true, name: true } } },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.supplierPayable.count({ where: whereClause })
    ]);

    return {
      data: payables.map(p => ({
        id: Number(p.id),
        supplier: { id: Number(p.supplier.id), name: p.supplier.name },
        total_amount: Number(p.totalAmount),
        paid_amount: Number(p.paidAmount),
        remaining: Number(p.totalAmount) - Number(p.paidAmount),
        due_date: p.dueDate,
        status: p.status
      })),
      meta: {
        page,
        limit,
        total,
        total_pages: Math.ceil(total / limit)
      }
    };
  }

  static async createSupplierPayment(data: {
    supplier_id: number;
    supplier_payable_id?: number;
    amount: number;
    payment_date: string;
    payment_method: string;
    reference_code?: string;
  }, createdBy: number) {
    if (!data.supplier_id || !data.amount || data.amount <= 0 || !data.payment_date || !data.payment_method) {
      throw new AppError('Thông tin thanh toán không hợp lệ hoặc số tiền <= 0', 400, 'MSG-SPAY-02');
    }

    const supplier = await prisma.supplier.findUnique({ where: { id: data.supplier_id } });
    if (!supplier) {
      throw new AppError('Nhà cung cấp không tồn tại', 404, 'MSG-SPAY-04');
    }

    const result = await prisma.$transaction(async (tx) => {
      let payableStatus = 'paid'; 

      if (data.supplier_payable_id) {
        const payable = await tx.supplierPayable.findUnique({ where: { id: data.supplier_payable_id } });
        if (!payable) {
          throw new AppError('Chứng từ công nợ không tồn tại', 404, 'MSG-SPAY-05');
        }

        const remaining = Number(payable.totalAmount) - Number(payable.paidAmount);
        if (data.amount > remaining) {
          throw new AppError('Số tiền thanh toán vượt quá dư nợ', 409, 'MSG-SPAY-03');
        }

        const newPaidAmount = Number(payable.paidAmount) + data.amount;
        payableStatus = newPaidAmount >= Number(payable.totalAmount) ? 'paid' : 'partial';

        await tx.supplierPayable.update({
          where: { id: data.supplier_payable_id },
          data: {
            paidAmount: newPaidAmount,
            status: payableStatus
          }
        });
      }

      const payment = await tx.supplierPayment.create({
        data: {
          supplierId: data.supplier_id,
          supplierPayableId: data.supplier_payable_id || null,
          amount: data.amount,
          paymentDate: new Date(data.payment_date),
          paymentMethod: data.payment_method,
          referenceCode: data.reference_code,
          createdBy
        }
      });

      return { payment, payableStatus };
    });

    return {
      id: Number(result.payment.id),
      supplier_payable_id: data.supplier_payable_id,
      amount: Number(result.payment.amount),
      payable_status: result.payableStatus
    };
  }
}