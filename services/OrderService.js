let test  = 'sk_test_51NuJo7JxvesMFvG9zzYbVRQ5kJ8MEUBsqNXUevGsdmFhh7PxxLSuDMBKDvH0OexU1YypnuiczM82Xb4YVLZ2kk7b00FKUHaHf5'
let live = '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'
const stripe = require("stripe")(live, {
  stripeAccount: 'acct_1NuJo7JxvesMFvG9',
});


// Enable Apple Pay
stripe.applePay = true; // Use 'sandbox' or 'production' here


const asyncHandler = require("express-async-handler"); 
const ApiError = require("../utils/apiError");
const factory = require("./handllerFactory");

const Order = require("../models/orderModel");
const Cart = require("../models/cartModel");
const User = require("../models/userModel");
const Product = require("../models/productModel");


//@desc create cash order
//@route POST /api/v1/orders/:cartId
//@access protected/user
// exports.createCashOrder = asyncHandler(async (req, res, next) => {
//   const { cartId } = req.params;
//   //app settings
//   const taxPrice = 0;
//   const shippingPrice = 0;
//   //1) get cart depend on catrId
//   const cart = await Cart.findById(cartId);
//   if (!cart) {
//     return next(
//       new ApiError(`there is no cart with id ${req.params.catrId}`, 404)
//     );
//   }
//   //2) get order price cart price  "check if copoun applied"
//   const cartPrice = cart.totalCartpriceAfterDiscount
//     ? cart.totalCartpriceAfterDiscount
//     : cart.totalCartprice;
//   const totalOrderPrice = cartPrice + taxPrice + shippingPrice;
//   //3)create order with default payment method cash
//   const order = await Order.create({
//     user: req.user._id,
//     cartItems: cart.cartItems,
//     shippingAddress: req.body.shippingAddress,
//     totalOrderPrice,
//   });
//   //4) after creating order  decerement product quantity and increment product sold
//   if (order) {
//     const bulkOptions = cart.cartItems.map((item) => ({
//       updateOne: {
//         filter: { _id: item.product },
//         update: { $inc: { quantity: -item.quantity, sold: +item.quantity } },
//       },
//     }));
//     await Product.bulkWrite(bulkOptions, {});
//     //5)clear cart depend on cartId
//     await Cart.findByIdAndDelete(cartId);

//     const userOrder = await User.findById(req.user._id);
//     const emailMessage = `Hi ${userOrder.name},\n Your order has been created successfully \n 
//     you have to wait for 2 days at least before the order arrives to you \n
//     the order Price is : { ${totalOrderPrice} } containing the order cartPrice :${cartPrice}
//     and order shipping price : ${shippingPrice} 
//     and order tax price : ${taxPrice}`  ;
//     //3-send the reset code via email
//     await sendEmail({
//       to: userOrder.email,
//       subject: "Your Order has been created successfully",
//       text: emailMessage,
//     });
//   }
//   res.status(201).json({ status: "success", data: order });
// });

exports.filterOrderForLoggedUser = asyncHandler(async (req, res, next) => {
  if (req.user.role === "user") req.filterObj = { user: req.user._id };
  next();
});
//@desc get all orders
//@route GET /api/v1/orders
//@access protected/user-admin-manager
exports.findAllOrders = factory.getALl(Order);
//@desc get specifi orders
//@route GET /api/v1/orders/:orderId
//@access protected/user-admin-manager
exports.findSpecificOrder = factory.getOne(Order);
//@desc update order paid status to paid
//@route PUT /api/v1/orders/:orderId/pay
//@access protected/admin-manager
exports.updateOrderToPay = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    return next(
      new ApiError(`there is no such a order for this id ${req.params.id}`, 404)
    );
  }
  //update order to payed
  order.isPaid = true;
  order.paidAt = Date.now();

  const updatedOrder = await order.save();

  res.status(200).json({ status: "success", data: updatedOrder });
});
//@desc update order delivered status to delivered
//@route PUT /api/v1/orders/:orderId/deliver
//@access protected/admin-manager
exports.updateOrderToDelivered = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    return next(
      new ApiError(`there is no such a order for this id ${req.params.id}`, 404)
    );
  }
  //update order to payed
  order.isDelivered = true;
  order.deliveredAt = Date.now();

  const updatedOrder = await order.save();

  res.status(200).json({ status: "success", data: updatedOrder });
});

//@desc Get checkout session from stripe and send it as response
//@route GET /api/v1/orders/checkout-session/cartId
//@access protected/user
exports.checkoutSession = asyncHandler(async (req, res, next) => {
  const { cartId } = req.params;
  let metadataObject={};
  
  //app settings
  const taxPrice = 0;
  const shippingPrice = 0;
  //1) get cart depend on catrId
  const cart = await Cart.findById(cartId);
  if (!cart) {
    return next(
      new ApiError(`there is no cart with id ${req.params.catrId}`, 404)
    );
  }

   
   metadataObject.details=req.body.metadataObject.details;
   metadataObject.phone=req.body.metadataObject.phone;
   metadataObject.city=req.body.metadataObject.city;
   metadataObject.postalCode=req.body.metadataObject.postalCode;
   metadataObject.arrivalTime=req.body.metadataObject.arrivalTime;
   metadataObject.client_reference_id= req.params.cartId;
   metadataObject.customer_email= req.user.email;
  //2) get order price cart price  "check if copoun applied"
  const cartPrice = cart.totalCartpriceAfterDiscount
    ? cart.totalCartpriceAfterDiscount
    : cart.totalCartprice;
  const totalOrderPrice = Math.ceil(cartPrice + taxPrice + shippingPrice);
  const paymentIntent = await stripe.paymentIntents.create({
    amount: totalOrderPrice*100,
    currency: 'usd',
    payment_method_options: {
      card: {
        request_three_d_secure: "any",
      },
    },
    metadata:metadataObject,
  });
  console.log(paymentIntent)
  // 3)create stripe checkout session
  // const session = await stripe.checkout.sessions.create({
  //    payment_method_types: ["card"],
  //   line_items: [
  //     {
  //       price_data: {
  //         unit_amount: totalOrderPrice * 100,
  //         currency: "usd",
  //         product_data: {
  //           name: req.user.name,
  //         },
  //       },
  //       quantity: 1,
  //     },
  //   ],
  //   mode: "payment",
  //   success_url: "http://localhost:5173/profile?order=done",
  //   cancel_url: "http://localhost:5173",
  //   customer_email: req.user.email,
        
  //   , // i will use to create order
  //   payment_intent_data: {
  //     capture_method: 'manual',
  //   },
  // });
  // 4) send session to response

  
  
  res.status(200).json({ status: "success", client_secret : paymentIntent.client_secret });
});


const createCardOrder = async (session) => {
  const cartId = session.metadata.client_reference_id;
  const orderPrice = session.amount / 100;
  const {details,phone,city,postalCode,arrivalTime}=session.metadata;
  const shippingAddress={
    details,
    phone,
    city,
    postalCode
  };
  
  console.log("session",session)
  console.log("shippingadd",shippingAddress)
  const cart = await Cart.findById(cartId);
  const user = await User.findOne({ email: session.metadata.customer_email });
  
  //create unique number for order 
  const generateUniqueOrderNumber = () => {
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, '0'); // Get current month in 2-digit format
    const day = String(now.getDate()).padStart(2, '0'); // Get current day in 2-digit format
    const seconds = String(now.getSeconds()).padStart(2, '0'); // Get current seconds in 2-digit format

    const orderNumber = `${month}${day}${seconds}`; // Combine month, day, seconds, and random number, and take the first 5 digits

    return orderNumber;
  };

  //3)create order with default payment method cash
  const order = await Order.create({
    user: user._id,
    orderNumber: generateUniqueOrderNumber(),
    cartItems: cart.cartItems,
    shippingAddress,
    arrivalTime,
    totalOrderPrice: orderPrice,
    isPaid: true,
    paidAt: Date.now(),
    paymentMethodType: "card",
  });
  //4) after creating order  decerement product quantity and increment product sold
  if (order) {
    const bulkOptions = cart.cartItems.map((item) => ({
      updateOne: {
        filter: { _id: item.product },
        update: { $inc: { quantity: -item.quantity, sold: +item.quantity } },
      },
    }));
    await Product.bulkWrite(bulkOptions, {});

    //5)clear cart depend on cartId
    await Cart.findByIdAndDelete(cartId);

console.log("done")

  }
};


//@desc this webhook will run when the stripe payment success paied
//@route POST /webhook-checkout
//@access protected/user
exports.webhookCheckout = asyncHandler(async (req, res, next) => {
  console.log("start")
  try {
    const sig = req.headers["stripe-signature"];

    let event = req.body;
    
    console.log("very success")
    console.log(event)
    if (event.type === "payment_intent.succeeded") {
   console.log("start crearing")
      createCardOrder(event.data.object);
   console.log("finish crearing")   
    }
  
    res.status(200).json({ received: true });
  } catch (error) {
    console.log(error)
  }
 
});
