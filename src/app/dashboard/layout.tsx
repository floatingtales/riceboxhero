import { Stack } from "@mantine/core";
import type { ReactNode } from "react";
import Navbar from "../_components/dashboard/Navbar";

export default function DashboardLayout({ children }: { children: ReactNode }) {
	return (
		<Stack gap="0" h="100svh" style={{ overflow: "hidden" }} w="100svw">
			<Navbar />
			{children}
		</Stack>
	);
}
