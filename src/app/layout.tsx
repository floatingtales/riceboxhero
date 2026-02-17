import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";

import {
	ColorSchemeScript,
	createTheme,
	MantineProvider,
	mantineHtmlProps,
} from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import type { Metadata } from "next";

import { TRPCReactProvider } from "@/trpc/react";

export const metadata: Metadata = {
	title: "Riceboxhero",
	description: "standard ERP for a small restaurant",
	icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	const appTheme = createTheme({
		primaryColor: "orange",
		defaultRadius: "sm",
	});

	return (
		<html lang="en" {...mantineHtmlProps}>
			<head>
				<ColorSchemeScript />
			</head>
			<body>
				<MantineProvider theme={appTheme}>
					<Notifications />
					<TRPCReactProvider>{children}</TRPCReactProvider>
				</MantineProvider>
			</body>
		</html>
	);
}
