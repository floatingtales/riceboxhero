"use client";

import {
	ActionIcon,
	Button,
	Group,
	Modal,
	Stack,
	TextInput,
	Tooltip,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import { showNotification } from "@mantine/notifications";
import { IconBan, IconCheck, IconEdit } from "@tabler/icons-react";
import { api } from "@/trpc/react";

export function CustomerActions({
	id,
	isActive,
	phone,
	address,
	name,
}: {
	id: string;
	isActive: boolean;
	phone: string;
	address: string;
	name: string;
}) {
	const utils = api.useUtils();
	const editMutation = api.customer.edit.useMutation({
		onSuccess: () => {
			utils.customer.getAll.invalidate();
			showNotification({
				message: "Customer updated successfully",
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
	const toggleActiveMutation = api.customer.toggleActive.useMutation({
		onSuccess: () => {
			utils.customer.getAll.invalidate();
			utils.customer.getActive.invalidate();
			showNotification({
				message: "Customer status toggled successfully",
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
			name,
			phone: phone.replace(/[^0-9]/g, ""),
			address,
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

	const handleSubmit = ({
		name,
		phone,
		address,
	}: {
		name: string;
		phone: string;
		address: string;
	}) => {
		editMutation.mutate({
			id,
			name,
			phone,
			address,
		});
		handleClose();
	};

	return (
		<>
			<Group gap="xs" justify="center">
				<Tooltip label="Edit">
					<ActionIcon color="blue" variant="light">
						<IconEdit onClick={open} size={16} />
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
			<Modal onClose={handleClose} opened={opened} title="Edit Customer">
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
						<Button type="submit">Save</Button>
					</Stack>
				</form>
			</Modal>
		</>
	);
}
