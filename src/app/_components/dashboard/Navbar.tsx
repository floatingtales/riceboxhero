"use client";

import {
	Badge,
	Button,
	Group,
	Loader,
	Stack,
	Tabs,
	Text,
	Title,
} from "@mantine/core";
import {
	IconBowlSpoon,
	IconChartBar,
	IconLogout,
	IconMoneybag,
	IconPackage,
	IconSettings,
	IconToolsKitchen3,
	IconUsers,
} from "@tabler/icons-react";
import { usePathname, useRouter } from "next/navigation";
import { logout } from "@/app/_actions/session";
import { api } from "@/trpc/react";
import { PATH_CONST, STATUS_CONST } from "@/utils/consts";

export default function Navbar() {
	const router = useRouter();
	const pathname = usePathname();
	const dayOverviewQuery = api.order.dayOverview.useQuery();

	const handleLogout = async () => {
		const res = await logout();
		if (res.status === STATUS_CONST.REDIRECT) {
			router.push(res.href);
		}
	};

	if (dayOverviewQuery.isError) {
		window.location.reload();
		return;
	}

	return (
		<Stack
			justify="space-between"
			p="md"
			style={{ borderBottom: "1px solid #e9ecef" }}
			w="100svw"
		>
			<Group align="center" justify="space-between" mb="md">
				<Group>
					<IconBowlSpoon color="var(--mantine-color-orange-7)" size={40} />
					<Title c="orange.7" order={3}>
						Rice Box Hero
					</Title>
					<Badge variant="light">Admin</Badge>
				</Group>
				<Group gap="xl">
					<Group gap="xs">
						<IconPackage />
						<Stack gap="0">
							<Text c="dimmed" size="xs">
								Today's Orders
							</Text>
							{dayOverviewQuery.isLoading && <Loader size="sm" />}
							{!dayOverviewQuery.isLoading && (
								<Text fw="bold" size="lg">
									{dayOverviewQuery.data?.count}
								</Text>
							)}
						</Stack>
					</Group>

					<Group gap="xs">
						<IconMoneybag />
						<Stack gap="0">
							<Text c="dimmed" size="xs">
								Today's Sales
							</Text>
							{dayOverviewQuery.isLoading && <Loader size="sm" />}
							{!dayOverviewQuery.isLoading && (
								<Text fw="bold" size="lg">
									{dayOverviewQuery.data?.total}
								</Text>
							)}
						</Stack>
					</Group>

					<Button
						leftSection={<IconLogout />}
						onClick={handleLogout}
						variant="light"
					>
						Logout
					</Button>
				</Group>
			</Group>
			<Tabs
				onChange={(value) => router.push(value as string)}
				value={pathname as string}
			>
				<Tabs.List>
					<Tabs.Tab
						leftSection={<IconChartBar color="var(--mantine-color-orange-5)" />}
						value={PATH_CONST.DASHBOARD}
					>
						Dashboard
					</Tabs.Tab>
					<Tabs.Tab
						leftSection={<IconPackage color="var(--mantine-color-orange-5)" />}
						value={PATH_CONST.ORDERS}
					>
						Orders
					</Tabs.Tab>
					<Tabs.Tab
						leftSection={
							<IconToolsKitchen3 color="var(--mantine-color-orange-5)" />
						}
						value={PATH_CONST.MENU}
					>
						Menu
					</Tabs.Tab>
					<Tabs.Tab
						leftSection={<IconUsers color="var(--mantine-color-orange-5)" />}
						value={PATH_CONST.CUSTOMERS}
					>
						Customers
					</Tabs.Tab>
					<Tabs.Tab
						leftSection={<IconSettings color="var(--mantine-color-orange-5)" />}
						value={PATH_CONST.SETTINGS}
					>
						Admin Settings
					</Tabs.Tab>
				</Tabs.List>
			</Tabs>
		</Stack>
	);
}
