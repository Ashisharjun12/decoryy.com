import DbFactory from "@/infrastructure/database/db.factory.js";

export async function db(): Promise<void> {
  await DbFactory.connectAppDatabase();
  await DbFactory.connectAI();
}