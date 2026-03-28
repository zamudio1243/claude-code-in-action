import { open } from "sqlite";
import sqlite3 from "sqlite3";

import { createSchema } from "./schema";
import { getPendingOrders } from "./queries/order_queries";
import { sendSlackMessage } from "./slack";

async function main() {
  const db = await open({
    filename: "ecommerce.db",
    driver: sqlite3.Database,
  });

  await createSchema(db);

  const staleOrders = await getPendingOrders(db, 3);

  if (staleOrders.length === 0) return;

  const lines = staleOrders.map(
    (o) =>
      `• Order ${o.order_id} — ${o.customer_name} (${o.phone ?? "no phone"}) — ${Math.floor(o.days_since_created)} days pending`,
  );

  const text = `:warning: *${staleOrders.length} order(s) pending for more than 3 days:*\n${lines.join("\n")}`;

  await sendSlackMessage("#order-alerts", text);
}

main();
