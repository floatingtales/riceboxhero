"use client";

import { Center, Group, Table, Text, UnstyledButton } from "@mantine/core";
import {
	IconChevronDown,
	IconChevronUp,
	IconSelector,
} from "@tabler/icons-react";
import type { ReactNode } from "react";

export interface Column<T> {
	header: string;
	key: keyof T | string; // keyof T for data access, or string for custom cell
	sortable?: boolean;
	width?: string | number;
	render?: (row: T) => ReactNode;
	align?: "left" | "center" | "right";
}

interface SortableTableProps<T> {
	data: T[];
	columns: Column<T>[];
	onSort?: (key: keyof T) => void;
	sortBy?: keyof T | null;
	sortDirection?: "asc" | "desc";
}

export function SortableTable<T extends { id: string | number }>({
	data,
	columns,
	onSort,
	sortBy,
	sortDirection,
}: SortableTableProps<T>) {
	const handleSort = (key: keyof T) => {
		if (onSort) {
			onSort(key);
		}
	};

	const rows = data.map((row) => (
		<Table.Tr key={row.id}>
			{columns.map((col) => (
				<Table.Td align={col.align} key={col.key as string}>
					{col.render
						? col.render(row)
						: (row[col.key as keyof T] as ReactNode)}
				</Table.Td>
			))}
		</Table.Tr>
	));

	return (
		<Table.ScrollContainer h="100%" minWidth={500} w="100%">
			<Table
				highlightOnHover
				layout="fixed"
				stickyHeader
				striped
				withRowBorders
				withTableBorder
			>
				<Table.Thead>
					<Table.Tr>
						{columns.map((col) => {
							const isSorted = sortBy === col.key;
							const Icon = isSorted
								? sortDirection === "asc"
									? IconChevronUp
									: IconChevronDown
								: IconSelector;

							return (
								<Table.Th key={col.key as string} style={{ width: col.width }}>
									{col.sortable ? (
										<UnstyledButton
											onClick={() => handleSort(col.key as keyof T)}
											style={{
												width: "100%",
												display: "flex",
												justifyContent:
													col.align === "center" ? "center" : "space-between",
												alignItems: "center",
											}}
										>
											<Group gap="xs" wrap="nowrap">
												<Text fw={700} size="sm">
													{col.header}
												</Text>
												<Center>
													<Icon size={14} stroke={1.5} />
												</Center>
											</Group>
										</UnstyledButton>
									) : (
										<Text fw={700} size="sm" ta={col.align}>
											{col.header}
										</Text>
									)}
								</Table.Th>
							);
						})}
					</Table.Tr>
				</Table.Thead>
				<Table.Tbody>{rows}</Table.Tbody>
			</Table>
		</Table.ScrollContainer>
	);
}
