"use client";

import { Badge, Card, Group, Loader, Stack, Text } from "@mantine/core";
import { IconToolsKitchen3 } from "@tabler/icons-react";
import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "@/server/api/root";

type MenuTypeBreakdownData =
	inferRouterOutputs<AppRouter>["order"]["menuTypeBreakdown"];

interface TypeBreakdownCardProps {
	data: MenuTypeBreakdownData | undefined;
	isLoading: boolean;
}

const TYPE_COLORS: Record<string, string> = {
	rice_box: "orange",
	meat_only: "red",
};

const TYPE_LABELS: Record<string, string> = {
	rice_box: "Rice Box",
	meat_only: "Meat Only",
};

export default function TypeBreakdownCard({
	data,
	isLoading,
}: TypeBreakdownCardProps) {
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
					<IconToolsKitchen3 color="var(--mantine-color-orange-6)" size={20} />
					<Text fw={600} size="md">
						Menu Type Breakdown
					</Text>
				</Group>

				{isLoading ? (
					<Stack align="center" py="xl">
						<Loader size="sm" />
					</Stack>
				) : !data || data.length === 0 ? (
					<Text c="dimmed" py="xl" size="sm" ta="center">
						No order data for this period
					</Text>
				) : (
					<Stack gap="xs">
						{data.map((item) => (
							<Group justify="space-between" key={item.menuType} py={4}>
								<Group gap="sm">
									<Badge
										color={TYPE_COLORS[item.menuType] ?? "gray"}
										size="sm"
										variant="light"
									>
										{TYPE_LABELS[item.menuType] ?? item.menuType}
									</Badge>
									<Text c="dimmed" size="xs">
										{item.count} item{item.count !== 1 ? "s" : ""} sold
									</Text>
								</Group>
								<Text fw={500} size="sm">
									Rp. {item.total.toLocaleString("id-ID")}
								</Text>
							</Group>
						))}
					</Stack>
				)}
			</Stack>
		</Card>
	);
}
