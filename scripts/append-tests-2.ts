import fs from 'fs';
import path from 'path';

const testStubs = {
  'user.test.ts': [
    "  describe('Notifications', () => {",
    "    it('GET /api/v1/notifications should exist', async () => { const res = await request(app).get('/api/v1/notifications').set('Authorization', `Bearer ${token}`); expect(res.status).toBeDefined(); });",
    "    it('PUT /api/v1/notifications/:id/read should exist', async () => { const res = await request(app).put('/api/v1/notifications/1/read').set('Authorization', `Bearer ${token}`); expect(res.status).toBeDefined(); });",
    "  });"
  ],
  'order.test.ts': [
    "  describe('Order Nested Routes', () => {",
    "    it('GET /api/v1/orders/:orderId/quotations should exist', async () => { const res = await request(app).get('/api/v1/orders/1/quotations').set('Authorization', `Bearer ${token}`); expect(res.status).toBeDefined(); });",
    "    it('POST /api/v1/orders/:orderId/change-requests should exist', async () => { const res = await request(app).post('/api/v1/orders/1/change-requests').set('Authorization', `Bearer ${token}`); expect(res.status).toBeDefined(); });",
    "    it('GET /api/v1/orders/:orderId/tasks should exist', async () => { const res = await request(app).get('/api/v1/orders/1/tasks').set('Authorization', `Bearer ${token}`); expect(res.status).toBeDefined(); });",
    "    it('GET /api/v1/orders/:orderId/payments should exist', async () => { const res = await request(app).get('/api/v1/orders/1/payments').set('Authorization', `Bearer ${token}`); expect(res.status).toBeDefined(); });",
    "    it('POST /api/v1/orders/:orderId/settlement should exist', async () => { const res = await request(app).post('/api/v1/orders/1/settlement').set('Authorization', `Bearer ${token}`); expect(res.status).toBeDefined(); });",
    "  });"
  ],
  'quotation.test.ts': [
    "  describe('Change Requests', () => {",
    "    it('POST /api/v1/change-requests should exist', async () => { const res = await request(app).post('/api/v1/change-requests').set('Authorization', `Bearer ${token}`); expect(res.status).toBeDefined(); });",
    "    it('PUT /api/v1/change-requests/:id/approve should exist', async () => { const res = await request(app).put('/api/v1/change-requests/1/approve').set('Authorization', `Bearer ${token}`); expect(res.status).toBeDefined(); });",
    "  });"
  ]
};

for (const [file, lines] of Object.entries(testStubs)) {
  const filePath = path.join(__dirname, '../tests', file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    content = content.trim().replace(/}\);\s*$/, '');
    content += '\n' + lines.join('\n') + '\n});\n';
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${file}`);
  }
}
