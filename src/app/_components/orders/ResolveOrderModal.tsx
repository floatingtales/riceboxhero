"use client";

import {
	Badge,
	Button,
	Divider,
	Group,
	Modal,
	Select,
	Stack,
	Text,
	TextInput,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import {
	IconChefHat,
	IconPrinter,
	IconUser,
	IconUserDollar,
	IconWallet,
} from "@tabler/icons-react";
import { useState } from "react";
import { useActiveMenus } from "@/hooks/useActiveMenus";
import { api } from "@/trpc/react";
import { PAYMENT_METHOD_CONST } from "@/utils/consts";

const STATUS_OPTIONS = [
	{ value: "completed", label: "Completed" },
	{ value: "voided", label: "Voided" },
];

const PAYMENT_METHOD_OPTIONS = PAYMENT_METHOD_CONST.map((method) => ({
	label: method.charAt(0).toUpperCase() + method.slice(1),
	value: method,
}));

export default function ResolveOrderModal({
	opened,
	onClose,
	id,
}: {
	opened: boolean;
	onClose: () => void;
	id: string;
}) {
	const utils = api.useUtils();

	const orderQuery = api.order.seeOrderDetail.useQuery(
		{ id },
		{
			enabled: !!id,
		},
	);
	const menusQuery = useActiveMenus();

	const updateStatusMutation = api.order.updateOrderStatus.useMutation({
		onSuccess: () => {
			utils.order.orders.invalidate();
			utils.order.seeOrderDetail.invalidate({ id });
			onClose();
			notifications.show({
				title: "Order updated",
				message: "Order updated successfully",
				color: "green",
			});
		},
		onError: (error) => {
			notifications.show({
				title: "Order update failed",
				message: error.message,
				color: "red",
			});
		},
	});

	const [nextStatus, setNextStatus] = useState<string | null>(null);
	const [paymentMethod, setPaymentMethod] = useState<string | null>(null);

	const handleSave = () => {
		if (!nextStatus) return;
		updateStatusMutation.mutate({
			id,
			orderStatus: nextStatus as "completed" | "voided",
			paymentMethod: paymentMethod as
				| (typeof PAYMENT_METHOD_CONST)[number]
				| undefined,
		});
	};

	if (orderQuery.isLoading) {
		return (
			<Modal onClose={onClose} opened={opened} title="Resolve Order">
				<Text>Resolving order...</Text>
			</Modal>
		);
	}

	if (orderQuery.error || !orderQuery.data) {
		return (
			<Modal onClose={onClose} opened={opened} title="Resolve Order">
				<Text c="red">Failed to load order.</Text>
			</Modal>
		);
	}

	const { data: order } = orderQuery;
	const isPending = order.orderStatus === "pending";
	const needsPaymentMethod =
		isPending && nextStatus === "completed" && !paymentMethod;

	return (
		<Modal onClose={onClose} opened={opened} size="lg" title="Resolve Order">
			<Stack gap="xs">
				<Select
					clearable
					data={STATUS_OPTIONS}
					description="Leave empty to keep the current status"
					label="Change Status"
					onChange={(value) => setNextStatus(value)}
					placeholder={`Current: ${order.orderStatus}`}
					value={nextStatus}
				/>
				{isPending && (
					<>
						<Divider />
						<Group gap="xs">
							<IconWallet color="var(--mantine-color-orange-6)" />
							<Text fw="bold" size="sm">
								Payment Method
							</Text>
						</Group>
						<Select
							allowDeselect
							clearable
							data={PAYMENT_METHOD_OPTIONS}
							description={
								nextStatus === "completed"
									? "Required when completing an order"
									: undefined
							}
							error={
								needsPaymentMethod ? "Payment method is required" : undefined
							}
							onChange={(value) => setPaymentMethod(value)}
							placeholder={
								order.paymentMethod
									? `Current: ${order.paymentMethod.charAt(0).toUpperCase() + order.paymentMethod.slice(1)}`
									: "Select payment method"
							}
							value={paymentMethod}
						/>
					</>
				)}
				{!isPending && order.paymentMethod && (
					<Group justify="space-between">
						<Text c="dimmed" size="xs">
							Payment Method
						</Text>
						<Badge variant="light">
							{order.paymentMethod.charAt(0).toUpperCase() +
								order.paymentMethod.slice(1)}
						</Badge>
					</Group>
				)}
				<Divider />
				<Button
					disabled={
						!nextStatus || updateStatusMutation.isPending || needsPaymentMethod
					}
					loading={updateStatusMutation.isPending}
					onClick={handleSave}
					size="md"
				>
					Update Status
				</Button>
				<Divider />
				<Group gap="xs">
					<IconUser color="var(--mantine-color-orange-6)" />
					<Text fw="bold" size="sm">
						Customer
					</Text>
				</Group>
				<TextInput label="Name" readOnly value={order.customer.name} />
				<TextInput label="Phone" readOnly value={order.customer.phone ?? ""} />
				<TextInput
					label="Address"
					readOnly
					value={order.customer.address ?? ""}
				/>
				<Divider />
				<Group gap="xs">
					<IconChefHat color="var(--mantine-color-orange-6)" />
					<Text fw="bold" size="sm">
						Order Items
					</Text>
				</Group>
				{order.orderItems.map((item, index) => (
					<Group
						bg="orange.0"
						justify="space-between"
						key={`${item.menuId}-${index}`}
						p="xs"
					>
						<Stack gap="0">
							<Text fw="bold" size="sm">
								{menusQuery.data?.find((m) => m.id === item.menuId)?.name ??
									item.menuId}
							</Text>
							<Group gap="xs">
								<Badge size="xs" variant="light">
									x{item.amount}
								</Badge>
								{(item.discount ?? 0) > 0 && (
									<Badge color="red" size="xs" variant="light">
										{(item.discountRate ?? 0) > 0
											? `- ${item.discountRate}%`
											: `- Rp. ${(item.discount ?? 0).toLocaleString("en-US", { maximumFractionDigits: 2 })}`}
									</Badge>
								)}
							</Group>
						</Stack>
						<Text fw="bold" size="sm">
							Rp.{" "}
							{(item.totalPrice ?? 0).toLocaleString("en-US", {
								maximumFractionDigits: 2,
							})}
						</Text>
					</Group>
				))}
				<Divider />
				<Group gap="xs">
					<IconUserDollar color="var(--mantine-color-orange-6)" />
					<Text fw="bold" size="sm">
						Total
					</Text>
				</Group>
				<Group justify="space-between">
					<Text fw="bold">Total</Text>
					<Text fw="bold">
						Rp.{" "}
						{order.total.toLocaleString("en-US", {
							maximumFractionDigits: 2,
						})}
					</Text>
				</Group>
				<Group justify="flex-end">
					<Button
						leftSection={<IconPrinter />}
						onClick={() => window.open(`/receipt/${id}`, "_blank")}
						variant="subtle"
					>
						Print Receipt
					</Button>
				</Group>
			</Stack>
		</Modal>
	);
}
