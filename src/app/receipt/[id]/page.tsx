"use client";

import dayjs from "dayjs";
import { useParams } from "next/navigation";
import { api } from "@/trpc/react";
import "./receipt.css";

export default function ReceiptPage() {
	const params = useParams<{ id: string }>();
	const orderQuery = api.order.seeOrderDetail.useQuery(
		{ id: params.id },
		{ enabled: !!params.id, refetchOnWindowFocus: false },
	);

	if (orderQuery.isLoading) {
		return (
			<div className="receipt-page">
				<p style={{ textAlign: "center" }}>Loading receipt...</p>
			</div>
		);
	}

	if (orderQuery.error || !orderQuery.data) {
		return (
			<div className="receipt-page">
				<p style={{ textAlign: "center", color: "red" }}>
					Failed to load order.
				</p>
			</div>
		);
	}

	const order = orderQuery.data;

	const subtotal = order.orderItems.reduce(
		(acc, item) => acc + (item.totalPrice ?? 0),
		0,
	);

	const fmt = (n: number) =>
		`Rp. ${n.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;

	return (
		<div className="receipt-page">
			<button
				className="print-btn"
				onClick={() => window.print()}
				type="button"
			>
				🖨️ Print Receipt
			</button>

			{/* Header */}
			<div className="header">
				<h1>Rice Box Hero</h1>
				<p>{order.orderNumber}</p>
				<p>{dayjs(order.orderedAt).format("DD MMM YYYY, HH:mm")}</p>
			</div>

			<hr className="divider" />

			{/* Customer */}
			<div className="section-title">Customer</div>
			<div className="info-row">
				<span className="label">Name</span>
				<span className="value">{order.customer.name}</span>
			</div>
			{order.customer.phone && (
				<div className="info-row">
					<span className="label">Phone</span>
					<span className="value">{order.customer.phone}</span>
				</div>
			)}
			{order.customer.address && (
				<div className="info-row">
					<span className="label">Address</span>
					<span className="value">{order.customer.address}</span>
				</div>
			)}

			<hr className="divider" />

			{/* Items */}
			<div className="section-title">Items</div>
			{order.orderItems.map((item, i) => (
				<div key={`${item.menuId}-${i}`}>
					<div className="item-row">
						<span className="item-qty">{item.amount}x</span>
						<span className="item-name">
							{item.menuItem?.name ?? item.menuId}
						</span>
						<span className="item-price">{fmt(item.totalPrice ?? 0)}</span>
					</div>
					{(item.discount ?? 0) > 0 && (
						<div className="item-discount">
							disc:{" "}
							{(item.discountRate ?? 0) > 0
								? `${item.discountRate}%`
								: fmt(item.discount ?? 0)}
						</div>
					)}
				</div>
			))}

			<hr className="divider" />

			{/* Totals */}
			<div className="total-section">
				<div className="total-row">
					<span>Subtotal</span>
					<span>{fmt(subtotal)}</span>
				</div>
				{(order.discountRate ?? 0) > 0 && (
					<div className="total-row">
						<span>Discount ({order.discountRate}%)</span>
						<span>
							-{fmt(Math.round((subtotal * (order.discountRate ?? 0)) / 100))}
						</span>
					</div>
				)}
				{(order.serviceChargeRate ?? 0) > 0 && (
					<div className="total-row">
						<span>Service ({order.serviceChargeRate}%)</span>
						<span>
							+
							{fmt(
								Math.round((subtotal * (order.serviceChargeRate ?? 0)) / 100),
							)}
						</span>
					</div>
				)}
				{(order.taxRate ?? 0) > 0 && (
					<div className="total-row">
						<span>Tax ({order.taxRate}%)</span>
						<span>
							+{fmt(Math.round((subtotal * (order.taxRate ?? 0)) / 100))}
						</span>
					</div>
				)}
				<div className="total-row grand">
					<span>Total</span>
					<span>{fmt(order.total)}</span>
				</div>
			</div>

			<hr className="divider" />

			{/* Footer */}
			<div className="footer">
				{order.paymentMethod && (
					<p>
						Paid via{" "}
						{order.paymentMethod.charAt(0).toUpperCase() +
							order.paymentMethod.slice(1)}
					</p>
				)}
				{order.orderNote && <p>Note: {order.orderNote}</p>}
				<p>Served by: {order.admin.username}</p>
				<p className="thank-you">Thank you!</p>
			</div>
		</div>
	);
}
