"use client";

import { Badge, Button, Card, Group, Loader, Stack, Text } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconPlus } from "@tabler/icons-react";
import { useState } from "react";
import AddCustomerModal from "@/app/_components/customer/AddCustomerModal";
import { CustomerActions } from "@/app/_components/customer/CustomerActions";
import {
	type Column,
	SortableTable,
} from "@/app/_components/table/SortableTable";
import { api } from "@/trpc/react";

export default function CustomersPage() {
	const allCustomersQuery = api.customer.getAll.useQuery();

	const [openedAddModal, { open: openAddModal, close: closeAddModal }] =
		useDisclosure();

	const [sortBy, setSortBy] = useState<
		"name" | "id" | "isActive" | "phone" | "address" | null | undefined
	>("name");
	const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

	const handleSort = (key: string) => {
		if (sortBy === key) {
			setSortDirection(sortDirection === "asc" ? "desc" : "asc");
		} else {
			setSortBy(key as "name" | "id" | "isActive" | "phone" | "address");
			setSortDirection("asc");
		}
	};

	const sortedData = [...(allCustomersQuery.data || [])].sort((a, b) => {
		if (!sortBy) return 0;

		const aValue = a[sortBy as keyof typeof a];
		const bValue = b[sortBy as keyof typeof b];

		if (typeof aValue === "string" && typeof bValue === "string") {
			return sortDirection === "asc"
				? aValue.localeCompare(bValue)
				: bValue.localeCompare(aValue);
		}

		if (typeof aValue === "boolean" && typeof bValue === "boolean") {
			return sortDirection === "asc"
				? Number(aValue) - Number(bValue)
				: Number(bValue) - Number(aValue);
		}

		return 0;
	});

	const columns: Column<(typeof sortedData)[0]>[] = [
		{ header: "Name", key: "name", sortable: true },
		{ header: "Phone", key: "phone" },
		{ header: "Address", key: "address" },
		{
			header: "Status",
			key: "isActive",
			width: 120,
			render: (row) => (
				<Badge color={row.isActive ? "green" : "red"}>
					{row.isActive ? "Active" : "Inactive"}
				</Badge>
			),
		},
		{
			header: "Actions",
			key: "actions",
			width: 100,
			align: "center",
			render: (row) => (
				<CustomerActions
					address={row.address}
					id={row.id}
					isActive={row.isActive}
					name={row.name}
					phone={row.phone}
				/>
			),
		},
	];

	if (allCustomersQuery.isLoading) {
		return (
			<Stack
				align="center"
				bg="gray.0"
				flex={1}
				h="calc(100vh - 56px)"
				justify="center"
				p="xl"
			>
				<Loader />
			</Stack>
		);
	}

	if (allCustomersQuery.isError) {
		window.location.reload();
		return <Text>Error loading customers</Text>;
	}

	return (
		<Stack bg="gray.0" flex={1} h="calc(100vh - 56px)" p="xl">
			<Card h="95%" px="xl" py="lg" withBorder>
				<Stack gap="md" h="100%" w="100%">
					<Group align="center" justify="space-between">
						<Stack gap="xs">
							<Text fw="bold" size="xl">
								Customers
							</Text>
							<Text c="dimmed" size="xs">
								Manage your customers
							</Text>
						</Stack>
						<Button leftSection={<IconPlus />} onClick={openAddModal}>
							Add Customer
						</Button>
					</Group>
					<SortableTable
						columns={columns}
						data={sortedData}
						onSort={(key) => handleSort(key as string)}
						sortBy={sortBy}
						sortDirection={sortDirection}
					/>
				</Stack>
			</Card>
			<AddCustomerModal close={closeAddModal} opened={openedAddModal} />
		</Stack>
	);
}
