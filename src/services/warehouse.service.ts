import prisma from '../config/database';
import { AppError } from '../middlewares/error.middleware';

export class WarehouseService {
  static async getWarehouses() {
    const w = await prisma.warehouse.findMany({
      orderBy: { id: 'asc' }
    });
    return w.map(x => ({ ...x, id: Number(x.id) }));
  }

  static async updateWarehouse(id: string, data: any) {
    const existing = await prisma.warehouse.findUnique({ where: { id: BigInt(id) } });
    if (!existing) throw new AppError('Kho không tồn tại', 404);

    const w = await prisma.warehouse.update({
      where: { id: BigInt(id) },
      data: {
        name: data.name,
        address: data.address,
        status: data.status
      }
    });

    return { ...w, id: Number(w.id) };
  }

  static async getWarehouseInventory(warehouseId: string) {
    const existing = await prisma.warehouse.findUnique({ where: { id: BigInt(warehouseId) } });
    if (!existing) throw new AppError('Kho không tồn tại', 404);

    const inv = await prisma.inventory.findMany({
      where: { warehouseId: BigInt(warehouseId) },
      include: { catalogItem: true }
    });

    return inv.map(i => ({
      id: Number(i.id),
      catalog_item_id: Number(i.catalogItemId),
      name: i.catalogItem.name,
      quantity_total: Number(i.quantityTotal),
      quantity_available: Number(i.quantityAvailable),
      quantity_reserved: Number(i.quantityReserved),
      location: i.location
    }));
  }
}
