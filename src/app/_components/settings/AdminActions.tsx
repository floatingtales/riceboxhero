"use client";

import {
	ActionIcon,
	Button,
	Group,
	Modal,
	PasswordInput,
	Stack,
	TextInput,
	Tooltip,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import { showNotification } from "@mantine/notifications";
import { IconBan, IconCheck, IconEdit } from "@tabler/icons-react";
import { api } from "@/trpc/react";

export function AdminActions({
	id,
	isActive,
	username,
}: {
	id: string;
	isActive: boolean;
	username: string;
}) {
	const utils = api.useUtils();
	const editMutation = api.admin.edit.useMutation({
		onSuccess: () => {
			utils.admin.getAll.invalidate();
			showNotification({
				message: "Admin updated successfully",
				color: "green",
				title: "Success",
			});
		},
		onError: (error) => {
			showNotification({
				message: error.message,
				color: "red",
				title: "Error",
			});
		},
	});
	const toggleActiveMutation = api.admin.toggleActive.useMutation({
		onSuccess: () => {
			utils.admin.getAll.invalidate();
			showNotification({
				message: "Admin status toggled successfully",
				color: "green",
				title: "Success",
			});
		},
		onError: (error) => {
			showNotification({
				message: error.message,
				color: "red",
				title: "Error",
			});
		},
	});

	const [opened, { open, close }] = useDisclosure();

	const form = useForm({
		mode: "uncontrolled",
		initialValues: {
			username,
			password: "",
		},
		validate: {
			username: (value) =>
				value.length < 3 ? "Username must be at least 3 characters" : null,
			password: (value) =>
				value.length < 6 ? "Password must be at least 6 characters" : null,
		},
		validateInputOnBlur: true,
	});

	const handleClose = () => {
		form.reset();
		close();
	};

	const handleSubmit = ({
		username,
		password,
	}: {
		username: string;
		password: string;
	}) => {
		editMutation.mutate({
			id,
			username,
			password,
		});
		handleClose();
	};

	return (
		<>
			<Group gap="xs" justify="center">
				<Tooltip label="Edit">
					<ActionIcon color="blue" onClick={open} variant="light">
						<IconEdit size={16} />
					</ActionIcon>
				</Tooltip>
				<Tooltip label={isActive ? "Deactivate" : "Activate"}>
					<ActionIcon
						color={isActive ? "red" : "green"}
						loading={toggleActiveMutation.isPending}
						onClick={() => toggleActiveMutation.mutate({ id })}
						variant="light"
					>
						{isActive ? <IconBan size={16} /> : <IconCheck size={16} />}
					</ActionIcon>
				</Tooltip>
			</Group>
			<Modal onClose={handleClose} opened={opened} title="Edit Admin">
				<form onSubmit={form.onSubmit(handleSubmit)}>
					<Stack>
						<TextInput
							key={form.key("username")}
							label="Username"
							withAsterisk
							{...form.getInputProps("username")}
						/>
						<PasswordInput
							key={form.key("password")}
							label="New Password"
							withAsterisk
							{...form.getInputProps("password")}
						/>
						<Button loading={editMutation.isPending} type="submit">
							Save
						</Button>
					</Stack>
				</form>
			</Modal>
		</>
	);
}
