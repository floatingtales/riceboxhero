import { TRPCError } from "@trpc/server";
import { eq, not } from "drizzle-orm";
import z from "zod";
import { customer } from "@/server/db/schema";
import { formatIdNumber } from "@/utils/helpers/formatPhoneNo";
import { authedProcedure, createTRPCRouter } from "../trpc";

export const customerRouter = createTRPCRouter({
	getAll: authedProcedure.query(async ({ ctx }) => {
		try {
			const customers = await ctx.db.query.customer.findMany({
				columns: {
					id: true,
					name: true,
					phone: true,
					address: true,
					isActive: true,
				},
				orderBy: (customer, { desc }) => [desc(customer.name)],
			});
			return customers;
		} catch (_e) {
			throw new TRPCError({
				code: "INTERNAL_SERVER_ERROR",
				message: "Failed to fetch customers",
			});
		}
	}),
	add: authedProcedure
		.input(
			z.object({ name: z.string(), phone: z.string(), address: z.string() }),
		)
		.mutation(async ({ ctx, input }) => {
			const cleanedName = input.name.trim();
			const cleanedPhone = formatIdNumber(input.phone.trim());
			const cleanedAddress = input.address.trim();
			try {
				await ctx.db.insert(customer).values({
					name: cleanedName,
					phone: cleanedPhone,
					address: cleanedAddress,
				});
				return { success: true };
			} catch (_e) {
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Failed to add customer",
				});
			}
		}),
	edit: authedProcedure
		.input(
			z.object({
				id: z.string(),
				name: z.string(),
				phone: z.string(),
				address: z.string(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const existingCustomer = await ctx.db.query.customer.findFirst({
				where: eq(customer.id, input.id),
			});
			if (!existingCustomer) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "Customer not found",
				});
			}

			const cleanedName = input.name.trim();
			const cleanedPhone = formatIdNumber(input.phone.trim());
			const cleanedAddress = input.address.trim();

			if (
				existingCustomer.name === cleanedName &&
				existingCustomer.phone === cleanedPhone &&
				existingCustomer.address === cleanedAddress
			) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "No changes to update",
				});
			}
			try {
				await ctx.db
					.update(customer)
					.set({
						name: cleanedName,
						phone: cleanedPhone,
						address: cleanedAddress,
					})
					.where(eq(customer.id, input.id));
				return { success: true };
			} catch (_e) {
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Failed to edit customer",
				});
			}
		}),
	toggleActive: authedProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ ctx, input }) => {
			try {
				await ctx.db
					.update(customer)
					.set({ isActive: not(customer.isActive) })
					.where(eq(customer.id, input.id));
				return { success: true };
			} catch (_e) {
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Failed to toggle customer status",
				});
			}
		}),
});
