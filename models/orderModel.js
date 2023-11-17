const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "order must be belong to user"],
    },
    orderNumber: {
      type: String,
   
    },
    cartItems: [
      {
        product: {
          type: mongoose.Schema.ObjectId,
          ref: "Product",
        },
        quantity: Number,
        color: String,
        size:String,
        price: Number,
      },
    ],
    taxPrice: {
      type: Number,
      default: 0,
    },
    shippingPrice: {
      type: Number,
      default: 0,
    },
    shippingAddress: {
      details: String,
      phone: String,
      city: String,
      postalCode: String,
    },
    arrivalTime:Date,
    
    totalOrderPrice: {
      type: Number,
    },
    paymentMethodType: {
      type: String,
      enum: ["card"],
      default: "card",
    },
    isPaid: {
      type: Boolean,
      default: false,
    },
    paidAt: Date,
    isDelivered: {
      type: Boolean,
      default: false,
    },
    deliveredAt: Date,
  },
  { timestamp: true }
);

orderSchema.pre(/^find/, function (next) {
  this.populate({ path: "user", select: "name phone email " }).populate({
    path: "cartItems.product",
    select: "title_ar title_en imageCover category",
  });
  next();
});

module.exports = mongoose.model("Order", orderSchema);
