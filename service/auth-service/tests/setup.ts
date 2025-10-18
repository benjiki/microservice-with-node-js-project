import { ref } from "process";

// Mock environment variables for testing
process.env.JWT_SECRET = "your_jwt_secret_key";
process.env.JWT_REFRESH_SECRET = "your_jwt_refresh_secret_key";
process.env.JWT_EXPIRES_IN = "15m";
process.env.JWT_REFRESH_EXPIRES_IN = "7d";
process.env.BCRYPT_ROUNDS = "10";
process.env.NODE_ENV = "test";

// Mock database connection for testing

const mockPrismaClient = {
  user: {
    create: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
  refreshToken: {
    create: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    deleteMany: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
  $disconnect: jest.fn(),
  $connect: jest.fn(),
};

// Mock the database module
jest.mock("../src/prisma/database", () => mockPrismaClient);

// mock test utils
declare global {
  // expose the mocked Prisma client on the global object for tests
  var mockPrisma: typeof mockPrismaClient;
}

global.mockPrisma = mockPrismaClient;
