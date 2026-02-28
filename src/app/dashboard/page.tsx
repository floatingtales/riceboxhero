"use client";

import { Button, ScrollArea, Stack } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { api } from "@/trpc/react";

export default function dashboardMainPage() {
	const utils = api.useUtils();

	const pingMutation = api.ping.testMutation.useMutation({
		onSuccess: (data) => {
			notifications.show({
				message: data.message,
			});
		},
		onError: (error) => {
			notifications.show({
				message: error.message,
			});
		},
	});

	const revalidateQueries = () => {
		utils.order.orders.invalidate();
	};

	return (
		<Stack bg="gray.0" flex={1} h="calc(100vh - 56px)" p="xl">
			<ScrollArea>
				<Button onClick={() => pingMutation.mutate()}>
					Try call a mutation
				</Button>
				<Button onClick={() => revalidateQueries()}>Revalidate queries</Button>
			</ScrollArea>
		</Stack>
	);
}
