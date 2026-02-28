import { relations } from "drizzle-orm";
import { index } from "drizzle-orm/pg-core";
import { orderStatusEnum, paymentMethodEnum } from "./_enum";
import { createTable } from "./_helper";
import { admin } from "./admin";
import { customer } from "./customer";
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
		orderStatus: orderStatusEnum().notNull().default("pending"),
		paymentMethod: paymentMethodEnum(),
		orderedAt: d.timestamp({ withTimezone: true }).notNull().defaultNow(),
		subtotal: d.numeric({ precision: 15, scale: 2, mode: "number" }).notNull(),
		discount: d
			.numeric({ precision: 15, scale: 2, mode: "number" })
			.notNull()
			.default(0),
		discountRate: d
			.numeric({ precision: 5, scale: 2, mode: "number" })
			.notNull()
			.default(0),
		serviceCharge: d
			.numeric({ precision: 15, scale: 2, mode: "number" })
			.notNull()
			.default(0),
		serviceChargeRate: d
			.numeric({ precision: 15, scale: 2, mode: "number" })
			.notNull()
			.default(0),
		tax: d
			.numeric({ precision: 15, scale: 2, mode: "number" })
			.notNull()
			.default(0),
		taxRate: d
			.numeric({ precision: 5, scale: 2, mode: "number" })
			.notNull()
			.default(0),
		adjustment: d
			.numeric({ precision: 15, scale: 2, mode: "number" })
			.notNull()
			.default(0),
		total: d.numeric({ precision: 15, scale: 2, mode: "number" }).notNull(),
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
