import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'test_secret';

export const generateTestToken = (payload: object = { userId: 'test-user-id', role: 'ADMIN' }) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
};
