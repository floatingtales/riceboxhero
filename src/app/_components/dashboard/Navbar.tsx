"use client";

import {
	AppShell,
	Badge,
	Button,
	Group,
	Loader,
	NavLink,
	Stack,
	Text,
	Title,
} from "@mantine/core";
import {
	IconBowlSpoon,
	IconChartBar,
	IconHistory,
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

	const navLinks = [
		{ label: "Dashboard", icon: IconChartBar, path: PATH_CONST.DASHBOARD },
		{ label: "Orders", icon: IconPackage, path: PATH_CONST.ORDERS },
		{ label: "History", icon: IconHistory, path: PATH_CONST.HISTORY },
		{ label: "Menu", icon: IconToolsKitchen3, path: PATH_CONST.MENU },
		{ label: "Customers", icon: IconUsers, path: PATH_CONST.CUSTOMERS },
		{ label: "Settings", icon: IconSettings, path: PATH_CONST.SETTINGS },
	];

	return (
		<AppShell.Navbar p="md" style={{ borderRight: "1px solid #e9ecef" }}>
			<AppShell.Section mb="xl">
				<Group align="center" gap="sm" justify="flex-start">
					<IconBowlSpoon color="var(--mantine-color-orange-7)" size={32} />
					<Stack gap={0}>
						<Title c="orange.7" fw={800} order={4}>
							Rice Box Hero
						</Title>
						<Badge mt={2} size="sm" variant="light">
							Admin
						</Badge>
					</Stack>
				</Group>
			</AppShell.Section>

			<AppShell.Section grow>
				<Stack gap="xs">
					{navLinks.map((link) => {
						const Icon = link.icon;
						return (
							<NavLink
								active={pathname === link.path}
								color="orange"
								key={link.path}
								label={link.label}
								leftSection={
									<Icon
										color={
											pathname === link.path
												? "var(--mantine-color-orange-6)"
												: "var(--mantine-color-gray-6)"
										}
										size="1.2rem"
										stroke={1.5}
									/>
								}
								onClick={() => router.push(link.path)}
								style={{
									borderRadius: "8px",
									fontWeight: pathname === link.path ? 600 : 400,
								}}
								variant="light"
							/>
						);
					})}
				</Stack>
			</AppShell.Section>

			<AppShell.Section>
				<Stack gap="md">
					<Group gap="xs" wrap="nowrap">
						<IconPackage color="var(--mantine-color-orange-6)" size={24} />
						<Stack gap={0}>
							<Text c="dimmed" fw={600} size="xs">
								Today's Orders
							</Text>
							{dayOverviewQuery.isLoading ? (
								<Loader size="xs" />
							) : (
								<Text fw={700} size="md">
									{dayOverviewQuery.data?.count}
								</Text>
							)}
						</Stack>
					</Group>

					<Group gap="xs" wrap="nowrap">
						<IconMoneybag color="var(--mantine-color-orange-6)" size={24} />
						<Stack gap={0}>
							<Text c="dimmed" fw={600} size="xs">
								Today's Sales
							</Text>
							{dayOverviewQuery.isLoading ? (
								<Loader size="xs" />
							) : (
								<Text fw={700} size="md">
									${dayOverviewQuery.data?.total}
								</Text>
							)}
						</Stack>
					</Group>

					<Button
						color="red"
						fullWidth
						leftSection={<IconLogout size={18} />}
						mt="sm"
						onClick={handleLogout}
						variant="light"
					>
						Logout
					</Button>
				</Stack>
			</AppShell.Section>
		</AppShell.Navbar>
	);
}
