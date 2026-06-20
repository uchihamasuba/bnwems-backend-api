import request from 'supertest';
import app from '../app';
import { prismaMock } from './singleton';
import jwt from 'jsonwebtoken';

const adminToken = jwt.sign({ userId: 1, role: 'Admin' }, process.env.JWT_SECRET || 'secret');
const managerToken = jwt.sign({ userId: 2, role: 'Manager' }, process.env.JWT_SECRET || 'secret');

describe('Module 04: Suppliers API', () => {
  describe('GET /api/v1/suppliers', () => {
    it('should return 200 and list of suppliers', async () => {
      prismaMock.supplier.findMany.mockResolvedValue([{ id: 3n, name: 'Công ty ABC' }] as any);
      const res = await request(app).get('/api/v1/suppliers').set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('POST /api/v1/suppliers', () => {
    it('should return 201 on success', async () => {
      prismaMock.supplier.create.mockResolvedValue({ id: 3n } as any);
      const res = await request(app).post('/api/v1/suppliers').set('Authorization', `Bearer ${adminToken}`).send({
        name: 'Công ty Âm thanh ABC', contact_person: 'Anh Hùng', phone: '0934567890', email: 'abc@supplier.vn', address: '12 Trường Chinh'
      });
      expect(res.status).toBe(201);
    });
  });

  describe('POST /api/v1/supplier-payables', () => {
    it('should return 201 on success', async () => {
      prismaMock.supplier.findUnique.mockResolvedValue({ id: 3n } as any);
      prismaMock.supplierPayable.create.mockResolvedValue({ id: 8n } as any);
      prismaMock.$transaction.mockImplementation(async (callback: any) => callback(prismaMock));
      
      const res = await request(app).post('/api/v1/supplier-payables').set('Authorization', `Bearer ${managerToken}`).send({
        supplier_id: 3, transaction_type: 'purchase', transaction_date: '2026-06-20', due_date: '2026-07-20', items: [{ catalog_item_id: 10, quantity: 5, unit_price: 400000 }]
      });
      expect(res.status).toBe(201);
    });
  });
});
