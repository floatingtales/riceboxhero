import { relations } from "drizzle-orm";
import { createTable } from "./_helper";
import { order } from "./order";

export const admin = createTable("admin", (d) => ({
  id: d.uuid().primaryKey().defaultRandom(),
  username: d.text().unique().notNull(),
  password: d.text().notNull(),
  createdAt: d
    .timestamp({ withTimezone: true })
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
}));

export const adminRelations = relations(admin, ({ many }) => ({
  orders: many(order),
}));
