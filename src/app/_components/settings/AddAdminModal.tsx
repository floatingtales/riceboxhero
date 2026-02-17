"use client";

import { Button, Modal, PasswordInput, Stack, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { showNotification } from "@mantine/notifications";
import { api } from "@/trpc/react";

export default function AddAdminModal({
	opened,
	close,
}: {
	opened: boolean;
	close: () => void;
}) {
	const utils = api.useUtils();
	const addMutation = api.admin.add.useMutation({
		onSuccess: () => {
			utils.admin.getAll.invalidate();
			showNotification({
				message: "Admin added successfully",
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
	const form = useForm({
		mode: "uncontrolled",
		initialValues: {
			username: "",
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
	const handleSubmit = (values: { username: string; password: string }) => {
		addMutation.mutate(values);
		handleClose();
	};
	return (
		<Modal onClose={handleClose} opened={opened} title="Add Admin">
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
						label="Password"
						withAsterisk
						{...form.getInputProps("password")}
					/>
					<Button loading={addMutation.isPending} type="submit">
						Add
					</Button>
				</Stack>
			</form>
		</Modal>
	);
}
