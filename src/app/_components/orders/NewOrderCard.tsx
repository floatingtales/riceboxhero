"use client";

import {
	Badge,
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
import { useDisclosure } from "@mantine/hooks";
import {
	IconChefHat,
	IconPlus,
	IconToolsKitchen3,
	IconTrash,
	IconUser,
	IconUserDollar,
} from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { api } from "@/trpc/react";
import AddCustomerModal from "../customer/AddCustomerModal";

export default function NewOrderCard() {
	const customersQuery = api.customer.getActive.useQuery();
	const menusQuery = api.menu.getActive.useQuery();

	const [opened, { open, close }] = useDisclosure();

	const [customerId, setCustomerId] = useState<string>("");

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

	const [orderAdjustments, setOrderAdjustments] = useState<{
		discount: number;
		serviceCharge: number;
		tax: number;
	}>({
		discount: 0,
		serviceCharge: 0,
		tax: 11,
	});

	const [orderValues, setOrderValues] = useState<{
		subtotal: number;
		discount: number;
		discountRate: number;
		serviceCharge: number;
		serviceChargeRate: number;
		tax: number;
		taxRate: number;
		adjustment: number;
		total: number;
	}>({
		subtotal: 0,
		discount: 0,
		discountRate: 0,
		serviceCharge: 0,
		serviceChargeRate: 0,
		tax: 0,
		taxRate: 0,
		adjustment: 0,
		total: 0,
	});

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

	useEffect(() => {
		const subtotal = orderList.reduce((acc, item) => acc + item.totalPrice, 0);
		const discount = subtotal * (orderAdjustments.discount / 100);
		const postDiscount = subtotal - discount;
		const serviceCharge = postDiscount * (orderAdjustments.serviceCharge / 100);
		const preTaxTotal = postDiscount + serviceCharge;
		const tax = preTaxTotal * (orderAdjustments.tax / 100);
		const preAdjustmentTotal = preTaxTotal + tax;
		const adjustment = preAdjustmentTotal % 1000; // round down to nearest thousand
		const total = preAdjustmentTotal - adjustment;
		setOrderValues((prev) => ({
			...prev,
			subtotal,
			discount,
			discountRate: orderAdjustments.discount,
			serviceCharge,
			serviceChargeRate: orderAdjustments.serviceCharge,
			tax,
			taxRate: orderAdjustments.tax,
			adjustment,
			total,
		}));
	}, [orderList, orderAdjustments]);

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

	const handleRemoveFromOrder = (index: number) => {
		setOrderList((prev) => prev.filter((_, i) => i !== index));
	};

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
								label="Customer"
								onChange={(value) => setCustomerId(value ?? "")}
								placeholder="Select customer"
								searchable
								value={customerId}
							/>
							<TextInput
								label="Phone"
								placeholder="Select Customer"
								readOnly
								value={
									customersQuery.data?.find(
										(customer) => customer.id === customerId,
									)?.phone ?? ""
								}
							/>
							<TextInput
								label="Address"
								placeholder="Select Customer"
								readOnly
								value={
									customersQuery.data?.find(
										(customer) => customer.id === customerId,
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
									label: `${menu.name} - Rp. ${menu.standardPrice.toLocaleString("en-US", { maximumFractionDigits: 2 })}`,
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
									Rp.{" "}
									{toBeAddedMenu.totalPrice.toLocaleString("en-US", {
										maximumFractionDigits: 2,
									})}
								</Text>
							</Group>
							<Button onClick={handleAddToOrder}>Add To Order</Button>
						</Stack>
						<Divider />
						<Stack gap="xs">
							<Group gap="xs">
								<IconChefHat color="var(--mantine-color-orange-6)" />
								<Text fw="bold" size="sm">
									Order Items ({orderList.length})
								</Text>
							</Group>
							{orderList.length === 0 ? (
								<Text c="dimmed" py="xl" size="sm" ta="center">
									No items in order yet
								</Text>
							) : (
								<Stack gap="xs">
									{orderList.map((orderItem, index) => (
										<Group
											bg="orange.0"
											justify="space-between"
											key={`${orderItem.menuId}-${index}`}
											p="xs"
										>
											<Stack gap="0">
												<Text fw="bold" size="sm">
													{
														menusQuery.data?.find(
															(menu) => menu.id === orderItem.menuId,
														)?.name
													}
												</Text>
												<Group gap="xs">
													<Badge size="xs" variant="light">
														x{orderItem.amount}
													</Badge>
													<Text c="dimmed" size="xs">
														{`Rp. ${menusQuery.data
															?.find((menu) => menu.id === orderItem.menuId)
															?.standardPrice.toLocaleString("en-US", {
																maximumFractionDigits: 2,
															})} each`}
													</Text>
													{orderItem.discount > 0 && (
														<Badge color="red" size="xs" variant="light">
															{orderItem.discountRate > 0
																? `- ${orderItem.discountRate}%`
																: `- Rp. ${orderItem.discount.toLocaleString("en-US", { maximumFractionDigits: 2 })}`}
														</Badge>
													)}
												</Group>
											</Stack>
											<Group gap="xs">
												<Text fw="bold" size="sm" ta="right">
													{`Rp. ${orderItem.totalPrice.toLocaleString("en-US", { maximumFractionDigits: 2 })}`}
												</Text>
												<Button
													color="red"
													onClick={() => handleRemoveFromOrder(index)}
													size="xs"
													variant="subtle"
												>
													<IconTrash />
												</Button>
											</Group>
										</Group>
									))}
								</Stack>
							)}
						</Stack>
						<Divider />
						<Stack gap="xs">
							<Group gap="xs">
								<IconUserDollar color="var(--mantine-color-orange-6)" />
								<Text fw="bold" size="sm">
									Order Summary
								</Text>
							</Group>
							<Group justify="space-between">
								<Text c="dimmed" size="xs">
									Subtotal
								</Text>
								<Text size="xs">{`Rp. ${orderValues.subtotal.toLocaleString("en-US", { maximumFractionDigits: 2 })}`}</Text>
							</Group>
							<Group align="center" justify="space-between">
								<Group gap="xs">
									<Text c="dimmed" size="xs">
										Discount
									</Text>
									<NumberInput
										allowNegative={false}
										clampBehavior="strict"
										hideControls
										max={100}
										min={0}
										onChange={(value) => {
											const val =
												typeof value === "string" ? Number(value) : value;
											setOrderAdjustments((prev) => ({
												...prev,
												discount: val ?? 0,
											}));
										}}
										rightSection={
											<Text c="dimmed" size="xs">
												%
											</Text>
										}
										size="xs"
										thousandSeparator=","
										value={orderAdjustments.discount}
										w={60}
									/>
								</Group>
								<Text
									size="xs"
									ta="right"
									w={100}
								>{`Rp. ${orderValues.discount.toLocaleString("en-US", { maximumFractionDigits: 2 })}`}</Text>
							</Group>
							<Group align="center" justify="space-between">
								<Group gap="xs">
									<Text c="dimmed" size="xs">
										Service Charge
									</Text>
									<NumberInput
										allowNegative={false}
										clampBehavior="strict"
										hideControls
										max={100}
										min={0}
										onChange={(value) => {
											const val =
												typeof value === "string" ? Number(value) : value;
											setOrderAdjustments((prev) => ({
												...prev,
												serviceCharge: val ?? 0,
											}));
										}}
										rightSection={
											<Text c="dimmed" size="xs">
												%
											</Text>
										}
										size="xs"
										thousandSeparator=","
										value={orderAdjustments.serviceCharge}
										w={60}
									/>
								</Group>
								<Text
									size="xs"
									ta="right"
									w={100}
								>{`Rp. ${orderValues.serviceCharge.toLocaleString("en-US", { maximumFractionDigits: 2 })}`}</Text>
							</Group>
							<Group align="center" justify="space-between">
								<Group gap="xs">
									<Text c="dimmed" size="xs">
										Tax
									</Text>
									<NumberInput
										allowNegative={false}
										clampBehavior="strict"
										hideControls
										max={100}
										min={0}
										onChange={(value) => {
											const val =
												typeof value === "string" ? Number(value) : value;
											setOrderAdjustments((prev) => ({
												...prev,
												tax: val ?? 0,
											}));
										}}
										rightSection={
											<Text c="dimmed" size="xs">
												%
											</Text>
										}
										size="xs"
										ta="right"
										thousandSeparator=","
										value={orderAdjustments.tax}
										w={60}
									/>
								</Group>
								<Text
									size="xs"
									ta="right"
									w={100}
								>{`Rp. ${orderValues.tax.toLocaleString("en-US", { maximumFractionDigits: 2 })}`}</Text>
							</Group>
							<Group justify="space-between">
								<Text c="dimmed" size="xs">
									Adjustment
								</Text>
								<Text size="xs">{`Rp. ${orderValues.adjustment.toLocaleString("en-US", { maximumFractionDigits: 2 })}`}</Text>
							</Group>
							<Group justify="space-between">
								<Text fw="bold">Total</Text>
								<Text fw="bold">{`Rp. ${orderValues.total.toLocaleString("en-US", { maximumFractionDigits: 2 })}`}</Text>
							</Group>
						</Stack>
						<Divider />
						<Button size="xl">Submit order</Button>
					</Stack>
				</ScrollArea>
			</Card>
			<AddCustomerModal close={close} opened={opened} />
		</>
	);
}
