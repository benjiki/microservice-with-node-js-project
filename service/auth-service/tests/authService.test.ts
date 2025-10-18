import { AuthService } from "../src/authService";

// Mock external dependencies and setup for tests
jest.mock("bycryptjs", () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

jest.mock("jsonwebtoken", () => ({
  sign: jest.fn(),
  verify: jest.fn(),
}));

jest.mock("uuid", () => ({
  v4: jest.fn(),
}));

// import mocked module
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";

describe("AuthService", () => {
  let authService: AuthService;
});
