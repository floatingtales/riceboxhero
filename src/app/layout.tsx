import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import "@mantine/dates/styles.css";

import {
	ColorSchemeScript,
	createTheme,
	MantineProvider,
	mantineHtmlProps,
} from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import { TRPCReactProvider } from "@/trpc/react";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

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
		fontFamily: "var(--font-inter), sans-serif",
		headings: { fontFamily: "var(--font-inter), sans-serif" },
		defaultRadius: "md",
		colors: {
			orange: [
				"#fff4e6",
				"#ffe8cc",
				"#ffd8a8",
				"#ffc078",
				"#ffa94d",
				"#ff922b",
				"#fd7e14",
				"#f15f00", // Vibrant primary
				"#e8590c",
				"#d9480f",
			],
			dark: [
				"#C1C2C5",
				"#A6A7AB",
				"#909296",
				"#5c5f66",
				"#373A40",
				"#2C2E33",
				"#25262b",
				"#1A1B1E",
				"#141517",
				"#101113",
			],
		},
	});

	return (
		<html className={inter.variable} lang="en" {...mantineHtmlProps}>
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
