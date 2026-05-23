"use client";

import {
	Group,
	ScrollArea,
	SegmentedControl,
	Stack,
	Text,
} from "@mantine/core";
import { useState } from "react";
import { api } from "@/trpc/react";
import MetricCards from "../_components/dashboard/MetricCards";
import PaymentBreakdownCard from "../_components/dashboard/PaymentBreakdownCard";
import RecentOrdersCard from "../_components/dashboard/RecentOrdersCard";
import TopCustomersCard from "../_components/dashboard/TopCustomersCard";
import TopSellingItemsCard from "../_components/dashboard/TopSellingItemsCard";
import TypeBreakdownCard from "../_components/dashboard/TypeBreakdownCard";

type Period = "day" | "week" | "month";

export default function DashboardPage() {
	const [period, setPeriod] = useState<Period>("day");

	const overviewQuery = api.order.periodOverview.useQuery(
		{ period },
		{ refetchOnWindowFocus: false },
	);
	const recentOrdersQuery = api.order.recentOrders.useQuery(undefined, {
		refetchOnWindowFocus: false,
	});
	const topItemsQuery = api.order.topSellingItems.useQuery(
		{ period },
		{ refetchOnWindowFocus: false },
	);
	const topCustomersQuery = api.order.topCustomers.useQuery(
		{ period },
		{ refetchOnWindowFocus: false },
	);
	const paymentBreakdownQuery = api.order.paymentMethodBreakdown.useQuery(
		{ period },
		{ refetchOnWindowFocus: false },
	);
	const typeBreakdownQuery = api.order.menuTypeBreakdown.useQuery(
		{ period },
		{ refetchOnWindowFocus: false },
	);

	return (
		<Stack bg="gray.0" flex={1} h="calc(100vh - 56px)" p="xl">
			<ScrollArea h="100%" offsetScrollbars w="100%">
				<Stack gap="lg" pb="100px">
					{/* Header with period selector */}
					<Group align="center" justify="space-between">
						<Stack gap={2}>
							<Text fw={700} size="xl">
								Dashboard
							</Text>
							<Text c="dimmed" size="sm">
								Your business at a glance
							</Text>
						</Stack>
						<SegmentedControl
							data={[
								{ label: "Today", value: "day" },
								{ label: "This Week", value: "week" },
								{ label: "This Month", value: "month" },
							]}
							onChange={(val) => setPeriod(val as Period)}
							value={period}
						/>
					</Group>

					{/* Row 1: Metric cards */}
					<MetricCards
						data={overviewQuery.data}
						isLoading={overviewQuery.isLoading}
						period={period}
					/>

					{/* Row 2: Recent orders */}
					<RecentOrdersCard
						data={recentOrdersQuery.data}
						isLoading={recentOrdersQuery.isLoading}
					/>

					{/* Row 3: Top items + Top customers */}
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

					{/* Row 4: Payment + Type breakdowns */}
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
