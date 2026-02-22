import dayjs from "dayjs";

export function createOrderNumber({
	count = 0,
	date = new Date(),
}: {
	count?: number;
	date?: Date;
} = {}) {
	const dateStr = createOrderNumberPrefix(date);
	const adjustedCount = (count + 1).toString().padStart(4, "0");

	return `${dateStr}/${adjustedCount}`;
}

export function createOrderNumberPrefix(date: Date = new Date()) {
	const dateStr = dayjs(date).format("YYMMDD");
	return `#${dateStr}`;
}
