"use client";

import { Badge, Card, Group, Loader, Stack, Text } from "@mantine/core";
import { IconWallet } from "@tabler/icons-react";
import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "@/server/api/root";

type PaymentBreakdownData =
  inferRouterOutputs<AppRouter>["order"]["paymentMethodBreakdown"];

interface PaymentBreakdownCardProps {
  data: PaymentBreakdownData | undefined;
  isLoading: boolean;
}

const METHOD_COLORS: Record<string, string> = {
  cash: "green",
  card: "blue",
  qris: "violet",
  transfer: "cyan",
  unset: "gray",
};

const METHOD_LABELS: Record<string, string> = {
  cash: "Cash",
  card: "Card",
  qris: "QRIS",
  transfer: "Transfer",
  unset: "Not Set",
};

export default function PaymentBreakdownCard({
  data,
  isLoading,
}: PaymentBreakdownCardProps) {
  return (
    <Card h="100%" padding="lg" radius="md" withBorder>
      <Stack gap="md">
        <Group gap="xs">
          <IconWallet color="var(--mantine-color-teal-6)" size={20} />
          <Text fw={600} size="md">
            Payment Methods
          </Text>
        </Group>

        {isLoading ? (
          <Stack align="center" py="xl">
            <Loader size="sm" />
          </Stack>
        ) : !data || data.length === 0 ? (
          <Text c="dimmed" py="xl" size="sm" ta="center">
            No payment data for this period
          </Text>
        ) : (
          <Stack gap="xs">
            {data.map((item) => (
              <Group justify="space-between" key={item.paymentMethod} py={4}>
                <Group gap="sm">
                  <Badge
                    color={METHOD_COLORS[item.paymentMethod] ?? "gray"}
                    size="sm"
                    variant="light"
                  >
                    {METHOD_LABELS[item.paymentMethod] ?? item.paymentMethod}
                  </Badge>
                  <Text c="dimmed" size="xs">
                    {item.count} txn{item.count !== 1 ? "s" : ""}
                  </Text>
                </Group>
                <Text fw={500} size="sm">
                  Rp. {item.total.toLocaleString("id-ID")}
                </Text>
              </Group>
            ))}
          </Stack>
        )}
      </Stack>
    </Card>
  );
}
