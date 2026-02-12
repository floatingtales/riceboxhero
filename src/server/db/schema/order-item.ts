import { index } from "drizzle-orm/pg-core";
import { createTable } from "./_helper";
import { order } from "./order";
import { menu } from "./menu";
import { relations } from "drizzle-orm";

export const orderItem = createTable(
  "order_item",
  (d) => ({
    id: d.uuid().primaryKey().defaultRandom(),
    orderId: d
      .uuid()
      .notNull()
      .references(() => order.id),
    menuId: d
      .uuid()
      .notNull()
      .references(() => menu.id),
    amout: d.numeric({ precision: 5, scale: 2, mode: "number" }),
    grossPrice: d.numeric({ precision: 15, scale: 2, mode: "number" }),
    discount: d.numeric({ precision: 15, scale: 2, mode: "number" }),
    discountRate: d.numeric({ precision: 5, scale: 2, mode: "number" }),
    totalPrice: d.numeric({ precision: 15, scale: 2, mode: "number" }),
    createdAt: d
      .timestamp({ withTimezone: true })
      .$defaultFn(() => new Date())
      .notNull(),
    updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
  }),
  (t) => [index().on(t.orderId), index().on(t.menuId)],
);

export const orderItemRelations = relations(orderItem, ({ one }) => ({
  menuItem: one(menu, {
    fields: [orderItem.menuId],
    references: [menu.id],
  }),
  order: one(order, {
    fields: [orderItem.orderId],
    references: [order.id],
  }),
}));
