"use client";

import { Card, Stack, Text } from "@mantine/core";

export default function TodayOrdersCard() {
	return (
		<Card flex={1} h="100%" p="md" withBorder>
			<Stack gap="md" h="100%" w="100%">
				<Stack gap="0">
					<Text fw="bold" size="xl">
						Today's Orders
					</Text>
					<Text c="dimmed" size="xs">
						Manage today's orders
					</Text>
				</Stack>
			</Stack>
		</Card>
	);
}
