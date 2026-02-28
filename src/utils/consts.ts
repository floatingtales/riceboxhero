export const PATH_CONST = {
	HOME: "/",
	DASHBOARD: "/dashboard",
	ORDERS: "/dashboard/orders",
	CUSTOMERS: "/dashboard/customers",
	MENU: "/dashboard/menu",
	HISTORY: "/dashboard/history",
	SETTINGS: "/dashboard/settings",
} as const;

export const STATUS_CONST = {
	REDIRECT: "REDIRECT",
	DATA_FOUND: "DATA_FOUND",
	ALERT: "ALERT",
} as const;

export const COOKIE_CONST = {
	AUTHORIZED: "authorized",
} as const;

export const MENU_TYPE_CONST = ["rice_box", "meat_only"] as const;

export const ORDER_STATUS_CONST = [
	"pending",
	"paid",
	"completed",
	"voided",
] as const;

export const PAYMENT_METHOD_CONST = [
	"cash",
	"card",
	"qris",
	"transfer",
] as const;
