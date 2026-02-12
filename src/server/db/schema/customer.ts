import { relations } from "drizzle-orm";
import { createTable } from "./_helper";
import { order } from "./order";

export const customer = createTable("customer", (d) => ({
  id: d.uuid().primaryKey().defaultRandom(),
  name: d.text().notNull(),
  phone: d.text().notNull(),
  address: d.text().notNull(),
  createdAt: d
    .timestamp({ withTimezone: true })
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
}));

export const customerRelations = relations(customer, ({ many }) => ({
  orders: many(order),
}));
