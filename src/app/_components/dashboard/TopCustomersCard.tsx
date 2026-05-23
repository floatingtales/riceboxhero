"use client";

import { Card, Group, Loader, Stack, Text } from "@mantine/core";
import { IconUsers } from "@tabler/icons-react";
import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "@/server/api/root";

type TopCustomersData = inferRouterOutputs<AppRouter>["order"]["topCustomers"];

interface TopCustomersCardProps {
	data: TopCustomersData | undefined;
	isLoading: boolean;
}

export default function TopCustomersCard({
	data,
	isLoading,
}: TopCustomersCardProps) {
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
					<IconUsers color="var(--mantine-color-violet-6)" size={20} />
					<Text fw={600} size="md">
						Top Customers
					</Text>
				</Group>

				{isLoading ? (
					<Stack align="center" py="xl">
						<Loader size="sm" />
					</Stack>
				) : !data || data.length === 0 ? (
					<Text c="dimmed" py="xl" size="sm" ta="center">
						No customer data for this period
					</Text>
				) : (
					<Stack gap="xs">
						{data.map((cust, index) => (
							<Group justify="space-between" key={cust.customerId} py={4}>
								<Group gap="sm">
									<Text c="dimmed" fw={700} size="sm" ta="center" w={20}>
										{index + 1}
									</Text>
									<Stack gap={0}>
										<Text fw={500} size="sm">
											{cust.customerName}
										</Text>
										<Text c="dimmed" size="xs">
											{cust.orderCount} order{cust.orderCount !== 1 ? "s" : ""}
										</Text>
									</Stack>
								</Group>
								<Text fw={500} size="sm">
									Rp. {cust.totalSpent.toLocaleString("id-ID")}
								</Text>
							</Group>
						))}
					</Stack>
				)}
			</Stack>
		</Card>
	);
}
