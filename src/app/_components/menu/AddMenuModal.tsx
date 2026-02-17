"use client";

import {
	Button,
	Modal,
	NumberInput,
	Select,
	Stack,
	TextInput,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { showNotification } from "@mantine/notifications";
import { api } from "@/trpc/react";
import { MENU_TYPE_CONST } from "@/utils/consts";
import { formatSnakeCaseToStandard } from "@/utils/helpers/formatSnakeCaseToStandard";

export default function AddMenuModal({
	opened,
	close,
}: {
	opened: boolean;
	close: () => void;
}) {
	const SELECT_DATA = MENU_TYPE_CONST.map((type) => ({
		label: formatSnakeCaseToStandard(type),
		value: type,
	}));

	const utils = api.useUtils();
	const addMutation = api.menu.add.useMutation({
		onSuccess: () => {
			utils.menu.getAll.invalidate();
			utils.menu.getActive.invalidate();
			showNotification({
				message: "Menu item added successfully",
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
			type: "" as (typeof MENU_TYPE_CONST)[number],
			standardPrice: 0,
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
	const handleSubmit = (values: {
		name: string;
		type: (typeof MENU_TYPE_CONST)[number];
		standardPrice: number;
	}) => {
		addMutation.mutate(values);
		handleClose();
	};
	return (
		<Modal onClose={handleClose} opened={opened} title="Add Menu Item">
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
					<Button loading={addMutation.isPending} type="submit">
						Add
					</Button>
				</Stack>
			</form>
		</Modal>
	);
}
