import prisma from '../config/database';

export const inventoryService = {
  async checkAvailability(query: { startDate: string; endDate: string; equipmentIds: string }) {
    const ids = query.equipmentIds.split(',').map((id) => parseInt(id.trim(), 10));
    const startDate = new Date(query.startDate);
    const endDate = new Date(query.endDate);

    const results = await Promise.all(
      ids.map(async (equipmentId) => {
        const equipment = await prisma.equipment.findUnique({ where: { id: equipmentId } });
        if (!equipment) return null;

        // Sum reservations that overlap with the requested date range
        const reservations = await prisma.inventoryReservation.findMany({
          where: {
            equipmentId,
            reservedDate: { gte: startDate, lte: endDate },
          },
        });

        const reservedQty = reservations.reduce((acc, r) => acc + r.quantity, 0);
        const availableInStock = equipment.totalInventory - reservedQty;

        return {
          equipmentId,
          totalInventory: equipment.totalInventory,
          reservedQty,
          availableInStock,
          hasConflict: availableInStock <= 0,
        };
      })
    );

    return results.filter(Boolean);
  },

  async createPickList(payload: {
    orderId: number;
    warehouseId: number;
    items: { equipmentId: number; quantity: number }[];
  }) {
    const pickList = await prisma.pickList.create({
      data: {
        orderId: payload.orderId,
        warehouseId: payload.warehouseId,
        pickListItems: {
          create: payload.items.map((item) => ({
            equipmentId: item.equipmentId,
            plannedQuantity: item.quantity,
          })),
        },
      },
      include: { pickListItems: true },
    });

    return pickList;
  },
};
