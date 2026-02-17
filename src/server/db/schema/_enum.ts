import { pgEnum } from "drizzle-orm/pg-core";
import { MENU_TYPE_CONST } from "@/utils/consts";

export const menuTypeEnum = pgEnum("menu_type_enum", MENU_TYPE_CONST);
export const orderStatusEnum = pgEnum("order_status_enum", [
	"pending",
	"paid",
	"served/delivered",
	"voided",
]);
