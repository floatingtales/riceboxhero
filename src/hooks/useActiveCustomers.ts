import { api } from "@/trpc/react";

export function useActiveCustomers() {
	return api.customer.getActive.useQuery();
}
