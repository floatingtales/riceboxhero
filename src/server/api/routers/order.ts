import { TRPCError } from "@trpc/server";
import z from "zod";
import { order, orderItem } from "@/server/db/schema";
import { STATUS_CONST } from "@/utils/consts";
import {
	createOrderNumber,
	createOrderNumberPrefix,
} from "@/utils/helpers/createOrderNumber";
import { authedProcedure, createTRPCRouter } from "../trpc";

export const orderRouter = createTRPCRouter({
	dayOverview: authedProcedure.query(async ({ ctx }) => {
		const today = new Date();
		today.setHours(0, 0, 0, 0);
		const tomorrow = new Date(today);
		tomorrow.setDate(today.getDate() + 1);

		try {
			const orders = await ctx.db.query.order.findMany({
				where: (order, { and, gte, lt }) =>
					and(gte(order.createdAt, today), lt(order.createdAt, tomorrow)),
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
	dayOrders: authedProcedure
		.input(
			z.object({
				date: z.date(),
			}),
		)
		.query(async ({ input, ctx }) => {
			const { date } = input;
			const prefix = createOrderNumberPrefix(date);

			try {
				const orders = await ctx.db.query.order.findMany({
					where: (order, { like }) => like(order.orderNumber, `${prefix}%`),
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
			}),
		)
		.mutation(async ({ input, ctx }) => {
			const { customerId, orderItems, orderValues, orderNote } = input;
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
});
