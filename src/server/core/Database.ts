import "dotenv/config";
import { neonConfig } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "@prisma/client";
import ws from "ws";

export class Database {
  private static instance: Database | null = null;
  public readonly client: PrismaClient;

  private constructor() {
    this.client = this.createClient();
  }

  public static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  private createClient(): PrismaClient {
    const url = process.env.DATABASE_URL ?? "";
    const useNeon = url.includes("neon.tech") || process.env.USE_NEON_ADAPTER === "true";

    if (useNeon) {
      neonConfig.webSocketConstructor = ws;
      const adapter = new PrismaNeon({ connectionString: url });
      return new PrismaClient({ adapter });
    }

    return new PrismaClient();
  }

  public async healthCheck(): Promise<boolean> {
    await this.client.$queryRaw`SELECT 1`;
    return true;
  }

  public async disconnect(): Promise<void> {
    await this.client.$disconnect();
  }
}

export const db = Database.getInstance();
