import { z } from 'zod';
import {
  OrderStatus,
  PaymentStatus,
  OrderItemSource,
  DepositStatus,
  SettlementStatus,
} from '@prisma/client';

// ============================================================================
// ORDER VALIDATORS
// ============================================================================

export const getOrdersSchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).optional(),
    limit: z.string().regex(/^\d+$/).optional(),
    orderStatus: z.nativeEnum(OrderStatus).optional(),
    paymentStatus: z.nativeEnum(PaymentStatus).optional(),
    search: z.string().optional(),
  }),
});

export const getOrderByIdSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/),
  }),
});

export const createOrderSchema = z.object({
  body: z.object({
    customerId: z.number().int().positive(),
    quotationId: z.number().int().positive().optional(),
    policyId: z.number().int().positive().optional(),
    eventName: z.string().optional(),
    eventType: z.string().min(1),
    eventDate: z.string().datetime(), // ISO datetime string
    location: z.string().min(1),
    guestCount: z.number().int().min(0).optional(),
    items: z
      .array(
        z.object({
          itemId: z.number().int().positive(),
          quantity: z.number().int().positive(),
          unitPrice: z.number().min(0),
          source: z.nativeEnum(OrderItemSource).optional(),
          notes: z.string().optional(),
        }),
      )
      .min(1, 'At least one item is required'),
    notes: z.string().optional(),
  }),
});

export const updateOrderStatusSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/),
  }),
  body: z.object({
    orderStatus: z.nativeEnum(OrderStatus),
    cancelReason: z.string().optional(),
    notes: z.string().optional(),
  }),
});

export const updateOrderItemsSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/),
  }),
  body: z.object({
    items: z
      .array(
        z.object({
          itemId: z.number().int().positive(),
          quantity: z.number().int().positive(),
          unitPrice: z.number().min(0),
          source: z.nativeEnum(OrderItemSource).optional(),
          notes: z.string().optional(),
        }),
      )
      .min(1, 'At least one item is required'),
  }),
});

// ============================================================================
// ORDER WARNING VALIDATORS
// ============================================================================

export const getOrderWarningsSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/),
  }),
});

export const createOrderWarningSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/),
  }),
  body: z.object({
    content: z.string().min(1),
  }),
});

export const resolveOrderWarningSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/), // warningId
  }),
});

// ============================================================================
// DEPOSIT VALIDATORS
// ============================================================================

export const getOrderDepositsSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/),
  }),
});

export const createOrderDepositSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/),
  }),
  body: z.object({
    amount: z.number().min(0),
    paymentMethod: z.string().optional(),
    notes: z.string().optional(),
  }),
});

export const updateDepositStatusSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/), // depositId
  }),
  body: z.object({
    status: z.nativeEnum(DepositStatus),
    notes: z.string().optional(),
  }),
});

// ============================================================================
// SETTLEMENT VALIDATORS
// ============================================================================

export const getOrderSettlementSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/), // orderId
  }),
});

export const createOrderSettlementSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/), // orderId
  }),
  body: z.object({
    additionalFee: z.number().min(0).optional(),
    compensation: z.number().min(0).optional(),
    discount: z.number().min(0).optional(),
    paymentMethod: z.string().optional(),
    notes: z.string().optional(),
  }),
});

export const confirmSettlementSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/), // settlementId
  }),
  body: z.object({
    status: z.nativeEnum(SettlementStatus),
    notes: z.string().optional(),
  }),
});
