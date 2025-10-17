import { AuthTokens, JwtPayload, ServiceError } from "../../../shared/types";
import { createServiceError } from "../../../shared/utils";
import prisma from "../prisma/database";
import bcrypt from "bcryptjs";
import jwt, { SignOptions } from "jsonwebtoken";
import { StringValue } from "ms";

export class AuthService {
  // AuthService implementation
  private readonly jwtSecret: string;
  private readonly jwtRefreshSecret: string;
  private readonly jwtExpiresIn: string;
  private readonly jwtRefreshExpiresIn: string;
  private readonly bcryptRounds: number;

  constructor() {
    this.jwtSecret = process.env.JWT_SECRET!;
    this.jwtRefreshSecret = process.env.JWT_REFRESH_SECRET!;
    this.jwtExpiresIn = process.env.JWT_EXPIRES_IN || "15m";
    this.jwtRefreshExpiresIn = process.env.JWT_REFRESH_EXPIRES_IN || "7d";
    this.bcryptRounds = parseInt(process.env.BCRYPT_ROUNDS || "10", 10);

    if (!this.jwtSecret || !this.jwtRefreshSecret) {
      throw new Error("JWT secrets must be defined in environment variables");
    }
  }

  async register(email: string, password: string): Promise<AuthTokens> {
    // check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email },
    });
    if (existingUser) {
      throw createServiceError("User already exists", 400);
    }
    const hashedPassword = await bcrypt.hash(password, this.bcryptRounds);

    // create the user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
      },
    });

    //generate tokens
    return this.generateTokens(user.id, user.email);
  }

  async login(email: string, password: string): Promise<AuthTokens> {
    // find the user
    const user = await prisma.user.findUnique({
      where: { email: email },
    });
    if (!user) {
      throw createServiceError("Invalid email or password", 401);
    }

    //verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw createServiceError("Invalid email or password", 401);
    }
    //generate tokens
    return this.generateTokens(user.id, user.email);
  }

  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    try {
      // Verify the refresh token
      const decoded = jwt.verify(
        refreshToken,
        this.jwtRefreshSecret
      ) as JwtPayload;
      // Check if the refresh token exists in the database
      const storedToken = await prisma.refreshToken.findUnique({
        where: { token: refreshToken },
        include: { user: true },
      });
      if (!storedToken || storedToken.expiresAt < new Date()) {
        throw createServiceError("Invalid refresh token", 401);
      }

      // Generate new tokens
      const tokens = await this.generateTokens(
        storedToken.userId,
        storedToken.user.email
      );

      // Delete the old refresh token
      await prisma.refreshToken.delete({
        where: { id: storedToken.id },
      });
      return tokens;
    } catch (error) {
      if (error instanceof ServiceError) {
        throw error;
      }
      throw createServiceError("Invalid refresh token", 401);
    }
  }

  async logout(refreshToken: string): Promise<void> {
    // Delete the refresh token from the database
    await prisma.refreshToken.deleteMany({
      where: { token: refreshToken },
    });
  }

  async validateToken(token: string): Promise<JwtPayload> {
    try {
      const decoded = jwt.verify(token, this.jwtSecret) as JwtPayload;

      // check if user exists
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
      });

      if (!user) {
        throw createServiceError("User not found", 404);
      }

      return decoded;
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        throw createServiceError("Invalid token", 401);
      }
      throw createServiceError("Token validation failed", 500, error);
    }
  }

  private async generateTokens(
    userId: string,
    email: string
  ): Promise<AuthTokens> {
    const payload = { userId, email };

    //generate access token
    const accessTokensOptions: SignOptions = {
      expiresIn: this.jwtExpiresIn as StringValue,
    };

    const accessToken = jwt.sign(
      payload,
      this.jwtSecret,
      accessTokensOptions
    ) as string;

    // Generate Refresh token
    const refreshTokenOptions: SignOptions = {
      expiresIn: this.jwtRefreshExpiresIn as StringValue,
    };

    const refreshToken = jwt.sign(
      payload,
      this.jwtRefreshSecret,
      refreshTokenOptions
    ) as string;

    // Store refresh token in the database
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await prisma.refreshToken.create({
      data: {
        userId,
        token: refreshToken,
        expiresAt,
      },
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  async getUserById(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    if (!user) {
      throw createServiceError("User not found", 404);
    }
    return user;
  }

  async deleteUser(userId: string): Promise<void> {
    await prisma.user.delete({
      where: { id: userId },
    });
  }
}
