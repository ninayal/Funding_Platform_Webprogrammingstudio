const orders = require("../data/orders");
const createOrder = (orderData) => {
    const order = {
        id: `order-${Date.now()}`,
        ...orderData,
        status: "confirmed",
        createdAt: new Date()
    };
    orders.push(order);
    return order;
};
const getOrderById = (orderId) => {
    return orders.find((order) => order.id === String(orderId)) || null;
};
const getOrdersByUserId = (userId) => {
    return orders.filter((order) => order.userId === String(userId));
};
module.exports = {
    createOrder,
    getOrderById,
    getOrdersByUserId
};