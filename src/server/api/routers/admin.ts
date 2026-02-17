import { TRPCError } from "@trpc/server";
import * as bcrypt from "bcrypt";
import { eq, not } from "drizzle-orm";
import z from "zod";
import { admin } from "@/server/db/schema";
import { authedProcedure, createTRPCRouter } from "../trpc";

export const adminRouter = createTRPCRouter({
	getAll: authedProcedure.query(async ({ ctx }) => {
		const users = await ctx.db.query.admin.findMany({
			columns: { id: true, username: true, isActive: true },
			orderBy: (admin, { desc }) => [desc(admin.username)],
		});
		return users;
	}),
	add: authedProcedure
		.input(
			z.object({
				username: z.string(),
				password: z.string(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const { username, password } = input;
			const cleanedUsername = username.trim();
			const passwordHash = await bcrypt.hash(password, 15);
			try {
				await ctx.db.insert(admin).values({
					username: cleanedUsername,
					password: passwordHash,
				});
				return { success: true };
			} catch (_e) {
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Failed to add admin",
				});
			}
		}),
	edit: authedProcedure
		.input(
			z.object({ id: z.string(), username: z.string(), password: z.string() }),
		)
		.mutation(async ({ ctx, input }) => {
			const { id, username, password } = input;
			const cleanedUsername = username.trim();
			const passwordHash = await bcrypt.hash(password, 15);
			try {
				await ctx.db
					.update(admin)
					.set({ username: cleanedUsername, password: passwordHash })
					.where(eq(admin.id, id));
				await ctx.cache.deleteAuthorized({ id });
				return { success: true };
			} catch (_e) {
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Failed to edit admin",
				});
			}
		}),
	toggleActive: authedProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ ctx, input }) => {
			const { id } = input;
			try {
				await ctx.db
					.update(admin)
					.set({ isActive: not(admin.isActive) })
					.where(eq(admin.id, id));
				await ctx.cache.deleteAuthorized({ id });
				return { success: true };
			} catch (_e) {
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Failed to toggle admin status",
				});
			}
		}),
});
