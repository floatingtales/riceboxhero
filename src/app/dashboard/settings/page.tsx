"use client";

import { Badge, Button, Card, Group, Loader, Stack, Text } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconPlus } from "@tabler/icons-react";
import { useState } from "react";
import AddAdminModal from "@/app/_components/settings/AddAdminModal";
import { AdminActions } from "@/app/_components/settings/AdminActions";
import {
	type Column,
	SortableTable,
} from "@/app/_components/table/SortableTable";
import { api } from "@/trpc/react";

export default function SettingsPage() {
	const allAdminsQuery = api.admin.getAll.useQuery();

	const [openedAddModal, { open: openAddModal, close: closeAddModal }] =
		useDisclosure();

	const [sortBy, setSortBy] = useState<
		"username" | "id" | "isActive" | null | undefined
	>("username");
	const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

	const handleSort = (key: string) => {
		if (sortBy === key) {
			setSortDirection(sortDirection === "asc" ? "desc" : "asc");
		} else {
			setSortBy(key as "username" | "id" | "isActive");
			setSortDirection("asc");
		}
	};

	const sortedData = [...(allAdminsQuery.data || [])].sort((a, b) => {
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
		{ header: "Username", key: "username", sortable: true },
		{
			header: "Status",
			key: "isActive",
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
				<AdminActions
					id={row.id}
					isActive={row.isActive}
					username={row.username}
				/>
			),
		},
	];

	if (allAdminsQuery.isLoading) {
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

	if (allAdminsQuery.isError) {
		window.location.reload();
		return <Text>Error loading admins</Text>;
	}

	return (
		<Stack bg="gray.0" flex={1} h="calc(100vh - 56px)" p="xl">
			<Card h="95%" px="xl" py="lg" withBorder>
				<Stack gap="md" h="100%" w="100%">
					<Group align="center" justify="space-between">
						<Stack gap="xs">
							<Text fw="bold" size="xl">
								Settings
							</Text>
							<Text c="dimmed" size="xs">
								Manage admins
							</Text>
						</Stack>
						<Button leftSection={<IconPlus />} onClick={openAddModal}>
							Add Admin
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
			<AddAdminModal close={closeAddModal} opened={openedAddModal} />
		</Stack>
	);
}
