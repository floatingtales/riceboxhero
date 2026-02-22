"use client";

import { Stack } from "@mantine/core";
import TodayOrdersCard from "./TodayOrdersCard";
import UnresolvedOrdersCard from "./UnresolvedOrdersCard";

export default function RightBar() {
	return (
		<Stack flex={1} gap="sm" h="100%">
			<UnresolvedOrdersCard />
			<TodayOrdersCard />
		</Stack>
	);
}
