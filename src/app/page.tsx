"use client";

import {
	Button,
	Card,
	Group,
	Loader,
	PasswordInput,
	Stack,
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
	const [loading, setLoading] = useState(false);

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
		}
		if (res.status === STATUS_CONST.ALERT) {
			notifications.show({
				message: res.message,
			});
		}
		setLoading(false);
	};

	useEffect(() => {
		setLoading(true);
		checkSession().then((res) => {
			if (res) {
				router.push(PATH_CONST.DASHBOARD);
			}
		});
		setLoading(false);
	}, [router]);

	if (loading)
		return (
			<Stack align="center" h="100svh" justify="center" w="100svw">
				<Loader size="lg" type="dots" />
			</Stack>
		);

	return (
		<Stack align="center" bg="gray.0" h="100svh" justify="center" w="100svw">
			<Card padding="xl" radius="md" shadow="sm" withBorder>
				<form onSubmit={form.onSubmit(handleLogin)}>
					<Stack gap="sm" w="100%">
						<Group>
							<IconBowlSpoon />
							<Title c="orange" order={3}>
								Rice Box Hero
							</Title>
						</Group>
						<TextInput
							key={form.key("username")}
							label="Username"
							withAsterisk
							{...form.getInputProps("username")}
						/>
						<PasswordInput
							key={form.key("password")}
							label="Password"
							withAsterisk
							{...form.getInputProps("password")}
						/>
						<Button type="submit">Login</Button>
					</Stack>
				</form>
			</Card>
		</Stack>
	);
}
