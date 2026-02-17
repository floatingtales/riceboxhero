"use client";

import { Group, Stack } from "@mantine/core";
import NewOrderCard from "@/app/_components/orders/NewOrderCard";
import TodayOrdersCard from "@/app/_components/orders/TodayOrdersCard";

export default function OrdersPage() {
	return (
		<Stack bg="gray.0" flex={1} h="calc(100vh - 56px)" p="xl">
			<Group align="start" gap="lg" w="100%">
				<NewOrderCard />
				<TodayOrdersCard />
			</Group>
		</Stack>
	);
}
