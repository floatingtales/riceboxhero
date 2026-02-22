import { pgEnum } from "drizzle-orm/pg-core";
import { MENU_TYPE_CONST, ORDER_STATUS_CONST } from "@/utils/consts";

export const menuTypeEnum = pgEnum("menu_type", MENU_TYPE_CONST);
export const orderStatusEnum = pgEnum("order_status", ORDER_STATUS_CONST);
