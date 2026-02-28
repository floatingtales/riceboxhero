"use client";

import {
  Badge,
  Button,
  Divider,
  Group,
  Loader,
  Modal,
  NumberInput,
  ScrollArea,
  SegmentedControl,
  Select,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import {
  IconChefHat,
  IconNotes,
  IconToolsKitchen3,
  IconTrash,
  IconUser,
  IconUserDollar,
  IconWallet,
} from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { useActiveCustomers } from "@/hooks/useActiveCustomers";
import { useActiveMenus } from "@/hooks/useActiveMenus";
import { PAYMENT_METHOD_CONST } from "@/utils/consts";
import { api } from "@/trpc/react";

// Allowed status transitions per business rule
const NEXT_STATUS_OPTIONS: Record<string, { label: string; value: string }[]> =
  {
    pending: [
      { label: "Paid", value: "paid" },
      { label: "Voided", value: "voided" },
    ],
    paid: [{ label: "Completed", value: "completed" }],
    completed: [],
    voided: [],
  };

type OrderItem = {
  menuId: string;
  amount: number;
  grossPrice: number;
  discount: number;
  discountRate: number;
  totalPrice: number;
};

export default function EditOrderModal({
  opened,
  onClose,
  id,
}: {
  opened: boolean;
  onClose: () => void;
  id: string;
}) {
  const utils = api.useUtils();

  const customersQuery = useActiveCustomers();
  const menusQuery = useActiveMenus();
  const orderDetailQuery = api.order.seeOrderDetail.useQuery(
    { id },
    { enabled: !!id },
  );

  const updateStatusMutation = api.order.updateOrderStatus.useMutation({
    onSuccess: () => {
      utils.order.orders.invalidate();
      utils.order.dayOverview.invalidate();
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

  const updatePendingMutation = api.order.updatePendingOrder.useMutation({
    onSuccess: () => {
      utils.order.orders.invalidate();
      utils.order.dayOverview.invalidate();
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

  const [customerId, setCustomerId] = useState<string>("");
  const [selectedMenu, setSelectedMenu] = useState<{
    id: string;
    amount: number;
    discount: number;
    discountType: "percent" | "value";
    standardPrice: number;
  }>({
    id: "",
    amount: 1,
    discount: 0,
    discountType: "value",
    standardPrice: 0,
  });
  const [toBeAddedMenu, setToBeAddedMenu] = useState<OrderItem>({
    menuId: "",
    amount: 0,
    grossPrice: 0,
    discount: 0,
    discountRate: 0,
    totalPrice: 0,
  });
  const [orderList, setOrderList] = useState<OrderItem[]>([]);
  const [orderAdjustments, setOrderAdjustments] = useState<{
    discount: number;
    serviceCharge: number;
    tax: number;
  }>({ discount: 0, serviceCharge: 0, tax: 11 });
  const [orderNotes, setOrderNotes] = useState<string>("");
  const [orderValues, setOrderValues] = useState<{
    subtotal: number;
    discount: number;
    discountRate: number;
    serviceCharge: number;
    serviceChargeRate: number;
    tax: number;
    taxRate: number;
    adjustment: number;
    total: number;
  }>({
    subtotal: 0,
    discount: 0,
    discountRate: 0,
    serviceCharge: 0,
    serviceChargeRate: 0,
    tax: 0,
    taxRate: 0,
    adjustment: 0,
    total: 0,
  });
  const [nextStatus, setNextStatus] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<string | null>(null);

  useEffect(() => {
    const data = orderDetailQuery.data;
    if (!data || data.orderStatus !== "pending") return;

    setCustomerId(data.customer.id);
    setOrderNotes(data.orderNote ?? "");
    setOrderAdjustments({
      discount: data.discountRate ?? 0,
      serviceCharge: data.serviceChargeRate ?? 0,
      tax: data.taxRate ?? 0,
    });
    setPaymentMethod(data.paymentMethod ?? null);
    setOrderList(
      data.orderItems.map((item) => ({
        menuId: item.menuId,
        amount: item.amount ?? 0,
        grossPrice: item.grossPrice ?? 0,
        discount: item.discount ?? 0,
        discountRate: item.discountRate ?? 0,
        totalPrice: item.totalPrice ?? 0,
      })),
    );
  }, [orderDetailQuery.data]);

  useEffect(() => {
    const grossPrice = selectedMenu.standardPrice * selectedMenu.amount;
    const discount =
      selectedMenu.discountType === "percent"
        ? grossPrice * (selectedMenu.discount / 100)
        : selectedMenu.discount * selectedMenu.amount;
    const totalPrice = grossPrice - discount;
    setToBeAddedMenu({
      menuId: selectedMenu.id,
      amount: selectedMenu.amount,
      grossPrice,
      discount,
      discountRate:
        selectedMenu.discountType === "percent" ? selectedMenu.discount : 0,
      totalPrice,
    });
  }, [selectedMenu]);

  useEffect(() => {
    const subtotal = orderList.reduce((acc, item) => acc + item.totalPrice, 0);
    const discount = subtotal * (orderAdjustments.discount / 100);
    const postDiscount = subtotal - discount;
    const serviceCharge = postDiscount * (orderAdjustments.serviceCharge / 100);
    const preTaxTotal = postDiscount + serviceCharge;
    const tax = preTaxTotal * (orderAdjustments.tax / 100);
    const preAdjustmentTotal = preTaxTotal + tax;
    const adjustment = preAdjustmentTotal % 1000;
    const total = preAdjustmentTotal - adjustment;
    setOrderValues((prev) => ({
      ...prev,
      subtotal,
      discount,
      discountRate: orderAdjustments.discount,
      serviceCharge,
      serviceChargeRate: orderAdjustments.serviceCharge,
      tax,
      taxRate: orderAdjustments.tax,
      adjustment,
      total,
    }));
  }, [orderList, orderAdjustments]);

  const handleAddToOrder = () => {
    if (toBeAddedMenu.menuId === "") return;
    setOrderList((prev) => [...prev, toBeAddedMenu]);
  };

  const handleRemoveFromOrder = (index: number) => {
    setOrderList((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    const currentStatus = orderDetailQuery.data?.orderStatus;
    if (!currentStatus) return;

    if (currentStatus === "pending") {
      updatePendingMutation.mutate({
        id,
        customerId,
        orderItems: orderList,
        orderValues,
        orderNote: orderNotes || undefined,
        orderStatus:
          nextStatus === "paid" || nextStatus === "voided"
            ? nextStatus
            : undefined,
        paymentMethod: paymentMethod as
          | (typeof PAYMENT_METHOD_CONST)[number]
          | undefined,
      });
    } else if (currentStatus === "paid" && nextStatus === "completed") {
      updateStatusMutation.mutate({ id, orderStatus: "completed" });
    }
  };

  if (
    orderDetailQuery.isLoading ||
    customersQuery.isLoading ||
    menusQuery.isLoading
  ) {
    return (
      <Modal onClose={onClose} opened={opened} title="Edit Order">
        <Stack align="center" py="xl">
          <Loader />
        </Stack>
      </Modal>
    );
  }

  if (orderDetailQuery.error ?? customersQuery.error ?? menusQuery.error) {
    return (
      <Modal onClose={onClose} opened={opened} title="Edit Order">
        <Text c="red">Failed to load order data</Text>
      </Modal>
    );
  }

  const orderData = orderDetailQuery.data;
  if (!orderData) return null;

  const currentStatus = orderData.orderStatus;
  const isPending = currentStatus === "pending";
  const isPaid = currentStatus === "paid";
  const isLocked = currentStatus === "completed" || currentStatus === "voided";
  const nextStatusOptions = NEXT_STATUS_OPTIONS[currentStatus] ?? [];
  const isMutating =
    updateStatusMutation.isPending || updatePendingMutation.isPending;

  const readOnlySummary = (
    <Stack gap="xs">
      <Group gap="xs">
        <IconUser color="var(--mantine-color-orange-6)" />
        <Text fw="bold" size="sm">
          Customer
        </Text>
      </Group>
      <TextInput label="Name" readOnly value={orderData.customer.name} />
      <TextInput
        label="Phone"
        readOnly
        value={orderData.customer.phone ?? ""}
      />
      <TextInput
        label="Address"
        readOnly
        value={orderData.customer.address ?? ""}
      />
      <Divider />
      <Group gap="xs">
        <IconChefHat color="var(--mantine-color-orange-6)" />
        <Text fw="bold" size="sm">
          Order Items
        </Text>
      </Group>
      {orderData.orderItems.map((item, index) => (
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
          {orderData.total.toLocaleString("en-US", {
            maximumFractionDigits: 2,
          })}
        </Text>
      </Group>
      {orderData.paymentMethod && (
        <Group justify="space-between">
          <Text c="dimmed" size="xs">
            Payment Method
          </Text>
          <Badge variant="light">
            {orderData.paymentMethod.charAt(0).toUpperCase() +
              orderData.paymentMethod.slice(1)}
          </Badge>
        </Group>
      )}
    </Stack>
  );

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <Modal
      onClose={onClose}
      opened={opened}
      size="lg"
      title={`Edit Order — ${orderData.orderNumber}`}
    >
      <ScrollArea h="75svh" offsetScrollbars>
        <Stack gap="md" w="98%">
          {isPending && (
            <>
              {/* ── Customer section ── */}
              <Stack gap="xs">
                <Group gap="xs">
                  <IconUser color="var(--mantine-color-orange-6)" />
                  <Text fw="bold" size="sm">
                    Customer Information
                  </Text>
                </Group>
                <Select
                  allowDeselect={false}
                  data={customersQuery.data?.map((c) => ({
                    label: c.name,
                    value: c.id,
                  }))}
                  label="Customer"
                  onChange={(value) => setCustomerId(value ?? "")}
                  placeholder="Select customer"
                  searchable
                  value={customerId}
                />
                <TextInput
                  label="Phone"
                  placeholder="Select Customer"
                  readOnly
                  value={
                    customersQuery.data?.find((c) => c.id === customerId)
                      ?.phone ?? ""
                  }
                />
                <TextInput
                  label="Address"
                  placeholder="Select Customer"
                  readOnly
                  value={
                    customersQuery.data?.find((c) => c.id === customerId)
                      ?.address ?? ""
                  }
                />
              </Stack>
              <Divider />
              {/* ── Menu picker ── */}
              <Stack gap="xs">
                <Group gap="xs">
                  <IconToolsKitchen3 color="var(--mantine-color-orange-6)" />
                  <Text fw="bold" size="sm">
                    Add Menu Item
                  </Text>
                </Group>
                <Select
                  allowDeselect={false}
                  data={menusQuery.data?.map((menu) => ({
                    label: `${menu.name} - Rp. ${menu.standardPrice.toLocaleString("en-US", { maximumFractionDigits: 2 })}`,
                    value: menu.id,
                  }))}
                  label="Menu"
                  onChange={(value) => {
                    setSelectedMenu((prev) => ({
                      ...prev,
                      id: value ?? "",
                      amount: 1,
                      standardPrice:
                        menusQuery.data?.find((m) => m.id === value)
                          ?.standardPrice ?? 0,
                    }));
                  }}
                  placeholder="Select menu"
                  searchable
                  value={selectedMenu.id}
                />
                <Group align="flex-end" w="100%">
                  <NumberInput
                    allowDecimal={false}
                    allowNegative={false}
                    clampBehavior="strict"
                    label="Amount"
                    max={100}
                    min={1}
                    onChange={(value) => {
                      const val =
                        typeof value === "string" ? Number(value) : value;
                      setSelectedMenu((prev) => ({ ...prev, amount: val }));
                    }}
                    value={selectedMenu.amount}
                  />
                  <Stack gap="0">
                    <Text fw="bold" mb={4} size="xs">
                      Discount Type
                    </Text>
                    <SegmentedControl
                      data={[
                        { label: "Rp.", value: "value" },
                        { label: "%", value: "percent" },
                      ]}
                      onChange={(value) => {
                        setSelectedMenu((prev) => ({
                          ...prev,
                          discount: 0,
                          discountType: value as "percent" | "value",
                        }));
                      }}
                      value={selectedMenu.discountType}
                    />
                  </Stack>
                  <NumberInput
                    allowDecimal={false}
                    allowNegative={false}
                    clampBehavior="strict"
                    flex={1}
                    hideControls
                    label="Discount"
                    leftSection={
                      <Text size="xs">
                        {selectedMenu.discountType === "percent" ? "%" : "Rp."}
                      </Text>
                    }
                    max={
                      selectedMenu.discountType === "percent"
                        ? 100
                        : selectedMenu.standardPrice
                    }
                    min={0}
                    onChange={(value) => {
                      const val =
                        typeof value === "string" ? Number(value) : value;
                      setSelectedMenu((prev) => ({ ...prev, discount: val }));
                    }}
                    thousandSeparator=","
                    value={selectedMenu.discount}
                  />
                </Group>
                <Group justify="space-between">
                  <Text fw="bold" size="sm">
                    Total Price
                  </Text>
                  <Text fw="bold" size="sm">
                    Rp.{" "}
                    {toBeAddedMenu.totalPrice.toLocaleString("en-US", {
                      maximumFractionDigits: 2,
                    })}
                  </Text>
                </Group>
                <Button onClick={handleAddToOrder}>Add To Order</Button>
              </Stack>
              <Divider />
              {/* ── Order items list ── */}
              <Stack gap="xs">
                <Group gap="xs">
                  <IconChefHat color="var(--mantine-color-orange-6)" />
                  <Text fw="bold" size="sm">
                    Order Items ({orderList.length})
                  </Text>
                </Group>
                {orderList.length === 0 ? (
                  <Text c="dimmed" py="xl" size="sm" ta="center">
                    No items in order yet
                  </Text>
                ) : (
                  <Stack gap="xs">
                    {orderList.map((item, index) => (
                      <Group
                        bg="orange.0"
                        justify="space-between"
                        key={`${item.menuId}-${index}`}
                        p="xs"
                      >
                        <Stack gap="0">
                          <Text fw="bold" size="sm">
                            {
                              menusQuery.data?.find((m) => m.id === item.menuId)
                                ?.name
                            }
                          </Text>
                          <Group gap="xs">
                            <Badge size="xs" variant="light">
                              x{item.amount}
                            </Badge>
                            {item.discount > 0 && (
                              <Badge color="red" size="xs" variant="light">
                                {item.discountRate > 0
                                  ? `- ${item.discountRate}%`
                                  : `- Rp. ${item.discount.toLocaleString("en-US", { maximumFractionDigits: 2 })}`}
                              </Badge>
                            )}
                          </Group>
                        </Stack>
                        <Group gap="xs">
                          <Text fw="bold" size="sm">
                            Rp.{" "}
                            {item.totalPrice.toLocaleString("en-US", {
                              maximumFractionDigits: 2,
                            })}
                          </Text>
                          <Button
                            color="red"
                            onClick={() => handleRemoveFromOrder(index)}
                            size="xs"
                            variant="subtle"
                          >
                            <IconTrash />
                          </Button>
                        </Group>
                      </Group>
                    ))}
                  </Stack>
                )}
              </Stack>
              <Divider />
              {/* ── Notes ── */}
              <Stack gap="xs">
                <Group gap="xs">
                  <IconNotes color="var(--mantine-color-orange-6)" />
                  <Text fw="bold" size="sm">
                    Order Notes
                  </Text>
                </Group>
                <TextInput
                  onChange={(e) => setOrderNotes(e.target.value)}
                  placeholder="Notes"
                  value={orderNotes}
                />
              </Stack>
              <Divider />
              {/* ── Order summary / adjustments ── */}
              <Stack gap="xs">
                <Group gap="xs">
                  <IconUserDollar color="var(--mantine-color-orange-6)" />
                  <Text fw="bold" size="sm">
                    Order Summary
                  </Text>
                </Group>
                <Group justify="space-between">
                  <Text c="dimmed" size="xs">
                    Subtotal
                  </Text>
                  <Text size="xs">
                    Rp.{" "}
                    {orderValues.subtotal.toLocaleString("en-US", {
                      maximumFractionDigits: 2,
                    })}
                  </Text>
                </Group>
                <Group align="center" justify="space-between">
                  <Group gap="xs">
                    <Text c="dimmed" size="xs">
                      Discount
                    </Text>
                    <NumberInput
                      allowNegative={false}
                      clampBehavior="strict"
                      hideControls
                      max={100}
                      min={0}
                      onChange={(value) => {
                        const val =
                          typeof value === "string" ? Number(value) : value;
                        setOrderAdjustments((prev) => ({
                          ...prev,
                          discount: val ?? 0,
                        }));
                      }}
                      rightSection={
                        <Text c="dimmed" size="xs">
                          %
                        </Text>
                      }
                      size="xs"
                      thousandSeparator=","
                      value={orderAdjustments.discount}
                      w={60}
                    />
                  </Group>
                  <Text size="xs" ta="right" w={100}>
                    Rp.{" "}
                    {orderValues.discount.toLocaleString("en-US", {
                      maximumFractionDigits: 2,
                    })}
                  </Text>
                </Group>
                <Group align="center" justify="space-between">
                  <Group gap="xs">
                    <Text c="dimmed" size="xs">
                      Service Charge
                    </Text>
                    <NumberInput
                      allowNegative={false}
                      clampBehavior="strict"
                      hideControls
                      max={100}
                      min={0}
                      onChange={(value) => {
                        const val =
                          typeof value === "string" ? Number(value) : value;
                        setOrderAdjustments((prev) => ({
                          ...prev,
                          serviceCharge: val ?? 0,
                        }));
                      }}
                      rightSection={
                        <Text c="dimmed" size="xs">
                          %
                        </Text>
                      }
                      size="xs"
                      thousandSeparator=","
                      value={orderAdjustments.serviceCharge}
                      w={60}
                    />
                  </Group>
                  <Text size="xs" ta="right" w={100}>
                    Rp.{" "}
                    {orderValues.serviceCharge.toLocaleString("en-US", {
                      maximumFractionDigits: 2,
                    })}
                  </Text>
                </Group>
                <Group align="center" justify="space-between">
                  <Group gap="xs">
                    <Text c="dimmed" size="xs">
                      Tax
                    </Text>
                    <NumberInput
                      allowNegative={false}
                      clampBehavior="strict"
                      hideControls
                      max={100}
                      min={0}
                      onChange={(value) => {
                        const val =
                          typeof value === "string" ? Number(value) : value;
                        setOrderAdjustments((prev) => ({
                          ...prev,
                          tax: val ?? 0,
                        }));
                      }}
                      rightSection={
                        <Text c="dimmed" size="xs">
                          %
                        </Text>
                      }
                      size="xs"
                      ta="right"
                      thousandSeparator=","
                      value={orderAdjustments.tax}
                      w={60}
                    />
                  </Group>
                  <Text size="xs" ta="right" w={100}>
                    Rp.{" "}
                    {orderValues.tax.toLocaleString("en-US", {
                      maximumFractionDigits: 2,
                    })}
                  </Text>
                </Group>
                <Group justify="space-between">
                  <Text c="dimmed" size="xs">
                    Adjustment
                  </Text>
                  <Text size="xs">
                    Rp.{" "}
                    {orderValues.adjustment.toLocaleString("en-US", {
                      maximumFractionDigits: 2,
                    })}
                  </Text>
                </Group>
                <Group justify="space-between">
                  <Text fw="bold">Total</Text>
                  <Text fw="bold">
                    Rp.{" "}
                    {orderValues.total.toLocaleString("en-US", {
                      maximumFractionDigits: 2,
                    })}
                  </Text>
                </Group>
              </Stack>
              <Divider />
              {/* ── Payment Method ── */}
              <Stack gap="xs">
                <Group gap="xs">
                  <IconWallet color="var(--mantine-color-orange-6)" />
                  <Text fw="bold" size="sm">
                    Payment Method
                  </Text>
                </Group>
                <Select
                  allowDeselect
                  clearable
                  data={PAYMENT_METHOD_CONST.map((method) => ({
                    label: method.charAt(0).toUpperCase() + method.slice(1),
                    value: method,
                  }))}
                  onChange={(value) => setPaymentMethod(value)}
                  placeholder="Select payment method"
                  value={paymentMethod}
                />
              </Stack>
            </>
          )}

          {(isPaid || isLocked) && readOnlySummary}

          {/* ── Status transition select ── */}
          {nextStatusOptions.length > 0 && (
            <>
              <Divider />
              <Select
                allowDeselect
                clearable
                data={nextStatusOptions}
                description="Leave empty to keep the current status"
                label="Change Status"
                onChange={(value) => setNextStatus(value)}
                placeholder={`Current: ${currentStatus}`}
                value={nextStatus}
              />
            </>
          )}

          {isLocked && (
            <Text c="dimmed" size="sm" ta="center">
              This order is{" "}
              <Text component="span" fw="bold">
                {currentStatus}
              </Text>{" "}
              and cannot be modified.
            </Text>
          )}

          {/* ── Save button ── */}
          {!isLocked && (
            <Button
              disabled={
                (isPending && orderList.length === 0) ||
                (nextStatus === "paid" && !paymentMethod)
              }
              loading={isMutating}
              onClick={handleSave}
              size="md"
            >
              Save Changes
            </Button>
          )}
        </Stack>
      </ScrollArea>
    </Modal>
  );
}
