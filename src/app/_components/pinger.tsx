"use client";

import { api } from "@/trpc/react";

export function Pinger() {
	const { data, isPending, error } = api.ping.ping.useQuery();

	if (isPending) {
		return <>pending</>;
	}

	if (error) {
		return <>We got an error</>;
	}

	return <>{data.message}</>;
}
