import { relations } from "drizzle-orm";
import { menuTypeEnum } from "./_enum";
import { createTable } from "./_helper";
import { orderItem } from "./order-item";

export const menu = createTable("menu", (d) => ({
  id: d.uuid().primaryKey().defaultRandom(),
  name: d.text().notNull(),
  type: menuTypeEnum().notNull(),
  standardPrice: d.numeric({ precision: 15, scale: 2, mode: "number" }),
  createdAt: d
    .timestamp({ withTimezone: true })
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
}));

export const menuRelations = relations(menu, ({ many }) => ({
  orderItems: many(orderItem),
}));
