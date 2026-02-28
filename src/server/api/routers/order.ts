import { TRPCError } from "@trpc/server";
import dayjs from "dayjs";
import { eq, inArray, sql } from "drizzle-orm";
import z from "zod";
import { customer, menu, order, orderItem } from "@/server/db/schema";
import {
	ORDER_STATUS_CONST,
	PAYMENT_METHOD_CONST,
	STATUS_CONST,
} from "@/utils/consts";
import {
	createOrderNumber,
	createOrderNumberPrefix,
} from "@/utils/helpers/createOrderNumber";
import { authedProcedure, createTRPCRouter } from "../trpc";

const PERIOD_CONST = ["day", "week", "month", "year"] as const;

function getOrderPrefixes(
	period: (typeof PERIOD_CONST)[number],
	referenceDate?: Date,
): string[] {
	const ref = dayjs(referenceDate ?? new Date());

	if (period === "year") {
		return [`#${ref.format("YY")}`];
	}

	if (period === "month") {
		return [`#${ref.format("YYMM")}`];
	}

	if (period === "week") {
		const prefixes: string[] = [];
		for (let i = 0; i < 7; i++) {
			prefixes.push(createOrderNumberPrefix(ref.subtract(i, "day").toDate()));
		}
		return prefixes;
	}

	// day
	return [createOrderNumberPrefix(ref.toDate())];
}

export const orderRouter = createTRPCRouter({
	dashboardOverview: authedProcedure.query(async ({ ctx }) => {
		const today = new Date();
		today.setHours(0, 0, 0, 0);
		const prevWeek = new Date(today);
		prevWeek.setDate(today.getDate() - 7);

		try {
			const orders = await ctx.db.query.order.findMany({
				where: (order, { and, gte, lt, not, eq }) =>
					and(
						not(eq(order.orderStatus, "voided")),
						gte(order.createdAt, prevWeek),
						lt(order.createdAt, today),
					),
				columns: { id: true, total: true },
			});

			const total = orders.reduce((acc, order) => acc + order.total, 0);
			const count = orders.length;
			const averageOrder = total / count;

			const formattedTotal = `Rp. ${(total / 1000).toLocaleString("id-ID")} k`;
			return { total: formattedTotal, count, averageOrder };
		} catch (_e) {
			throw new TRPCError({
				code: "INTERNAL_SERVER_ERROR",
				message: "Failed to fetch orders",
			});
		}
	}),
	dayOverview: authedProcedure.query(async ({ ctx }) => {
		const today = new Date();
		today.setHours(0, 0, 0, 0);
		const tomorrow = new Date(today);
		tomorrow.setDate(today.getDate() + 1);

		try {
			const orders = await ctx.db.query.order.findMany({
				where: (order, { and, gte, lt, not, eq }) =>
					and(
						not(eq(order.orderStatus, "voided")),
						gte(order.createdAt, today),
						lt(order.createdAt, tomorrow),
					),
				columns: { id: true, total: true },
			});

			const total = orders.reduce((acc, order) => acc + order.total, 0);
			const count = orders.length;

			const formattedTotal = `Rp. ${(total / 1000).toLocaleString("id-ID")} k`;
			return { total: formattedTotal, count };
		} catch (_e) {
			throw new TRPCError({
				code: "INTERNAL_SERVER_ERROR",
				message: "Failed to fetch orders",
			});
		}
	}),
	orders: authedProcedure
		.input(
			z.object({
				date: z.date().optional(),
				todayOnly: z.boolean(),
			}),
		)
		.query(async ({ input, ctx }) => {
			const date = input.date ?? new Date();
			const prefix = createOrderNumberPrefix(date);

			try {
				const orders = await ctx.db.query.order.findMany({
					where: (order, { like, notLike, and, eq, or }) =>
						input.todayOnly
							? like(order.orderNumber, `${prefix}%`)
							: and(
									notLike(order.orderNumber, `${prefix}%`),
									or(
										eq(order.orderStatus, "pending"),
										eq(order.orderStatus, "paid"),
									),
								),
					columns: {
						id: true,
						orderNumber: true,
						orderedAt: true,
						orderStatus: true,
						total: true,
						orderNote: true,
					},
					with: {
						customer: {
							columns: {
								id: true,
								name: true,
								phone: true,
								address: true,
							},
						},
						admin: {
							columns: {
								username: true,
							},
						},
						orderItems: {
							columns: {
								id: true,
								amount: true,
							},
							with: {
								menuItem: {
									columns: {
										name: true,
									},
								},
							},
						},
					},
				});

				return orders;
			} catch (_e) {
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Failed to fetch orders",
				});
			}
		}),
	addOrder: authedProcedure
		.input(
			z.object({
				customerId: z.string().uuid(),
				orderItems: z.array(
					z.object({
						menuId: z.string().uuid(),
						amount: z.number().int().positive(),
						grossPrice: z.number().positive(),
						discount: z.number().nonnegative(),
						discountRate: z.number().nonnegative(),
						totalPrice: z.number().positive(),
					}),
				),
				orderValues: z.object({
					subtotal: z.number().positive(),
					discount: z.number().nonnegative(),
					discountRate: z.number().nonnegative(),
					serviceCharge: z.number().nonnegative(),
					serviceChargeRate: z.number().nonnegative(),
					tax: z.number().nonnegative(),
					taxRate: z.number().nonnegative(),
					adjustment: z.number().nonnegative(),
					total: z.number().positive(),
				}),
				orderNote: z.string().optional(),
				paymentMethod: z.enum(PAYMENT_METHOD_CONST).optional(),
			}),
		)
		.mutation(async ({ input, ctx }) => {
			const { customerId, orderItems, orderValues, orderNote, paymentMethod } =
				input;
			const {
				subtotal,
				discount,
				discountRate,
				serviceCharge,
				serviceChargeRate,
				tax,
				taxRate,
				adjustment,
				total,
			} = orderValues;
			const transaction = await ctx.db.transaction(async (tx) => {
				const today = new Date();
				const prefix = createOrderNumberPrefix(today);

				const lastOrder = await tx.query.order.findFirst({
					where: (order, { like }) => like(order.orderNumber, `${prefix}%`),
					orderBy: (order, { desc }) => [desc(order.orderNumber)],
					columns: { orderNumber: true },
				});

				let currentCount = 0;
				if (lastOrder) {
					const parts = lastOrder.orderNumber.split("/");
					if (parts.length === 2) {
						const count = parseInt(parts[1] as string, 10);
						if (!Number.isNaN(count)) {
							currentCount = count;
						}
					}
				}

				const orderNumber = createOrderNumber({
					count: currentCount,
					date: today,
				});

				const created = await tx
					.insert(order)
					.values({
						customerId,
						adminId: ctx.userId,
						orderNumber,
						subtotal,
						discount,
						discountRate,
						serviceCharge,
						serviceChargeRate,
						tax,
						taxRate,
						adjustment,
						total,
						orderNote,
						paymentMethod: paymentMethod ?? null,
					})
					.returning({ id: order.id });

				const createdOrder = created[0];

				if (!createdOrder) {
					tx.rollback();
					throw new TRPCError({
						code: "INTERNAL_SERVER_ERROR",
						message: "Failed to create order",
					});
				}

				const { id: createdId } = createdOrder;

				const orderItemsToInsert = orderItems.map((item) => ({
					orderId: createdId,
					menuId: item.menuId,
					amount: item.amount,
					grossPrice: item.grossPrice,
					discount: item.discount,
					discountRate: item.discountRate,
					totalPrice: item.totalPrice,
				}));

				await tx.insert(orderItem).values(orderItemsToInsert);

				return { id: createdId, orderNumber };
			});

			return {
				status: STATUS_CONST.ALERT,
				message: `Order ${transaction.orderNumber} created successfully`,
			};
		}),
	seeOrderDetail: authedProcedure
		.input(z.object({ id: z.string().uuid() }))
		.query(async ({ input, ctx }) => {
			const { id } = input;
			try {
				const order = await ctx.db.query.order.findFirst({
					where: (order, { eq }) => eq(order.id, id),
					columns: {
						id: true,
						orderNumber: true,
						orderedAt: true,
						orderStatus: true,
						paymentMethod: true,
						total: true,
						orderNote: true,
						discountRate: true,
						serviceChargeRate: true,
						taxRate: true,
					},
					with: {
						customer: {
							columns: {
								id: true,
								name: true,
								phone: true,
								address: true,
							},
						},
						admin: {
							columns: {
								id: true,
								username: true,
							},
						},
						orderItems: {
							columns: {
								menuId: true,
								amount: true,
								grossPrice: true,
								discount: true,
								discountRate: true,
								totalPrice: true,
							},
							with: {
								menuItem: {
									columns: {
										name: true,
									},
								},
							},
						},
					},
				});

				return order;
			} catch (_e) {
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Failed to fetch order",
				});
			}
		}),
	updateOrderStatus: authedProcedure
		.input(
			z.object({
				id: z.string().uuid(),
				orderStatus: z.enum(ORDER_STATUS_CONST),
				paymentMethod: z.enum(PAYMENT_METHOD_CONST).optional(),
			}),
		)
		.mutation(async ({ input, ctx }) => {
			const { id, orderStatus, paymentMethod } = input;
			try {
				await ctx.db
					.update(order)
					.set({
						orderStatus,
						...(paymentMethod ? { paymentMethod } : {}),
					})
					.where(eq(order.id, id));
				return {
					status: STATUS_CONST.ALERT,
					message: "Order status updated successfully",
				};
			} catch (_e) {
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Failed to update order status",
				});
			}
		}),
	updatePendingOrder: authedProcedure
		.input(
			z.object({
				id: z.string().uuid(),
				customerId: z.string().uuid(),
				orderItems: z.array(
					z.object({
						menuId: z.string().uuid(),
						amount: z.number().int().positive(),
						grossPrice: z.number().positive(),
						discount: z.number().nonnegative(),
						discountRate: z.number().nonnegative(),
						totalPrice: z.number().positive(),
					}),
				),
				orderValues: z.object({
					subtotal: z.number().positive(),
					discount: z.number().nonnegative(),
					discountRate: z.number().nonnegative(),
					serviceCharge: z.number().nonnegative(),
					serviceChargeRate: z.number().nonnegative(),
					tax: z.number().nonnegative(),
					taxRate: z.number().nonnegative(),
					adjustment: z.number().nonnegative(),
					total: z.number().positive(),
				}),
				orderNote: z.string().optional(),
				orderStatus: z.enum(["paid", "voided"]).optional(),
				paymentMethod: z.enum(PAYMENT_METHOD_CONST).optional(),
			}),
		)
		.mutation(async ({ input, ctx }) => {
			const {
				id,
				customerId,
				orderItems,
				orderValues,
				orderNote,
				orderStatus,
				paymentMethod,
			} = input;
			const {
				subtotal,
				discount,
				discountRate,
				serviceCharge,
				serviceChargeRate,
				tax,
				taxRate,
				adjustment,
				total,
			} = orderValues;

			if (orderStatus === "paid" && !paymentMethod) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "Payment method is required when marking an order as paid",
				});
			}

			try {
				await ctx.db.transaction(async (tx) => {
					// Delete existing items and replace with new
					await tx.delete(orderItem).where(eq(orderItem.orderId, id));

					await tx.insert(orderItem).values(
						orderItems.map((item) => ({
							orderId: id,
							menuId: item.menuId,
							amount: item.amount,
							grossPrice: item.grossPrice,
							discount: item.discount,
							discountRate: item.discountRate,
							totalPrice: item.totalPrice,
						})),
					);

					await tx
						.update(order)
						.set({
							customerId,
							subtotal,
							discount,
							discountRate,
							serviceCharge,
							serviceChargeRate,
							tax,
							taxRate,
							adjustment,
							total,
							orderNote: orderNote ?? null,
							paymentMethod: paymentMethod ?? null,
							...(orderStatus ? { orderStatus } : {}),
						})
						.where(eq(order.id, id));
				});

				return {
					status: STATUS_CONST.ALERT,
					message: "Order updated successfully",
				};
			} catch (_e) {
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Failed to update order",
				});
			}
		}),
	periodOverview: authedProcedure
		.input(
			z.object({
				period: z.enum(PERIOD_CONST),
				referenceDate: z.date().optional(),
			}),
		)
		.query(async ({ input, ctx }) => {
			const prefixes = getOrderPrefixes(input.period, input.referenceDate);

			try {
				const orders = await ctx.db.query.order.findMany({
					where: (order, { or, like, and, not, eq }) =>
						and(
							not(eq(order.orderStatus, "voided")),
							or(...prefixes.map((p) => like(order.orderNumber, `${p}%`))),
						),
					columns: { id: true, total: true },
				});

				const total = orders.reduce((acc, o) => acc + o.total, 0);
				const orderCount = orders.length;
				const averageOrder = orderCount > 0 ? total / orderCount : 0;

				return {
					total: `Rp. ${total.toLocaleString("id-ID")}`,
					count: orderCount,
					averageOrder: `Rp. ${Math.round(averageOrder).toLocaleString("id-ID")}`,
				};
			} catch (_e) {
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Failed to fetch period overview",
				});
			}
		}),
	recentOrders: authedProcedure.query(async ({ ctx }) => {
		const todayPrefix = createOrderNumberPrefix(new Date());

		try {
			const orders = await ctx.db.query.order.findMany({
				where: (order, { like }) => like(order.orderNumber, `${todayPrefix}%`),
				columns: {
					id: true,
					orderNumber: true,
					orderStatus: true,
					total: true,
					orderedAt: true,
				},
				with: {
					customer: {
						columns: { name: true },
					},
				},
				orderBy: (order, { desc }) => [desc(order.orderedAt)],
				limit: 10,
			});

			return orders;
		} catch (_e) {
			throw new TRPCError({
				code: "INTERNAL_SERVER_ERROR",
				message: "Failed to fetch recent orders",
			});
		}
	}),
	topSellingItems: authedProcedure
		.input(
			z.object({
				period: z.enum(PERIOD_CONST),
				referenceDate: z.date().optional(),
			}),
		)
		.query(async ({ input, ctx }) => {
			const prefixes = getOrderPrefixes(input.period, input.referenceDate);

			try {
				// First get all order IDs matching the period
				const periodOrders = await ctx.db.query.order.findMany({
					where: (order, { or, like, and, not, eq }) =>
						and(
							not(eq(order.orderStatus, "voided")),
							or(...prefixes.map((p) => like(order.orderNumber, `${p}%`))),
						),
					columns: { id: true },
				});

				const orderIds = periodOrders.map((o) => o.id);

				if (orderIds.length === 0) {
					return [];
				}

				// Aggregate order items for those orders
				const results = await ctx.db
					.select({
						menuId: orderItem.menuId,
						menuName: menu.name,
						totalSold: sql<number>`COALESCE(SUM(${orderItem.amount}), 0)::int`,
					})
					.from(orderItem)
					.innerJoin(menu, eq(orderItem.menuId, menu.id))
					.where(inArray(orderItem.orderId, orderIds))
					.groupBy(orderItem.menuId, menu.name)
					.orderBy(sql`SUM(${orderItem.amount}) DESC`)
					.limit(5);

				return results;
			} catch (_e) {
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Failed to fetch top selling items",
				});
			}
		}),
	topCustomers: authedProcedure
		.input(
			z.object({
				period: z.enum(PERIOD_CONST),
				referenceDate: z.date().optional(),
			}),
		)
		.query(async ({ input, ctx }) => {
			const prefixes = getOrderPrefixes(input.period, input.referenceDate);

			try {
				const results = await ctx.db
					.select({
						customerId: order.customerId,
						customerName: customer.name,
						orderCount: sql<number>`COUNT(${order.id})::int`,
						totalSpent: sql<number>`COALESCE(SUM(${order.total}), 0)::numeric(15,2)`,
					})
					.from(order)
					.innerJoin(customer, eq(order.customerId, customer.id))
					.where(
						sql`${order.orderStatus} != 'voided' AND (${sql.join(
							prefixes.map((p) => sql`${order.orderNumber} LIKE ${`${p}%`}`),
							sql` OR `,
						)})`,
					)
					.groupBy(order.customerId, customer.name)
					.orderBy(sql`SUM(${order.total}) DESC`)
					.limit(5);

				return results.map((r) => ({
					...r,
					totalSpent: Number(r.totalSpent),
				}));
			} catch (_e) {
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Failed to fetch top customers",
				});
			}
		}),
	paymentMethodBreakdown: authedProcedure
		.input(
			z.object({
				period: z.enum(PERIOD_CONST),
				referenceDate: z.date().optional(),
			}),
		)
		.query(async ({ input, ctx }) => {
			const prefixes = getOrderPrefixes(input.period, input.referenceDate);

			try {
				const results = await ctx.db
					.select({
						paymentMethod: order.paymentMethod,
						count: sql<number>`COUNT(${order.id})::int`,
						total: sql<number>`COALESCE(SUM(${order.total}), 0)::numeric(15,2)`,
					})
					.from(order)
					.where(
						sql`${order.orderStatus} != 'voided' AND (${sql.join(
							prefixes.map((p) => sql`${order.orderNumber} LIKE ${`${p}%`}`),
							sql` OR `,
						)})`,
					)
					.groupBy(order.paymentMethod)
					.orderBy(sql`SUM(${order.total}) DESC`);

				return results.map((r) => ({
					paymentMethod: r.paymentMethod ?? "unset",
					count: r.count,
					total: Number(r.total),
				}));
			} catch (_e) {
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Failed to fetch payment method breakdown",
				});
			}
		}),
	menuTypeBreakdown: authedProcedure
		.input(
			z.object({
				period: z.enum(PERIOD_CONST),
				referenceDate: z.date().optional(),
			}),
		)
		.query(async ({ input, ctx }) => {
			const prefixes = getOrderPrefixes(input.period, input.referenceDate);

			try {
				// Get non-voided order IDs for the period
				const periodOrders = await ctx.db.query.order.findMany({
					where: (order, { or, like, and, not, eq }) =>
						and(
							not(eq(order.orderStatus, "voided")),
							or(...prefixes.map((p) => like(order.orderNumber, `${p}%`))),
						),
					columns: { id: true },
				});

				const orderIds = periodOrders.map((o) => o.id);

				if (orderIds.length === 0) {
					return [];
				}

				const results = await ctx.db
					.select({
						menuType: menu.type,
						count: sql<number>`COALESCE(SUM(${orderItem.amount}), 0)::int`,
						total: sql<number>`COALESCE(SUM(${orderItem.totalPrice}), 0)::numeric(15,2)`,
					})
					.from(orderItem)
					.innerJoin(menu, eq(orderItem.menuId, menu.id))
					.where(inArray(orderItem.orderId, orderIds))
					.groupBy(menu.type)
					.orderBy(sql`SUM(${orderItem.amount}) DESC`);

				return results.map((r) => ({
					menuType: r.menuType,
					count: r.count,
					total: Number(r.total),
				}));
			} catch (_e) {
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Failed to fetch menu type breakdown",
				});
			}
		}),
});
