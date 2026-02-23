"use client";

import { Card, Loader, Stack, Text } from "@mantine/core";
import { useState } from "react";
import { api } from "@/trpc/react";

export default function UnresolvedOrdersCard() {
  const [today] = useState(new Date());
  const unresolvedOrdersQuery = api.order.unresolvedOrders.useQuery({
    date: today,
  });

  if (unresolvedOrdersQuery.error) {
    return (
      <Card flex={1} h="100%" p="md" withBorder>
        <Text c="red">Failed to load orders.</Text>
      </Card>
    );
  }

  if (unresolvedOrdersQuery.isLoading) {
    return (
      <Card flex={1} h="100%" p="md" withBorder>
        <Stack align="center" gap="md" h="100%" justify="center" w="100%">
          <Loader />
        </Stack>
      </Card>
    );
  }

  if (unresolvedOrdersQuery.data?.length === 0) {
    return <></>;
  }

  return (
    <Card flex={1} h="100%" p="md" withBorder>
      <Stack gap="md" h="100%" w="100%">
        <Stack gap="0">
          <Text fw="bold" size="xl">
            Unresolved Orders
          </Text>
          <Text c="dimmed" size="xs">
            Manage unresolved orders
          </Text>
        </Stack>
      </Stack>
    </Card>
  );
}
