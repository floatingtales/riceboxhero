"use client";

import {
	ActionIcon,
	Button,
	Group,
	Modal,
	NumberInput,
	Select,
	Stack,
	TextInput,
	Tooltip,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import { showNotification } from "@mantine/notifications";
import { IconBan, IconCheck, IconEdit } from "@tabler/icons-react";
import { api } from "@/trpc/react";
import { MENU_TYPE_CONST } from "@/utils/consts";
import { formatSnakeCaseToStandard } from "@/utils/helpers/formatSnakeCaseToStandard";

export function MenuActions({
	id,
	isActive,
	name,
	type,
	standardPrice,
}: {
	id: string;
	isActive: boolean;
	name: string;
	type: (typeof MENU_TYPE_CONST)[number];
	standardPrice: number;
}) {
	const SELECT_DATA = MENU_TYPE_CONST.map((type) => ({
		label: formatSnakeCaseToStandard(type),
		value: type,
	}));

	const utils = api.useUtils();
	const editMutation = api.menu.edit.useMutation({
		onSuccess: () => {
			utils.menu.getAll.invalidate();
			showNotification({
				message: "Menu item updated successfully",
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
	const toggleActiveMutation = api.menu.toggleActive.useMutation({
		onSuccess: () => {
			utils.menu.getAll.invalidate();
			utils.menu.getActive.invalidate();
			showNotification({
				message: "Menu item status toggled successfully",
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
			type,
			standardPrice,
		},
		validate: {
			name: (value) =>
				value.length < 3 ? "Name must be at least 3 characters" : null,
			type: (value) => (value ? null : "Type is required"),
			standardPrice: (value) =>
				value > 0 ? null : "Price must be greater than 0",
		},
		validateInputOnBlur: true,
	});

	const handleClose = () => {
		form.reset();
		close();
	};

	const handleSubmit = ({
		name,
		type,
		standardPrice,
	}: {
		name: string;
		type: (typeof MENU_TYPE_CONST)[number];
		standardPrice: number;
	}) => {
		editMutation.mutate({
			id,
			name,
			type,
			standardPrice,
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
			<Modal onClose={handleClose} opened={opened} title="Edit Menu Item">
				<form onSubmit={form.onSubmit(handleSubmit)}>
					<Stack>
						<TextInput
							key={form.key("name")}
							label="Name"
							withAsterisk
							{...form.getInputProps("name")}
						/>
						<Select
							data={SELECT_DATA}
							key={form.key("type")}
							label="Type"
							withAsterisk
							{...form.getInputProps("type")}
						/>
						<NumberInput
							decimalScale={2}
							hideControls
							key={form.key("standardPrice")}
							label="Price"
							min={0}
							prefix="Rp "
							thousandSeparator=","
							withAsterisk
							{...form.getInputProps("standardPrice")}
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
