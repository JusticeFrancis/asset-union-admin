import { loadEnvConfig } from "@next/env";
import { connectDb } from "../src/lib/server/db";
import { ensureBootstrapSuperAdmin } from "../src/lib/server/auth";
import { PlatformSetting } from "../src/models";

async function main() {
  loadEnvConfig(process.cwd());
  await connectDb();
  await ensureBootstrapSuperAdmin();
  await PlatformSetting.findOneAndUpdate(
    { key: "platform_financial_settings" },
    { $setOnInsert: { value: { transactionFee: 100, minimumInvestmentAmount: 100 } } },
    { upsert: true },
  );
  console.log("Asset Union admin bootstrap completed.");
  process.exit(0);
}
main().catch((error) => { console.error(error); process.exit(1); });
