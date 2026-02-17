import { TRPCError } from "@trpc/server";
import { eq, not } from "drizzle-orm";
import z from "zod";
import { menu } from "@/server/db/schema";
import { MENU_TYPE_CONST } from "@/utils/consts";
import { authedProcedure, createTRPCRouter } from "../trpc";

export const menuRouter = createTRPCRouter({
	getAll: authedProcedure.query(async ({ ctx }) => {
		try {
			const menus = await ctx.db.query.menu.findMany({
				columns: {
					id: true,
					name: true,
					type: true,
					standardPrice: true,
					isActive: true,
				},
				orderBy: (menu, { desc }) => [desc(menu.name)],
			});
			return menus;
		} catch (_e) {
			throw new TRPCError({
				code: "INTERNAL_SERVER_ERROR",
				message: "Failed to fetch menus",
			});
		}
	}),
	add: authedProcedure
		.input(
			z.object({
				name: z.string(),
				type: z.enum(MENU_TYPE_CONST),
				standardPrice: z.number(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const cleanedName = input.name.trim();
			const cleanedPrice = Number(input.standardPrice.toFixed(2));
			try {
				await ctx.db.insert(menu).values({
					name: cleanedName,
					type: input.type,
					standardPrice: cleanedPrice,
				});
				return { success: true };
			} catch (_e) {
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Failed to add menu",
				});
			}
		}),
	edit: authedProcedure
		.input(
			z.object({
				id: z.string(),
				name: z.string(),
				type: z.enum(MENU_TYPE_CONST),
				standardPrice: z.number(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const cleanedName = input.name.trim();
			const cleanedPrice = Number(input.standardPrice.toFixed(2));
			try {
				await ctx.db
					.update(menu)
					.set({
						name: cleanedName,
						type: input.type,
						standardPrice: cleanedPrice,
					})
					.where(eq(menu.id, input.id));
				return { success: true };
			} catch (_e) {
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Failed to edit menu",
				});
			}
		}),
	toggleActive: authedProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ ctx, input }) => {
			try {
				await ctx.db
					.update(menu)
					.set({ isActive: not(menu.isActive) })
					.where(eq(menu.id, input.id));
				return { success: true };
			} catch (_e) {
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Failed to toggle menu status",
				});
			}
		}),
});
