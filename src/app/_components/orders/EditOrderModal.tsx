import { Loader, Modal, Text } from "@mantine/core";
import { api } from "@/trpc/react";

export default function EditOrderModal({
	opened,
	onClose,
	id,
}: {
	opened: boolean;
	onClose: () => void;
	id: string;
}) {
	const orderDetailQuery = api.order.seeOrderDetail.useQuery({ id });

	if (orderDetailQuery.isLoading) {
		return (
			<Modal onClose={onClose} opened={opened}>
				<Loader />
			</Modal>
		);
	}

	if (orderDetailQuery.error) {
		return (
			<Modal onClose={onClose} opened={opened}>
				<Text c="red">Failed to load order</Text>
			</Modal>
		);
	}

	return (
		<Modal onClose={onClose} opened={opened}>
			<h1>Edit Order Modal</h1>
		</Modal>
	);
}
