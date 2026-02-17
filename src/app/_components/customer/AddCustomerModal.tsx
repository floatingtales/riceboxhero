"use client";

import { Button, Modal, Stack, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { showNotification } from "@mantine/notifications";
import { api } from "@/trpc/react";

export default function AddCustomerModal({
	opened,
	close,
}: {
	opened: boolean;
	close: () => void;
}) {
	const utils = api.useUtils();
	const addMutation = api.customer.add.useMutation({
		onSuccess: () => {
			utils.customer.getAll.invalidate();
			showNotification({
				message: "Customer added successfully",
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
			name: "",
			phone: "",
			address: "",
		},
		validate: {
			name: (value) =>
				value.length < 3 ? "Name must be at least 3 characters" : null,
			phone: (value) => {
				if (value.length < 9) {
					return "Phone must be at least 9 characters";
				}
				if (!value.match(/^[0-9]+$/)) {
					return "Phone must be a number";
				}
				return null;
			},
			address: (value) =>
				value.length < 10 ? "Address must be at least 10 characters" : null,
		},
		validateInputOnBlur: true,
	});
	const handleClose = () => {
		form.reset();
		close();
	};
	const handleSubmit = (values: {
		name: string;
		phone: string;
		address: string;
	}) => {
		addMutation.mutate(values);
		handleClose();
	};
	return (
		<Modal onClose={handleClose} opened={opened} title="Add Customer">
			<form onSubmit={form.onSubmit(handleSubmit)}>
				<Stack>
					<TextInput
						key={form.key("name")}
						label="Name"
						{...form.getInputProps("name")}
					/>
					<TextInput
						key={form.key("phone")}
						label="Phone"
						{...form.getInputProps("phone")}
					/>
					<TextInput
						key={form.key("address")}
						label="Address"
						{...form.getInputProps("address")}
					/>
					<Button type="submit">Add</Button>
				</Stack>
			</form>
		</Modal>
	);
}
