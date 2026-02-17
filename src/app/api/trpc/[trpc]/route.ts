import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { cookies } from "next/headers";
import type { NextRequest } from "next/server";
import { env } from "@/env";
import { appRouter } from "@/server/api/root";
import { createTRPCContext } from "@/server/api/trpc";

/**
 * This wraps the `createTRPCContext` helper and provides the required context for the tRPC API when
 * handling a HTTP request (e.g. when you make requests from Client Components).
 */
const createContext = async (
	req: NextRequest,
	cookieStore: Awaited<ReturnType<typeof cookies>>,
) => {
	return createTRPCContext({
		headers: req.headers,
		req,
		cookieStore,
	});
};

const handler = async (req: NextRequest) => {
	const cookieStore = await cookies();
	// console.log("[TRPC ROUTE] cookieStore methods:", Object.keys(cookieStore));
	return fetchRequestHandler({
		endpoint: "/api/trpc",
		req,
		router: appRouter,
		createContext: () => createContext(req, cookieStore),
		onError:
			env.NODE_ENV === "development"
				? ({ path, error }) => {
						console.error(
							`❌ tRPC failed on ${path ?? "<no-path>"}: ${error.message}`,
						);
					}
				: undefined,
	});
};

export { handler as GET, handler as POST };
