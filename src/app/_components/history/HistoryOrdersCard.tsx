"use client";

import {
	Badge,
	Card,
	Group,
	Loader,
	ScrollArea,
	Stack,
	Text,
} from "@mantine/core";
import {
	IconCheck,
	IconClock,
	IconCreditCardPay,
	IconTrash,
} from "@tabler/icons-react";
import type { inferRouterOutputs } from "@trpc/server";
import dayjs from "dayjs";
import type { AppRouter } from "@/server/api/root";

type Order = inferRouterOutputs<AppRouter>["order"]["orders"][number];

const STATUS_CONFIG = {
	pending: { color: "gray", label: "Pending", icon: IconClock },
	paid: { color: "green", label: "Paid", icon: IconCreditCardPay },
	completed: { color: "blue", label: "Completed", icon: IconCheck },
	voided: { color: "red", label: "Voided", icon: IconTrash },
};

export default function HistoryOrdersCard({
	data,
	isLoading,
}: {
	data: Order[] | undefined;
	isLoading: boolean;
}) {
	if (isLoading) {
		return (
			<Card p="md" withBorder>
				<Stack align="center" py="xl">
					<Loader />
				</Stack>
			</Card>
		);
	}

	if (!data || data.length === 0) {
		return (
			<Card p="md" withBorder>
				<Text c="dimmed" py="xl" size="sm" ta="center">
					No orders for this date
				</Text>
			</Card>
		);
	}

	return (
		<Card p="md" withBorder>
			<Stack gap="md">
				<Group justify="space-between">
					<Text fw="bold" size="lg">
						Orders
					</Text>
					<Badge size="lg" variant="light">
						{data.length}
					</Badge>
				</Group>
				<ScrollArea.Autosize mah="50vh" offsetScrollbars>
					<Stack>
						{data.map((order) => {
							const statusConfig = STATUS_CONFIG[order.orderStatus];
							const StatusIcon = statusConfig.icon;
							return (
								<Card bg="gray.0" key={order.id} p="md" withBorder>
									<Stack gap="xs">
										<Group align="start" justify="space-between" mb="xs">
											<Group align="start" gap="xs">
												<Stack gap="0">
													<Badge
														color={statusConfig.color}
														leftSection={<StatusIcon size="1rem" />}
														size="xs"
														variant="light"
													>
														{statusConfig.label}
													</Badge>
													<Text fw="bold" size="sm">
														{order.customer.name}
													</Text>
													<Text c="dimmed" size="xs">
														{order.orderNumber}{" "}
														{order.orderNote && `(${order.orderNote})`}
													</Text>
												</Stack>
											</Group>
											<Text c="dimmed" size="xs">
												{dayjs(order.orderedAt).format("HH:mm")}
											</Text>
										</Group>
										<Group align="end" justify="space-between">
											<Stack gap="xs">
												{order.orderItems.map((item) => (
													<Text key={item.id} size="xs">
														{item.amount}x {item.menuItem.name}
													</Text>
												))}
											</Stack>
											<Text c="orange" fw="bold" size="sm">
												Rp. {order.total.toLocaleString("en-US")}
											</Text>
										</Group>
									</Stack>
								</Card>
							);
						})}
					</Stack>
				</ScrollArea.Autosize>
			</Stack>
		</Card>
	);
}
