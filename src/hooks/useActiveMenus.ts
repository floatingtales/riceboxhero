import { api } from "@/trpc/react";

export function useActiveMenus() {
	return api.menu.getActive.useQuery();
}
