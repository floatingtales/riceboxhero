"use client";

import { Badge, Button, Card, Group, Loader, Stack, Text } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconPlus } from "@tabler/icons-react";
import { useState } from "react";
import AddMenuModal from "@/app/_components/menu/AddMenuModal";
import { MenuActions } from "@/app/_components/menu/MenuActions";
import {
	type Column,
	SortableTable,
} from "@/app/_components/table/SortableTable";
import { api } from "@/trpc/react";
import { formatSnakeCaseToStandard } from "@/utils/helpers/formatSnakeCaseToStandard";

export default function MenuPage() {
	const allMenusQuery = api.menu.getAll.useQuery();

	const [openedAddModal, { open: openAddModal, close: closeAddModal }] =
		useDisclosure();

	const [sortBy, setSortBy] = useState<
		"name" | "id" | "isActive" | "type" | "standardPrice" | null | undefined
	>("name");
	const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

	const handleSort = (key: string) => {
		if (sortBy === key) {
			setSortDirection(sortDirection === "asc" ? "desc" : "asc");
		} else {
			setSortBy(key as "name" | "id" | "isActive" | "type" | "standardPrice");
			setSortDirection("asc");
		}
	};

	const sortedData = [...(allMenusQuery.data || [])].sort((a, b) => {
		if (!sortBy) return 0;

		const aValue = a[sortBy as keyof typeof a];
		const bValue = b[sortBy as keyof typeof b];

		if (typeof aValue === "string" && typeof bValue === "string") {
			return sortDirection === "asc"
				? aValue.localeCompare(bValue)
				: bValue.localeCompare(aValue);
		}

		if (typeof aValue === "number" && typeof bValue === "number") {
			return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
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
		{
			header: "Type",
			key: "type",
			sortable: true,
			render: (row) => formatSnakeCaseToStandard(row.type),
		},
		{
			header: "Price",
			key: "standardPrice",
			sortable: true,
			render: (row) =>
				`Rp. ${row.standardPrice.toLocaleString("en-US", {
					maximumFractionDigits: 2,
				})}`,
		},
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
				<MenuActions
					id={row.id}
					isActive={row.isActive}
					name={row.name}
					standardPrice={row.standardPrice}
					type={row.type}
				/>
			),
		},
	];

	if (allMenusQuery.isLoading) {
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

	if (allMenusQuery.isError) {
		window.location.reload();
		return <Text>Error loading menus</Text>;
	}

	return (
		<Stack bg="gray.0" flex={1} h="calc(100vh - 56px)" p="xl">
			<Card h="95%" px="xl" py="lg" withBorder>
				<Stack gap="md" h="100%" w="100%">
					<Group align="center" justify="space-between">
						<Stack gap="xs">
							<Text fw="bold" size="xl">
								Menu
							</Text>
							<Text c="dimmed" size="xs">
								Manage your menu items
							</Text>
						</Stack>
						<Button leftSection={<IconPlus />} onClick={openAddModal}>
							Add Menu Item
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
			<AddMenuModal close={closeAddModal} opened={openedAddModal} />
		</Stack>
	);
}
