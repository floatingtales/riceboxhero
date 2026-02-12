import { pgEnum } from "drizzle-orm/pg-core";

export const menuTypeEnum = pgEnum("menu_type_enum", ["rice_box", "meat_only"]);
