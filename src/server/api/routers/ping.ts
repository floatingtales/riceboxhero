import { sql } from "drizzle-orm";
import { COOKIE_CONST, STATUS_CONST } from "@/utils/consts";
import { authedProcedure, createTRPCRouter, publicProcedure } from "../trpc";

export const pingRouter = createTRPCRouter({
	ping: publicProcedure.query(async ({ ctx }) => {
		console.log("pinging cache");
		const cachePingResult = await ctx.cache.ping();
		console.log(`success ping ${cachePingResult}`);

		console.log("pinging db");
		const dbPingResult = await ctx.db.execute(sql`SELECT 1`);
		console.log(`success ping ${dbPingResult}`);
		return { status: STATUS_CONST.ALERT, message: "Ping Success" };
	}),
	testMutation: authedProcedure.mutation(async ({ ctx }) => {
		console.log("testMutation");
		console.log(ctx.req.cookies.get(COOKIE_CONST.AUTHORIZED));
		return { status: STATUS_CONST.ALERT, message: "Mutation Success" };
	}),
});
