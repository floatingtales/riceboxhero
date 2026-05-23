"use client";

import { Badge, Card, Group, Loader, Stack, Table, Text } from "@mantine/core";
import { IconClock } from "@tabler/icons-react";
import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "@/server/api/root";

type RecentOrdersData = inferRouterOutputs<AppRouter>["order"]["recentOrders"];

const STATUS_COLORS: Record<string, string> = {
	pending: "yellow",
	paid: "blue",
	completed: "green",
	voided: "red",
};

interface RecentOrdersCardProps {
	data: RecentOrdersData | undefined;
	isLoading: boolean;
}

export default function RecentOrdersCard({
	data,
	isLoading,
}: RecentOrdersCardProps) {
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
					<IconClock color="var(--mantine-color-orange-6)" size={20} />
					<Text fw={600} size="md">
						Recent Orders
					</Text>
					<Text c="dimmed" size="xs">
						(Today)
					</Text>
				</Group>

				{isLoading ? (
					<Stack align="center" py="xl">
						<Loader size="sm" />
					</Stack>
				) : !data || data.length === 0 ? (
					<Text c="dimmed" py="xl" size="sm" ta="center">
						No orders today
					</Text>
				) : (
					<Table highlightOnHover striped>
						<Table.Thead>
							<Table.Tr>
								<Table.Th>Order #</Table.Th>
								<Table.Th>Customer</Table.Th>
								<Table.Th>Status</Table.Th>
								<Table.Th style={{ textAlign: "right" }}>Total</Table.Th>
							</Table.Tr>
						</Table.Thead>
						<Table.Tbody>
							{data.map((order) => (
								<Table.Tr key={order.id}>
									<Table.Td>
										<Text fw={500} size="sm">
											{order.orderNumber}
										</Text>
									</Table.Td>
									<Table.Td>
										<Text size="sm">{order.customer.name}</Text>
									</Table.Td>
									<Table.Td>
										<Badge
											color={STATUS_COLORS[order.orderStatus] ?? "gray"}
											size="sm"
											variant="light"
										>
											{order.orderStatus}
										</Badge>
									</Table.Td>
									<Table.Td style={{ textAlign: "right" }}>
										<Text fw={500} size="sm">
											Rp. {order.total.toLocaleString("id-ID")}
										</Text>
									</Table.Td>
								</Table.Tr>
							))}
						</Table.Tbody>
					</Table>
				)}
			</Stack>
		</Card>
	);
}
