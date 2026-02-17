import { TRPCError } from "@trpc/server";
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
});
