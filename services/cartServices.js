const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/apiError");
const Cart = require("../models/cartModel");
const Coupon = require("../models/couponModel");
const Product = require("../models/productModel");

const calculateTotalCartPrice = (cart) => {
  let totalPrice = 0;
  cart.cartItems.forEach((item) => {
    totalPrice += item.price * item.quantity;
  });
  cart.totalCartprice = totalPrice;
  cart.totalCartpriceAfterDiscount = undefined;
  return totalPrice;
};

//@desc add product to cart
//@route POST /api/v1/auth/cart
//@access private/User
exports.addProductToCart = asyncHandler(async (req, res, next) => {
  const { productId, color ,size} = req.body;

  const product = await Product.findById(productId);
  if (!product) {
    return next(new ApiError("Product not found", 404));
  }
  let productPrice;
  if (product.priceAfterDiscount) {
     productPrice = product.priceAfterDiscount;
  } else {
     productPrice = product.price;
  }

  //get cart for logged in user
  let cart = await Cart.findOne({ user: req.user._id });
  //if no cart
  if (!cart) {
    //create a new cart for this user with the product
    cart = await Cart.create({
      user: req.user._id,
      //we can use $addtoSet

      cartItems: [{ product: productId, color,size, price: productPrice }],
    });
  } else {
    // is this product exists in the cart,update product quantity
    const productIndex = cart.cartItems.findIndex(
      (item) => item.product.toString() === productId && item.color === color  && item.size === size
    );
    //find index if there is no item with this productid and color it will return -1
    //if productIndex > -1 then he found a product with  this productid and color  then i will update the quantity
    if (productIndex > -1) {
      const cartItem = cart.cartItems[productIndex];
      cartItem.quantity += 1;
      // add this item to cart in his index
      cart.cartItems[productIndex] = cartItem;
    } else {
      //if the product is not exist in the cart ,push product to cartItem array
      cart.cartItems.push({ product: productId, color,size, price: productPrice });
    }
  }

  //calculate total cart price
  calculateTotalCartPrice(cart);

  await cart.save();

  res.status(200).json({
    status: "success",
    numberOfCartItems: cart.cartItems.length,
    message: "product added to cart successfully",
    data: cart,
  });
});

//@desc get logged user cart
//@route GET /api/v1/auth/cart
//@access private/User
exports.getLoggedUserCart = asyncHandler(async (req, res, next) => {
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    return next(
      new ApiError(`there is no cart this user id : ${req.user._id}`, 404)
    );
  }

  res.status(200).json({
    status: "success",
    numberOfCartItems: cart.cartItems.length,
    data: cart,
  });
});

//@desc remove item from cart
//@route DELETE /api/v1/auth/cart/:itemId
//@access private/User
exports.removeSpecificCartItem = asyncHandler(async (req, res, next) => {
  const cart = await Cart.findOneAndUpdate(
    { user: req.user._id },
    {
      //remove an item from cart if exists
      $pull: { cartItems: { _id: req.params.itemId } },
    },
    { new: true }
  );
  //calculate total cart price
  calculateTotalCartPrice(cart);

  await cart.save();

  res.status(200).json({
    status: "success",
    numberOfCartItems: cart.cartItems.length,
    data: cart,
  });
});
//@desc clear all items from cart
//@route DELETE /api/v1/auth/cart
//@access private/User
exports.clearCart = asyncHandler(async (req, res, next) => {
  await Cart.findOneAndDelete({ user: req.user._id });
  res.status(204).send();
});
//@desc update cart item quantity
//@route PUT /api/v1/auth/cart/:itemId
//@access private/User
exports.updateCartItemQuantity = asyncHandler(async (req, res, next) => {
  const { quantity } = req.body;
  const cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    return next(
      new ApiError(`there is no cart this user id : ${req.user._id}`, 404)
    );
  }

  const itemIndex = cart.cartItems.findIndex(
    (item) => item._id.toString() === req.params.itemId
  );
  //if ture it mean i got item with this id
  if (itemIndex > -1) {
    const cartItem = cart.cartItems[itemIndex];
    cartItem.quantity = quantity;

    cart.cartItems[itemIndex] = cartItem;
  } else {
    return next(
      new ApiError(`there is no item for this  id : ${req.params.itemId}`, 404)
    );
  }
  calculateTotalCartPrice(cart);

  await cart.save();

  res.status(200).json({
    status: "success",
    numberOfCartItems: cart.cartItems.length,
    data: cart,
  });
});
//@desc applay coupon on cart
//@route PUT /api/v1/auth/cart/applaycoupon
//@access private/User
exports.applayCoupon = asyncHandler(async (req, res, next) => {
  // 1) get coupon passed on coupon name
  const coupon = await Coupon.findOne({
    name: req.body.coupon,
    expire: { $gt: Date.now() },
  });
  if (!coupon) {
    return next(new ApiError("Coupon is Invalid or Expired "));
  }
  //get looger user cart to get total cart price
  const cart = await Cart.findOne({ user: req.user._id });
  const totalPrice = cart.totalCartprice;

  //calculate total price after discount
  const totalPriceAfterDiscount = (
    totalPrice -
    (totalPrice * coupon.discount) / 100
  ).toFixed(2);

  cart.totalCartpriceAfterDiscount = totalPriceAfterDiscount;
  await cart.save();

  res.status(200).json({
    status: "success",
    numberOfCartItems: cart.cartItems.length,
    data: cart,
  });
});

//---------------------------------------------------------------------------------------------------//
exports.removeCoupon = asyncHandler(async (req, res, next) => {
  // Find the cart by user ID
  const cart = await Cart.findOne({ user: req.user._id });

  // If cart does not exist, return error
  if (!cart) {
    return next(new ApiError("Cart not found"));
  }
  if(!cart.totalCartpriceAfterDiscount){
    return next(new ApiError("No coupon applied to the cart"));
  }
  cart.totalCartpriceAfterDiscount = 0; // Set the totalCartpriceAfterDiscount back to the original price
  await cart.save();

  res.status(200).json({
    status: "success",
    message: "coupon has been removed successfully",
    data: cart
  });
});
