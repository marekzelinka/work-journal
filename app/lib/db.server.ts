import { remember } from "@epic-web/remember";
import { PrismaClient } from "@prisma/client";

export const db = remember("prisma", () => {
  const client = new PrismaClient();
  client.$connect();

  return client;
});
