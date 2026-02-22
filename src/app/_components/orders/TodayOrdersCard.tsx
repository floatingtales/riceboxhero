"use client";

import {
	ActionIcon,
	Badge,
	Card,
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
import EditOrderModal from "./EditOrderModal";

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

export default function TodayOrdersCard() {
	const [today] = useState(new Date());
	const [opened, { open, close }] = useDisclosure();
	const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
	const dayOrdersQuery = api.order.dayOrders.useQuery({ date: today });

	const handleEdit = (id: string) => {
		setSelectedOrder(id);
		open();
	};

	if (dayOrdersQuery.error) {
		return (
			<Card flex={2} h="100%" p="md" withBorder>
				<Text c="red">Failed to load orders.</Text>
			</Card>
		);
	}

	if (dayOrdersQuery.isLoading) {
		return (
			<Card flex={2} h="100%" p="md" withBorder>
				<Stack align="center" gap="md" h="100%" justify="center" w="100%">
					<Loader />
				</Stack>
			</Card>
		);
	}

	const { data: orders } = dayOrdersQuery;

	return (
		<Card flex={2} h="100%" p="md" withBorder>
			<Stack gap="md" h="100%" w="100%">
				<Group justify="space-between">
					<Text fw="bold" size="xl">
						Today's Orders
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
														{order.orderNumber}
													</Text>
												</Stack>
											</Group>
											<Group gap="xs">
												<Text c="dimmed" size="xs">
													{dayjs(order.orderedAt).format("HH:mm")}
												</Text>
												<ActionIcon
													onClick={() => {
														console.log("edit");
													}}
													size="sm"
													variant="light"
												>
													<IconPencil />
												</ActionIcon>
											</Group>
										</Group>
									</Stack>
								</Card>
							);
						})}
					</Stack>
				</ScrollArea>
			</Stack>
			<EditOrderModal
				id={selectedOrder ?? ""}
				onClose={close}
				opened={opened}
			/>
		</Card>
	);
}
