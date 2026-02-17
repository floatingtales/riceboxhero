"use client";

import {
	Button,
	Card,
	Divider,
	Group,
	Loader,
	NumberInput,
	ScrollArea,
	SegmentedControl,
	Select,
	Stack,
	Text,
	TextInput,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import {
	IconChefHat,
	IconPlus,
	IconToolsKitchen3,
	IconUser,
} from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { api } from "@/trpc/react";
import AddCustomerModal from "../customer/AddCustomerModal";

export default function NewOrderCard() {
	const customersQuery = api.customer.getActive.useQuery();
	const menusQuery = api.menu.getActive.useQuery();

	const [opened, { open, close }] = useDisclosure();

	const [selectedMenu, setSelectedMenu] = useState<{
		id: string;
		amount: number;
		discount: number;
		discountType: "percent" | "value";
		standardPrice: number;
	}>({
		id: "",
		amount: 1,
		discount: 0,
		discountType: "value",
		standardPrice: 0,
	});

	const [toBeAddedMenu, setToBeAddedMenu] = useState<{
		menuId: string;
		amount: number;
		grossPrice: number;
		discount: number;
		discountRate: number;
		totalPrice: number;
	}>({
		menuId: "",
		amount: 0,
		grossPrice: 0,
		discount: 0,
		discountRate: 0,
		totalPrice: 0,
	});

	const [orderList, setOrderList] = useState<
		{
			menuId: string;
			amount: number;
			grossPrice: number;
			discount: number;
			discountRate: number;
			totalPrice: number;
		}[]
	>([]);

	useEffect(() => {
		const grossPrice = selectedMenu.standardPrice * selectedMenu.amount;
		const discount =
			selectedMenu.discountType === "percent"
				? grossPrice * (selectedMenu.discount / 100)
				: selectedMenu.discount * selectedMenu.amount;
		const totalPrice = grossPrice - discount;
		setToBeAddedMenu({
			menuId: selectedMenu.id,
			amount: selectedMenu.amount,
			grossPrice,
			discount,
			discountRate:
				selectedMenu.discountType === "percent" ? selectedMenu.discount : 0,
			totalPrice,
		});
	}, [selectedMenu]);

	const handleAddToOrder = () => {
		if (toBeAddedMenu.menuId === "") return;
		setOrderList((prev) => [...prev, toBeAddedMenu]);
		setToBeAddedMenu({
			menuId: "",
			amount: 0,
			grossPrice: 0,
			discount: 0,
			discountRate: 0,
			totalPrice: 0,
		});
		setSelectedMenu({
			id: "",
			amount: 1,
			discount: 0,
			discountType: "value",
			standardPrice: 0,
		});
	};

	const form = useForm({
		mode: "uncontrolled",
		initialValues: {
			customerId: "",
		},
		validate: {
			customerId: (value) => (value.length < 1 ? "Customer is required" : null),
		},
	});

	if (customersQuery.isError) {
		window.location.reload();
		return;
	}

	if (menusQuery.isError) {
		window.location.reload();
		return;
	}

	if (customersQuery.isLoading) {
		return (
			<Card flex={2} h="95%" p="md" withBorder>
				<Stack align="center" gap="md" h="100%" justify="center" w="100%">
					<Loader />
				</Stack>
			</Card>
		);
	}

	if (menusQuery.isLoading) {
		return (
			<Card flex={2} h="95%" p="md" withBorder>
				<Stack align="center" gap="md" h="100%" justify="center" w="100%">
					<Loader />
				</Stack>
			</Card>
		);
	}

	return (
		<>
			<Card flex={2} h="100%" p="md" withBorder>
				<ScrollArea h="75svh">
					<Stack gap="md" h="100%" w="100%">
						<Stack gap="0">
							<Text fw="bold" size="xl">
								New Order
							</Text>
							<Text c="dimmed" size="xs">
								Create new order
							</Text>
						</Stack>
						<Stack gap="xs">
							<Group justify="space-between">
								<Group gap="xs">
									<IconUser color="var(--mantine-color-orange-6)" />
									<Text fw="bold" size="sm">
										Customer Information
									</Text>
								</Group>
								<Button
									leftSection={<IconPlus size={16} />}
									onClick={open}
									size="xs"
								>
									Add New Customer
								</Button>
							</Group>
							<Select
								allowDeselect={false}
								data={customersQuery.data?.map((customer) => ({
									label: customer.name,
									value: customer.id,
								}))}
								key={form.key("customerId")}
								label="Customer"
								placeholder="Select customer"
								searchable
								{...form.getInputProps("customerId")}
							/>
							<TextInput
								label="Phone"
								placeholder="Select Customer"
								readOnly
								value={
									customersQuery.data?.find(
										(customer) => customer.id === form.getValues().customerId,
									)?.phone ?? ""
								}
							/>
							<TextInput
								label="Address"
								placeholder="Select Customer"
								readOnly
								value={
									customersQuery.data?.find(
										(customer) => customer.id === form.getValues().customerId,
									)?.address ?? ""
								}
							/>
						</Stack>
						<Divider />
						<Stack gap="xs">
							<Group gap="xs">
								<IconToolsKitchen3 color="var(--mantine-color-orange-6)" />
								<Text fw="bold" size="sm">
									Menu Items
								</Text>
							</Group>
							<Select
								allowDeselect={false}
								data={menusQuery.data?.map((menu) => ({
									label: `${menu.name} - Rp. ${menu.standardPrice.toLocaleString("en-US")}`,
									value: menu.id,
								}))}
								label="Menu"
								onChange={(value) => {
									setSelectedMenu((prev) => ({
										...prev,
										id: value ?? "",
										amount: 1,
										standardPrice:
											menusQuery.data?.find((menu) => menu.id === value)
												?.standardPrice ?? 0,
									}));
								}}
								placeholder="Select menu"
								searchable
								value={selectedMenu.id}
							/>
							<Group align="flex-end" w="100%">
								<NumberInput
									allowDecimal={false}
									allowNegative={false}
									clampBehavior="strict"
									label="Amount"
									max={100}
									min={1}
									onChange={(value) => {
										const val =
											typeof value === "string" ? Number(value) : value;
										setSelectedMenu((prev) => ({
											...prev,
											amount: val,
										}));
									}}
									value={selectedMenu.amount}
								/>
								<Stack gap="0">
									<Text fw="bold" mb={4} size="xs">
										Discount Type
									</Text>
									<SegmentedControl
										data={[
											{ label: "Rp.", value: "value" },
											{ label: "%", value: "percent" },
										]}
										onChange={(value) => {
											setSelectedMenu((prev) => ({
												...prev,
												discount: 0,
												discountType: value as "percent" | "value",
											}));
										}}
										value={selectedMenu.discountType}
									/>
								</Stack>
								<NumberInput
									allowDecimal={false}
									allowNegative={false}
									clampBehavior="strict"
									flex={1}
									hideControls
									label="Discount"
									leftSection={
										<Text size="xs">
											{selectedMenu.discountType === "percent" ? "%" : "Rp."}
										</Text>
									}
									max={
										selectedMenu.discountType === "percent"
											? 100
											: selectedMenu.standardPrice
									}
									min={0}
									onChange={(value) => {
										const val =
											typeof value === "string" ? Number(value) : value;
										setSelectedMenu((prev) => ({
											...prev,
											discount: val,
										}));
									}}
									thousandSeparator=","
									value={selectedMenu.discount}
								/>
							</Group>
							<Group justify="space-between">
								<Text fw="bold" size="sm">
									Total Price
								</Text>
								<Text fw="bold" size="sm">
									Rp. {toBeAddedMenu.totalPrice.toLocaleString("en-US")}
								</Text>
							</Group>
							<Button onClick={handleAddToOrder}>Add To Order</Button>
						</Stack>
						<Divider />
						<Stack gap="xs">
							<Group gap="xs">
								<IconChefHat color="var(--mantine-color-orange-6)" />
								<Text fw="bold" size="sm">
									Order List
								</Text>
							</Group>
							<ScrollArea h="20svh" w="100%">
								<Stack gap="xs">
									{orderList.map((orderItem, index) => (
										<Group key={`${orderItem.menuId}-${index}`}>
											<Text>
												{
													menusQuery.data?.find(
														(menu) => menu.id === orderItem.menuId,
													)?.name
												}
											</Text>
											<Text>{orderItem.amount}</Text>
											<Text>{orderItem.totalPrice}</Text>
										</Group>
									))}
								</Stack>
							</ScrollArea>
						</Stack>
					</Stack>
				</ScrollArea>
			</Card>
			<AddCustomerModal close={close} opened={opened} />
		</>
	);
}
