"use client";

import {
	Button,
	Center,
	Grid,
	Group,
	Loader,
	Paper,
	PasswordInput,
	Stack,
	Text,
	TextInput,
	Title,
} from "@mantine/core";
import { isNotEmpty, useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { IconBowlSpoon } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { PATH_CONST, STATUS_CONST } from "@/utils/consts";
import { checkSession, login } from "./_actions/session";

export default function Home() {
	const [loading, setLoading] = useState(true);

	const router = useRouter();

	const form = useForm({
		mode: "uncontrolled",
		initialValues: {
			username: "",
			password: "",
		},
		validate: {
			username: isNotEmpty("username must not be empty"),
			password: isNotEmpty("password must not be empty"),
		},
		validateInputOnBlur: true,
	});

	const handleLogin = async ({
		username,
		password,
	}: {
		username: string;
		password: string;
	}) => {
		setLoading(true);
		const ipResponse = await fetch("https://api.ipify.org?format=json");
		const { ip } = await ipResponse.json();
		const res = await login({ ip, username, password });
		if (res.status === STATUS_CONST.REDIRECT) {
			router.push(res.href);
		} else if (res.status === STATUS_CONST.ALERT) {
			notifications.show({
				message: res.message,
			});
			setLoading(false);
		} else {
			setLoading(false);
		}
	};

	useEffect(() => {
		const checkSessionAsync = async () => {
			setLoading(true);
			const res = await checkSession();
			if (res) {
				router.push(PATH_CONST.DASHBOARD);
			} else {
				setLoading(false);
			}
		};
		checkSessionAsync();
	}, [router]);

	if (loading)
		return (
			<Stack align="center" h="100svh" justify="center" w="100svw">
				<Loader size="lg" type="dots" />
			</Stack>
		);

	return (
		<Grid m={0} style={{ height: "100svh" }}>
			<Grid.Col className="mesh-gradient-bg" span={{ base: 12, md: 7 }}>
				<Center h="100%" px="xl">
					<Stack align="flex-start" gap="lg" style={{ color: "white" }}>
						<IconBowlSpoon color="white" size={80} />
						<Title fw={900} order={1} size="h1">
							Welcome to Rice Box Hero
						</Title>
						<Text maw={500} opacity={0.9} size="xl">
							The ultimate ERP system to manage your restaurant seamlessly. Keep
							track of orders, customers, and inventory with elegance.
						</Text>
					</Stack>
				</Center>
			</Grid.Col>
			<Grid.Col span={{ base: 12, md: 5 }}>
				<Center bg="gray.0" h="100%" px={{ base: "md", md: "xl" }}>
					<Paper
						className="glass-card hover-lift"
						maw={400}
						p="xl"
						radius="md"
						shadow="xl"
						w="100%"
					>
						<form onSubmit={form.onSubmit(handleLogin)}>
							<Stack gap="md">
								<Group mb="md">
									<IconBowlSpoon
										color="var(--mantine-color-orange-6)"
										size={32}
									/>
									<Title c="dark.8" order={2}>
										Sign In
									</Title>
								</Group>
								<TextInput
									key={form.key("username")}
									label="Username"
									size="md"
									withAsterisk
									{...form.getInputProps("username")}
								/>
								<PasswordInput
									key={form.key("password")}
									label="Password"
									size="md"
									withAsterisk
									{...form.getInputProps("password")}
								/>
								<Button fullWidth mt="md" size="md" type="submit">
									Login to Dashboard
								</Button>
							</Stack>
						</form>
					</Paper>
				</Center>
			</Grid.Col>
		</Grid>
	);
}
