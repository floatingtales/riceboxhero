"use client";

import { Button, ScrollArea } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { api } from "@/trpc/react";

export default function dashboardMainPage() {
  const utils = api.useUtils();

  const pingMutation = api.ping.testMutation.useMutation({
    onSuccess: (data) => {
      notifications.show({
        message: data.message,
      });
    },
    onError: (error) => {
      notifications.show({
        message: error.message,
      });
    },
  });

  const revalidateQueries = () => {
    utils.order.dayOrders.invalidate();
    utils.order.unresolvedOrders.invalidate();
  };

  return (
    <ScrollArea>
      <Button onClick={() => pingMutation.mutate()}>Try call a mutation</Button>
      <Button onClick={() => revalidateQueries()}>Revalidate queries</Button>
    </ScrollArea>
  );
}
