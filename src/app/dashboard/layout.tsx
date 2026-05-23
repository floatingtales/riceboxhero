"use client";

import { AppShell } from "@mantine/core";
import type { ReactNode } from "react";
import Navbar from "../_components/dashboard/Navbar";

export default function DashboardLayout({ children }: { children: ReactNode }) {
	return (
		<AppShell navbar={{ width: 260, breakpoint: "sm" }} padding="0">
			<Navbar />
			<AppShell.Main
				className="subtle-bg"
				h="100svh"
				style={{ overflowY: "hidden" }}
			>
				{children}
			</AppShell.Main>
		</AppShell>
	);
}
