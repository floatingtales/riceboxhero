"use client";

import {
	Group,
	ScrollArea,
	SegmentedControl,
	Stack,
	Text,
} from "@mantine/core";
import {
	DatePickerInput,
	MonthPickerInput,
	YearPickerInput,
} from "@mantine/dates";
import { useState } from "react";
import MetricCards from "@/app/_components/dashboard/MetricCards";
import PaymentBreakdownCard from "@/app/_components/dashboard/PaymentBreakdownCard";
import TopCustomersCard from "@/app/_components/dashboard/TopCustomersCard";
import TopSellingItemsCard from "@/app/_components/dashboard/TopSellingItemsCard";
import TypeBreakdownCard from "@/app/_components/dashboard/TypeBreakdownCard";
import HistoryOrdersCard from "@/app/_components/history/HistoryOrdersCard";
import { api } from "@/trpc/react";

type Mode = "day" | "month" | "year";

export default function HistoryPage() {
	const [mode, setMode] = useState<Mode>("day");
	const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());

	const referenceDate = selectedDate ?? new Date();

	const overviewQuery = api.order.periodOverview.useQuery(
		{ period: mode, referenceDate },
		{ refetchOnWindowFocus: false },
	);
	const topItemsQuery = api.order.topSellingItems.useQuery(
		{ period: mode, referenceDate },
		{ refetchOnWindowFocus: false },
	);
	const topCustomersQuery = api.order.topCustomers.useQuery(
		{ period: mode, referenceDate },
		{ refetchOnWindowFocus: false },
	);
	const paymentBreakdownQuery = api.order.paymentMethodBreakdown.useQuery(
		{ period: mode, referenceDate },
		{ refetchOnWindowFocus: false },
	);
	const typeBreakdownQuery = api.order.menuTypeBreakdown.useQuery(
		{ period: mode, referenceDate },
		{ refetchOnWindowFocus: false },
	);
	const ordersQuery = api.order.orders.useQuery(
		{ date: referenceDate, todayOnly: true },
		{ refetchOnWindowFocus: false, enabled: mode === "day" },
	);

	const handleModeChange = (newMode: string) => {
		setMode(newMode as Mode);
		setSelectedDate(new Date());
	};

	return (
		<Stack bg="gray.0" flex={1} h="calc(100vh - 56px)" p="xl">
			<ScrollArea h="100%" offsetScrollbars w="100%">
				<Stack gap="lg" pb="100px">
					{/* Header */}
					<Group align="center" justify="space-between">
						<Stack gap={2}>
							<Text fw={700} size="xl">
								Order History
							</Text>
							<Text c="dimmed" size="sm">
								Browse past order data
							</Text>
						</Stack>
						<Group gap="md">
							{mode === "day" && (
								<DatePickerInput
									onChange={(val) =>
										setSelectedDate(val ? new Date(val) : null)
									}
									placeholder="Pick a date"
									value={selectedDate}
									w={180}
								/>
							)}
							{mode === "month" && (
								<MonthPickerInput
									onChange={(val) =>
										setSelectedDate(val ? new Date(val) : null)
									}
									placeholder="Pick a month"
									value={selectedDate}
									w={180}
								/>
							)}
							{mode === "year" && (
								<YearPickerInput
									onChange={(val) =>
										setSelectedDate(val ? new Date(val) : null)
									}
									placeholder="Pick a year"
									value={selectedDate}
									w={180}
								/>
							)}
							<SegmentedControl
								data={[
									{ label: "Day", value: "day" },
									{ label: "Month", value: "month" },
									{ label: "Year", value: "year" },
								]}
								onChange={handleModeChange}
								value={mode}
							/>
						</Group>
					</Group>

					{/* Metric cards */}
					<MetricCards
						data={overviewQuery.data}
						isLoading={overviewQuery.isLoading}
						period={mode}
					/>

					{/* Orders list — day mode only */}
					{mode === "day" && (
						<HistoryOrdersCard
							data={ordersQuery.data}
							isLoading={ordersQuery.isLoading}
						/>
					)}

					{/* Insight cards */}
					<Group align="start" gap="md" grow>
						<TopSellingItemsCard
							data={topItemsQuery.data}
							isLoading={topItemsQuery.isLoading}
						/>
						<TopCustomersCard
							data={topCustomersQuery.data}
							isLoading={topCustomersQuery.isLoading}
						/>
					</Group>
					<Group align="start" gap="md" grow>
						<PaymentBreakdownCard
							data={paymentBreakdownQuery.data}
							isLoading={paymentBreakdownQuery.isLoading}
						/>
						<TypeBreakdownCard
							data={typeBreakdownQuery.data}
							isLoading={typeBreakdownQuery.isLoading}
						/>
					</Group>
				</Stack>
			</ScrollArea>
		</Stack>
	);
}
