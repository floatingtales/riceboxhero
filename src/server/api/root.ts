// import { postRouter } from "@/server/api/routers/post";
import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc";
import { customerRouter } from "./routers/customer";
import { menuRouter } from "./routers/menu";
import { orderRouter } from "./routers/order";
import { pingRouter } from "./routers/ping";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
	// post: postRouter,
	ping: pingRouter,
	order: orderRouter,
	customer: customerRouter,
	menu: menuRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
