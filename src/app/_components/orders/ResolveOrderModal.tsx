"use client";

import { useActiveMenus } from "@/hooks/useActiveMenus";
import { api } from "@/trpc/react";
import {
  Badge,
  Button,
  Divider,
  Group,
  Modal,
  Select,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import {
  IconUser,
  IconChefHat,
  IconUserDollar,
  IconPrinter,
} from "@tabler/icons-react";
import { useState } from "react";

const STATUS_OPTIONS = [
  { value: "completed", label: "Completed" },
  { value: "voided", label: "Voided" },
];

export default function ResolveOrderModal({
  opened,
  onClose,
  id,
}: {
  opened: boolean;
  onClose: () => void;
  id: string;
}) {
  const utils = api.useUtils();

  const orderQuery = api.order.seeOrderDetail.useQuery(
    { id },
    {
      enabled: !!id,
    },
  );
  const menusQuery = useActiveMenus();

  const updateStatusMutation = api.order.updateOrderStatus.useMutation({
    onSuccess: () => {
      utils.order.unresolvedOrders.invalidate();
      utils.order.seeOrderDetail.invalidate({ id });
      onClose();
      notifications.show({
        title: "Order updated",
        message: "Order updated successfully",
        color: "green",
      });
    },
    onError: (error) => {
      notifications.show({
        title: "Order update failed",
        message: error.message,
        color: "red",
      });
    },
  });

  const [nextStatus, setNextStatus] = useState<string | null>(null);

  const handleSave = () => {
    if (!nextStatus) return;
    updateStatusMutation.mutate({
      id,
      orderStatus: nextStatus as "completed" | "voided",
    });
  };

  if (orderQuery.isLoading) {
    return (
      <Modal title="Resolve Order" opened={opened} onClose={onClose}>
        <Text>Resolving order...</Text>
      </Modal>
    );
  }

  if (orderQuery.error || !orderQuery.data) {
    return (
      <Modal title="Resolve Order" opened={opened} onClose={onClose}>
        <Text c="red">Failed to load order.</Text>
      </Modal>
    );
  }

  const { data: order } = orderQuery;

  return (
    <Modal title="Resolve Order" opened={opened} onClose={onClose} size="lg">
      <Stack gap="xs">
        <Select
          clearable
          data={STATUS_OPTIONS}
          description="Leave empty to keep the current status"
          label="Change Status"
          onChange={(value) => setNextStatus(value)}
          placeholder={`Current: ${order.orderStatus}`}
          value={nextStatus}
        />
        <Divider />
        <Button
          disabled={!nextStatus || updateStatusMutation.isPending}
          onClick={handleSave}
          size="md"
          loading={updateStatusMutation.isPending}
        >
          Update Status
        </Button>
        <Divider />
        <Group gap="xs">
          <IconUser color="var(--mantine-color-orange-6)" />
          <Text fw="bold" size="sm">
            Customer
          </Text>
        </Group>
        <TextInput label="Name" readOnly value={order.customer.name} />
        <TextInput label="Phone" readOnly value={order.customer.phone ?? ""} />
        <TextInput
          label="Address"
          readOnly
          value={order.customer.address ?? ""}
        />
        <Divider />
        <Group gap="xs">
          <IconChefHat color="var(--mantine-color-orange-6)" />
          <Text fw="bold" size="sm">
            Order Items
          </Text>
        </Group>
        {order.orderItems.map((item, index) => (
          <Group
            bg="orange.0"
            justify="space-between"
            key={`${item.menuId}-${index}`}
            p="xs"
          >
            <Stack gap="0">
              <Text fw="bold" size="sm">
                {menusQuery.data?.find((m) => m.id === item.menuId)?.name ??
                  item.menuId}
              </Text>
              <Group gap="xs">
                <Badge size="xs" variant="light">
                  x{item.amount}
                </Badge>
                {(item.discount ?? 0) > 0 && (
                  <Badge color="red" size="xs" variant="light">
                    {(item.discountRate ?? 0) > 0
                      ? `- ${item.discountRate}%`
                      : `- Rp. ${(item.discount ?? 0).toLocaleString("en-US", { maximumFractionDigits: 2 })}`}
                  </Badge>
                )}
              </Group>
            </Stack>
            <Text fw="bold" size="sm">
              Rp.{" "}
              {(item.totalPrice ?? 0).toLocaleString("en-US", {
                maximumFractionDigits: 2,
              })}
            </Text>
          </Group>
        ))}
        <Divider />
        <Group gap="xs">
          <IconUserDollar color="var(--mantine-color-orange-6)" />
          <Text fw="bold" size="sm">
            Total
          </Text>
        </Group>
        <Group justify="space-between">
          <Text fw="bold">Total</Text>
          <Text fw="bold">
            Rp.{" "}
            {order.total.toLocaleString("en-US", {
              maximumFractionDigits: 2,
            })}
          </Text>
        </Group>
        <Group justify="flex-end">
          <Button
            leftSection={<IconPrinter />}
            variant="subtle"
            onClick={() => console.log("redirect to print receipt")}
          >
            Print Receipt
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
