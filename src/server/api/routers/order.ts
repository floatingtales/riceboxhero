import { TRPCError } from "@trpc/server";
import z from "zod";
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
			const today = new Date(date);
			today.setHours(0, 0, 0, 0);
			const tomorrow = new Date(today);
			tomorrow.setDate(today.getDate() + 1);

			try {
				const orders = await ctx.db.query.order.findMany({
					where: (order, { and, gte, lt }) =>
						and(gte(order.orderedAt, today), lt(order.orderedAt, tomorrow)),
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
});
