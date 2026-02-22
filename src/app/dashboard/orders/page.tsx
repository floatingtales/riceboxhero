"use client";

import { Group, Stack } from "@mantine/core";
import NewOrderCard from "@/app/_components/orders/NewOrderCard";
import RightBar from "@/app/_components/orders/RightBar";

export default function OrdersPage() {
	return (
		<Stack bg="gray.0" flex={1} h="calc(100vh - 56px)" p="xl">
			<Group align="start" gap="lg" w="100%">
				<NewOrderCard />
				<RightBar />
			</Group>
		</Stack>
	);
}
