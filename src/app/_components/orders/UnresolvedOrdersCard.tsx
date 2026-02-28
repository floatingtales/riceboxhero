"use client";

import {
	ActionIcon,
	Badge,
	Card,
	Divider,
	Group,
	Loader,
	ScrollArea,
	Stack,
	Text,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
	IconCheck,
	IconClock,
	IconCreditCardPay,
	IconPencil,
	IconTrash,
} from "@tabler/icons-react";
import dayjs from "dayjs";
import { useState } from "react";
import { api } from "@/trpc/react";
import ResolveOrderModal from "./ResolveOrderModal";

const STATUS_CONFIG = {
	pending: {
		color: "gray",
		label: "Pending",
		icon: IconClock,
	},
	paid: {
		color: "green",
		label: "Paid",
		icon: IconCreditCardPay,
	},
	completed: {
		color: "blue",
		label: "Completed",
		icon: IconCheck,
	},
	voided: {
		color: "red",
		label: "Voided",
		icon: IconTrash,
	},
};

export default function UnresolvedOrdersCard() {
	const [opened, { open, close }] = useDisclosure();
	const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
	const unresolvedOrdersQuery = api.order.orders.useQuery({ todayOnly: false });

	const handleEdit = (id: string) => {
		setSelectedOrder(id);
		open();
	};

	if (unresolvedOrdersQuery.error) {
		return (
			<Card flex={1} h="100%" p="md" withBorder>
				<Text c="red">Failed to load orders.</Text>
			</Card>
		);
	}

	if (unresolvedOrdersQuery.isLoading) {
		return (
			<Card flex={1} h="100%" p="md" withBorder>
				<Stack align="center" gap="md" h="100%" justify="center" w="100%">
					<Loader />
				</Stack>
			</Card>
		);
	}

	if (unresolvedOrdersQuery.data?.length === 0) {
		return null;
	}

	const { data: orders } = unresolvedOrdersQuery;

	return (
		<>
			<Card flex={1} h="100%" p="md" withBorder>
				<Stack gap="md" h="100%" w="100%">
					<Group justify="space-between">
						<Text fw="bold" size="xl">
							Unresolved Orders
						</Text>
						<Badge size="lg" variant="light">
							{orders?.length}
						</Badge>
					</Group>
					<ScrollArea h="70%" offsetScrollbars>
						<Stack>
							{orders?.map((order) => {
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
												<Group gap="xs">
													<Text c="dimmed" size="xs">
														{dayjs(order.orderedAt).format("ddd HH:mm")}
													</Text>
													<ActionIcon
														onClick={() => {
															handleEdit(order.id);
														}}
														size="sm"
														variant="light"
													>
														<IconPencil />
													</ActionIcon>
												</Group>
											</Group>
											<Group align="end" justify="space-between">
												<Stack gap="xs">
													{order.orderItems.map((item) => (
														<Text key={item.id} size="xs">
															{item.amount}x {item.menuItem.name}
														</Text>
													))}
												</Stack>
												<Stack gap="xs">
													<Text c="orange" fw="bold" size="sm">
														Rp. {order.total.toLocaleString("en-US")}
													</Text>
												</Stack>
											</Group>
										</Stack>
									</Card>
								);
							})}
						</Stack>
					</ScrollArea>
				</Stack>
			</Card>
			<ResolveOrderModal
				id={selectedOrder ?? ""}
				onClose={close}
				opened={opened}
			/>
		</>
	);
}
