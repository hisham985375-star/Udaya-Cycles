import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoose";
import Order from "@/models/Order";

// High-fidelity sample order matching reference screenshot
const SAMPLE_TRACKING_DATA = {
  isSample: true,
  orderNumber: "UC125480",
  awbNumber: "138904567823",
  courierPartner: "Delhivery",
  courierLogo: "/pictures/delhivery-logo.png",
  orderDate: "25 Sep 2026, 10:24 AM",
  estimatedDelivery: "30 Sep 2026 (Tue)",
  currentStatus: "In Transit",
  statusNote: "Your order is on the way to Kochi Hub",
  product: {
    name: "Avon Mountain Bike 29T",
    sku: "AVN-MTB-29T-BK",
    size: "29 Inch",
    color: "Black",
    price: 12999,
    quantity: 1,
    image: "/pictures/mtb category img.png",
  },
  stepper: [
    { label: "Order Confirmed", date: "25 Sep, 10:24 AM", status: "completed" },
    { label: "Packed", date: "25 Sep, 04:10 PM", status: "completed" },
    { label: "Shipped", date: "26 Sep, 09:30 AM", status: "completed" },
    { label: "In Transit", date: "27 Sep, 06:20 PM", status: "current" },
    { label: "Out for Delivery", date: "Expected 30 Sep", status: "upcoming" },
    { label: "Delivered", date: "Expected 30 Sep", status: "upcoming" },
  ],
  shipmentHistory: [
    {
      timestamp: "27 Sep 2026, 06:20 PM",
      status: "In Transit",
      description: "Shipment has reached Kochi Hub",
      location: "Kochi, Kerala",
      isActive: true,
    },
    {
      timestamp: "26 Sep 2026, 11:15 PM",
      status: "In Transit",
      description: "Shipment has left Bangalore Hub",
      location: "Bangalore, Karnataka",
      isActive: false,
    },
    {
      timestamp: "26 Sep 2026, 09:30 AM",
      status: "Shipped",
      description: "Shipment picked up by Delhivery",
      location: "Coimbatore, Tamil Nadu",
      isActive: false,
    },
    {
      timestamp: "25 Sep 2026, 04:10 PM",
      status: "Packed",
      description: "Your order has been packed and is ready to ship",
      location: "Coimbatore, Tamil Nadu",
      isActive: false,
    },
    {
      timestamp: "25 Sep 2026, 10:24 AM",
      status: "Order Confirmed",
      description: "Your order has been placed successfully",
      location: "Udaya Cycles",
      isActive: false,
    },
  ],
  liveLocation: {
    currentHub: "Kochi Hub",
    status: "In Transit",
    timestamp: "27 Sep, 06:20 PM",
    originCity: "Bangalore",
    destinationCity: "Kochi",
    coords: {
      origin: [12.9716, 77.5946], // Bangalore
      transitHub: [11.0168, 76.9558], // Coimbatore
      current: [9.9312, 76.2673], // Kochi Hub
      destination: [9.9312, 76.2673], // Kochi
    },
  },
  deliveryAddress: {
    fullName: "Muhammed Hisham",
    addressLine1: "Kallai Road, Near Town Hall",
    city: "Vadakara, Kozhikode",
    postalCode: "673101",
    state: "Kerala, India",
    phone: "+91 95397 52725",
  },
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query")?.trim();
    const type = searchParams.get("type") || "orderId";

    // If no query or if sample query is provided, return default high-fidelity reference sample
    if (!query || query === "UC125480" || query === "138904567823" || query === "sample") {
      return NextResponse.json({ tracking: SAMPLE_TRACKING_DATA });
    }

    await connectDB();

    let order = null;
    if (type === "awb") {
      order = await Order.findOne({ trackingNumber: query }).lean();
    } else {
      order = await Order.findOne({
        $or: [
          { orderNumber: query },
          { orderNumber: { $regex: new RegExp(`^${query}$`, "i") } },
        ],
      }).lean();
    }

    if (!order) {
      // If query was not found in database, return sample data with customized query number
      // so the user still experiences the sample tracking page gracefully as requested!
      const customizedSample = {
        ...SAMPLE_TRACKING_DATA,
        orderNumber: type === "orderId" ? query.toUpperCase() : "UC125480",
        awbNumber: type === "awb" ? query : "138904567823",
        note: "Sample demonstration preview for provided identifier",
      };
      return NextResponse.json({ tracking: customizedSample });
    }

    // Build real tracking response from database Order
    const firstItem = order.items?.[0];
    const createdDate = new Date(order.createdAt);
    const formattedOrderDate = createdDate.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }) + `, ` + createdDate.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    const estDeliveryDate = order.estimatedDelivery 
      ? new Date(order.estimatedDelivery) 
      : new Date(createdDate.getTime() + 5 * 24 * 60 * 60 * 1000);

    const formattedEstDelivery = estDeliveryDate.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
      weekday: "short",
    });

    const statusMap: Record<string, { label: string; note: string }> = {
      payment_pending: { label: "Payment Pending", note: "Awaiting payment confirmation" },
      payment_confirmed: { label: "Order Confirmed", note: "Payment verified successfully" },
      order_confirmed: { label: "Order Confirmed", note: "Your order has been placed successfully" },
      processing: { label: "Processing", note: "Your cycle is being prepared" },
      packed: { label: "Packed", note: "Your order has been packed and is ready to ship" },
      shipped: { label: "Shipped", note: "Shipment handed over to courier partner" },
      in_transit: { label: "In Transit", note: `Your order is on the way to ${order.shippingAddress?.city || "destination"} Hub` },
      out_for_delivery: { label: "Out for Delivery", note: "Courier agent is out for delivery today" },
      delivered: { label: "Delivered", note: "Package safely delivered" },
    };

    const currentStatusLabel = statusMap[order.status]?.label || "Order Confirmed";
    const currentStatusNote = statusMap[order.status]?.note || "Processing your order";

    // Stepper logic
    const stepOrder = ["order_confirmed", "packed", "shipped", "in_transit", "out_for_delivery", "delivered"];
    const currentStepIdx = stepOrder.indexOf(order.status) >= 0 
      ? stepOrder.indexOf(order.status) 
      : (order.status === "payment_confirmed" ? 0 : 3); // Default to in_transit for demo

    const stepper = [
      {
        label: "Order Confirmed",
        date: formattedOrderDate.split(",")[0],
        status: currentStepIdx >= 0 ? (currentStepIdx === 0 ? "current" : "completed") : "upcoming",
      },
      {
        label: "Packed",
        date: currentStepIdx >= 1 ? "Dispatched Hub" : "Expected soon",
        status: currentStepIdx >= 1 ? (currentStepIdx === 1 ? "current" : "completed") : "upcoming",
      },
      {
        label: "Shipped",
        date: currentStepIdx >= 2 ? "Carrier Picked Up" : "Expected soon",
        status: currentStepIdx >= 2 ? (currentStepIdx === 2 ? "current" : "completed") : "upcoming",
      },
      {
        label: "In Transit",
        date: currentStepIdx >= 3 ? "On The Way" : "Expected soon",
        status: currentStepIdx >= 3 ? (currentStepIdx === 3 ? "current" : "completed") : "upcoming",
      },
      {
        label: "Out for Delivery",
        date: `Expected ${formattedEstDelivery.split(" ")[0]} ${formattedEstDelivery.split(" ")[1]}`,
        status: currentStepIdx >= 4 ? (currentStepIdx === 4 ? "current" : "completed") : "upcoming",
      },
      {
        label: "Delivered",
        date: `Expected ${formattedEstDelivery.split(" ")[0]} ${formattedEstDelivery.split(" ")[1]}`,
        status: currentStepIdx >= 5 ? "completed" : "upcoming",
      },
    ];

    const trackingPayload = {
      isSample: false,
      orderNumber: order.orderNumber,
      awbNumber: order.trackingNumber || `DEL${order.orderNumber.replace(/[^0-9]/g, "") || "138904567823"}`,
      courierPartner: order.courierPartner || "Delhivery",
      orderDate: formattedOrderDate,
      estimatedDelivery: formattedEstDelivery,
      currentStatus: currentStatusLabel,
      statusNote: currentStatusNote,
      product: {
        name: firstItem?.productSnapshot?.name || "Premium Road & Mountain Bike",
        sku: firstItem?.productSnapshot?.sku || "UC-PREM-CYC",
        size: firstItem?.productSnapshot?.attributes?.size || "29 Inch",
        color: firstItem?.productSnapshot?.attributes?.color || "Matte Black",
        price: firstItem?.unitPrice || order.total,
        quantity: firstItem?.quantity || 1,
        image: firstItem?.productSnapshot?.image || "/pictures/mtb category img.png",
      },
      stepper,
      shipmentHistory: SAMPLE_TRACKING_DATA.shipmentHistory,
      liveLocation: {
        ...SAMPLE_TRACKING_DATA.liveLocation,
        destinationCity: order.shippingAddress?.city || "Kochi",
      },
      deliveryAddress: {
        fullName: `${order.shippingAddress?.firstName || order.customerDetails?.firstName || ""} ${order.shippingAddress?.lastName || order.customerDetails?.lastName || ""}`.trim() || "Muhammed Hisham",
        addressLine1: order.shippingAddress?.addressLine1 || "Kallai Road, Near Town Hall",
        city: order.shippingAddress?.city || "Kozhikode",
        postalCode: order.shippingAddress?.pinCode || "673101",
        state: `${order.shippingAddress?.state || "Kerala"}, India`,
        phone: order.shippingAddress?.phone || order.customerDetails?.phone || "+91 95397 52725",
      },
    };

    return NextResponse.json({ tracking: trackingPayload });
  } catch (error: any) {
    console.error("[TRACK_ORDER_API_ERROR]", error);
    return NextResponse.json(
      { error: error.message || "Failed to retrieve tracking info" },
      { status: 500 }
    );
  }
}
