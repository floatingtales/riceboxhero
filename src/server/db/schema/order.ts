import { index } from "drizzle-orm/pg-core";
import { createTable } from "./_helper";
import { customer } from "./customer";
import { admin } from "./admin";
import { relations } from "drizzle-orm";
import { orderItem } from "./order-item";

export const order = createTable(
  "order",
  (d) => ({
    id: d.uuid().primaryKey().defaultRandom(),
    customerId: d
      .uuid()
      .notNull()
      .references(() => customer.id),
    adminId: d
      .uuid()
      .notNull()
      .references(() => admin.id),
    orderNumber: d.text().notNull(),
    orderedAt: d.timestamp({ withTimezone: true }).notNull().defaultNow(),
    grossPrice: d.numeric({ precision: 15, scale: 2, mode: "number" }),
    discount: d.numeric({ precision: 15, scale: 2, mode: "number" }),
    discountRate: d.numeric({ precision: 5, scale: 2, mode: "number" }),
    serviceCharge: d.numeric({ precision: 15, scale: 2, mode: "number" }),
    serviceChargeRate: d.numeric({ precision: 15, scale: 2, mode: "number" }),
    tax: d.numeric({ precision: 15, scale: 2, mode: "number" }),
    taxRate: d.numeric({ precision: 5, scale: 2, mode: "number" }),
    orderNote: d.text(),
    createdAt: d
      .timestamp({ withTimezone: true })
      .$defaultFn(() => new Date())
      .notNull(),
    updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
  }),
  (t) => [index().on(t.customerId), index().on(t.adminId)],
);

export const orderRelations = relations(order, ({ one, many }) => ({
  orderItems: many(orderItem),
  customer: one(customer, {
    fields: [order.customerId],
    references: [customer.id],
  }),
  admin: one(admin, {
    fields: [order.adminId],
    references: [admin.id],
  }),
}));
