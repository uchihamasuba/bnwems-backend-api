import { PrismaClient } from '@prisma/client';
import { mockReset, DeepMockProxy } from 'jest-mock-extended';
import { prisma } from '../config/database';

jest.mock('../config/database', () => {
  const { mockDeep } = require('jest-mock-extended');
  const instance = mockDeep();
  return {
    __esModule: true,
    default: instance,
    prisma: instance,
  };
});

export const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>;

beforeEach(() => {
  mockReset(prismaMock);
});
