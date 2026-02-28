"use client";

import { Card, Group, Loader, Stack, Text } from "@mantine/core";
import { IconCash, IconChartBubble, IconReceipt } from "@tabler/icons-react";
import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "@/server/api/root";

type OverviewData = inferRouterOutputs<AppRouter>["order"]["periodOverview"];

interface MetricCardsProps {
	data: OverviewData | undefined;
	isLoading: boolean;
	period: string;
}

const PERIOD_LABELS: Record<string, string> = {
	day: "Today",
	week: "This Week",
	month: "This Month",
};

export default function MetricCards({
	data,
	isLoading,
	period,
}: MetricCardsProps) {
	const label = PERIOD_LABELS[period] ?? "Today";

	const metrics = [
		{
			icon: <IconCash color="var(--mantine-color-green-6)" size={28} />,
			label: `${label}'s Revenue`,
			value: data?.total ?? "Rp. 0",
		},
		{
			icon: <IconReceipt color="var(--mantine-color-blue-6)" size={28} />,
			label: `${label}'s Orders`,
			value: data?.count?.toString() ?? "0",
		},
		{
			icon: <IconChartBubble color="var(--mantine-color-orange-6)" size={28} />,
			label: "Avg Order Value",
			value: data?.averageOrder ?? "Rp. 0",
		},
	];

	return (
		<Group gap="md" grow>
			{metrics.map((metric) => (
				<Card key={metric.label} padding="lg" radius="md" withBorder>
					<Group gap="sm">
						{metric.icon}
						<Stack gap={2}>
							<Text c="dimmed" fw={600} size="xs" tt="uppercase">
								{metric.label}
							</Text>
							{isLoading ? (
								<Loader size="sm" />
							) : (
								<Text fw={700} size="xl">
									{metric.value}
								</Text>
							)}
						</Stack>
					</Group>
				</Card>
			))}
		</Group>
	);
}
