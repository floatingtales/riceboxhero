"use client";

import { Card, Group, Loader, Stack, Text } from "@mantine/core";
import { IconFlame } from "@tabler/icons-react";
import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "@/server/api/root";

type TopItemsData = inferRouterOutputs<AppRouter>["order"]["topSellingItems"];

interface TopSellingItemsCardProps {
	data: TopItemsData | undefined;
	isLoading: boolean;
}

export default function TopSellingItemsCard({
	data,
	isLoading,
}: TopSellingItemsCardProps) {
	return (
		<Card
			className="hover-lift"
			h="100%"
			padding="lg"
			radius="md"
			shadow="sm"
			withBorder
		>
			<Stack gap="md">
				<Group gap="xs">
					<IconFlame color="var(--mantine-color-red-6)" size={20} />
					<Text fw={600} size="md">
						Top Selling Items
					</Text>
				</Group>

				{isLoading ? (
					<Stack align="center" py="xl">
						<Loader size="sm" />
					</Stack>
				) : !data || data.length === 0 ? (
					<Text c="dimmed" py="xl" size="sm" ta="center">
						No sales data for this period
					</Text>
				) : (
					<Stack gap="xs">
						{data.map((item, index) => (
							<Group justify="space-between" key={item.menuId} py={4}>
								<Group gap="sm">
									<Text c="dimmed" fw={700} size="sm" ta="center" w={20}>
										{index + 1}
									</Text>
									<Text fw={500} size="sm">
										{item.menuName}
									</Text>
								</Group>
								<Text c="dimmed" size="sm">
									{item.totalSold} sold
								</Text>
							</Group>
						))}
					</Stack>
				)}
			</Stack>
		</Card>
	);
}
