"use client";

import { Button, ScrollArea } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { api } from "@/trpc/react";

export default function dashboardMainPage() {
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

	return (
		<ScrollArea>
			<Button onClick={() => pingMutation.mutate()}>Try call a mutation</Button>
		</ScrollArea>
	);
}
