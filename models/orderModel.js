"use strict";

const { randomUUID } = require("node:crypto");

const Order = require("./schemas/Order");
const OrderItem = require("./schemas/OrderItem");

const toRuntimeItem = (item) => ({
    id: String(item._id),
    orderId: String(item.orderId),
    itemType: item.itemType,
    productId: item.productId
        ? String(item.productId)
        : null,
    giftcardId: item.giftcardId
        ? String(item.giftcardId)
        : null,

    title: item.title,
    name: item.title,
    image: item.image,
    maker: item.maker,
    material: item.material,
    variant: item.variant,

    price: Number(item.unitPrice),
    unitPrice: Number(item.unitPrice),
    quantity: Number(item.quantity),

    subtotal: Number(item.lineTotal),
    lineTotal: Number(item.lineTotal),
    subtotalFormatted: `$${Number(
        item.lineTotal
    ).toFixed(2)}`,

    giftcardCode: item.giftcardCode,
});

const toRuntimeOrder = async (order) => {
    if (!order) return null;

    const items = await OrderItem.find({
        orderId: String(order._id),
    }).lean();

    return {
        ...order,
        id: String(order._id),
        _id: String(order._id),
        userId: String(order.userId),
        items: items.map(toRuntimeItem),
    };
};

const createOrder = async (orderData) => {
    const orderId = `order-${randomUUID()}`;

    const order = await Order.create({
        _id: orderId,
        userId: String(orderData.userId),
        delivery: orderData.delivery,
        shipping: orderData.shipping,
        payment: orderData.payment,
        giftNote: orderData.giftNote || "",
        subtotal: Number(orderData.subtotal),
        total: Number(orderData.total),
        status: "confirmed",
    });

    try {
        const items = (orderData.items || []).map(
            (item) => ({
                orderId,

                itemType:
                    item.itemType === "giftcard"
                        ? "giftcard"
                        : "product",

                productId:
                    item.itemType === "giftcard"
                        ? null
                        : String(item.productId),

                giftcardId:
                    item.giftcardId
                        ? String(item.giftcardId)
                        : null,

                title:
                    item.name ||
                    item.title ||
                    "Item",

                image: item.image || "",
                maker: item.maker || "",
                material: item.material || "",
                variant: item.variant || "",

                unitPrice: Number(
                    item.price ??
                    item.unitPrice ??
                    0
                ),

                quantity: Number(item.quantity),

                lineTotal: Number(
                    item.subtotal ??
                    item.lineTotal ??
                    0
                ),

                giftcardCode:
                    item.giftcardCode || null,
            })
        );

        if (items.length) {
            await OrderItem.insertMany(items);
        }

        return toRuntimeOrder(
            order.toObject()
        );
    } catch (error) {
        await Order.deleteOne({
            _id: orderId,
        });

        await OrderItem.deleteMany({
            orderId,
        });

        throw error;
    }
};

const getOrderById = async (orderId) => {
    const order = await Order.findById(
        String(orderId)
    ).lean();

    return toRuntimeOrder(order);
};

const getOrdersByUserId = async (userId) => {
    const orders = await Order.find({
        userId: String(userId),
    })
        .sort({
            createdAt: -1,
        })
        .lean();

    return Promise.all(
        orders.map(toRuntimeOrder)
    );
};

module.exports = {
    createOrder,
    getOrderById,
    getOrdersByUserId,
};