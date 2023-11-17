const mongoose = require("mongoose");

const cartSchema = mongoose.Schema(
  {
    cartItems: [
      {
        product: {
          type: mongoose.Schema.ObjectId,
          ref: "Product",
        },
        quantity: {
          type: Number,
          default: 1,
        },
        color: String,
        size: String,
        price: Number,
      },
    ],
    totalCartprice: Number,
    totalCartpriceAfterDiscount: Number,
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

// ^find => it mean if part of of teh word contains find
cartSchema.pre(/^find/, function (next) {
  this.populate({
    path: "user",
    select: "name -_id",
  });
  this.populate({
    path: "cartItems",
    populate: "product",
  });
  next();
});

module.exports = mongoose.model("Cart", cartSchema);
