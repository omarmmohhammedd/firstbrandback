const { check } = require("express-validator");
const validatorMiddleware = require("../../middlewares/validatorMiddleware");
const Product = require("../../models/productModel");
const Cart = require("../../models/cartModel");

exports.addProductToCartValidator = [
  check("productId")
    .notEmpty()
    .withMessage("Product id is required")
    .isMongoId()
    .withMessage("Invalid ID format")
    .custom((productId) =>
      Product.findById(productId).then((product) => {
        if (!product) {
          return Promise.reject(
            new Error(`No product for this id : ${productId}`)
          );
        }
      })
    ),
  check("color")
    .optional()
    .custom(async (val, { req }) => {
      const product = await Product.findById(req.body.productId);
      if (!product.colors.includes(val)) {
        throw new Error("Invalid color selected for this item");
      }
      return true;
    }),
  check("size")
    .optional()
    .custom(async (val, { req }) => {
      const product = await Product.findById(req.body.productId);
      console.log(product);
      if (
        !product.sizes.includes(val) &&
        !product.size_EU.includes(val) &&
        !product.size_UK.includes(val) &&
        !product.size_US.includes(val) &&
        !product.size_Japan.includes(val) &&
        !product.size_ChinaTops.includes(val) &&
        !product.size_ChinaButtoms.includes(val) &&
        !product.size_korea.includes(val) &&
        !product.size_france.includes(val) &&
        !product.size_Mexico.includes(val) &&
        !product.size_Brazil.includes(val) &&
        !product.size_italy.includes(val) &&
        !product.size_CM.includes(val) &&
        !product.size_In.includes(val)
      ) {
        throw new Error("Invalid size selected for this item");
      }

      return true;
    }),

  validatorMiddleware,
];
exports.removeSpecificCartItemValidator = [
  check("itemId").isMongoId().withMessage("Invalid ID format"),
  validatorMiddleware,
];
exports.updateCartItemQuantityValidator = [
  check("itemId").isMongoId().withMessage("Invalid ID format"),
  check("quantity").custom(async (val, { req, next }) => {
    const cart = await Cart.findOne({ user: req.user._id });

    const itemIndex = cart.cartItems.findIndex(
      (item) => item._id.toString() === req.params.itemId
    );
    if (itemIndex > -1) {
      const cartItem = cart.cartItems[itemIndex];
      const currentProduct = await Product.findById(cartItem.product);
      if (currentProduct.quantity < val) {
        throw new Error("Invalid quantity selected for this item");
      }
    } else {
      return new Error(`there is no item for this id `);
    }
    return true;
  }),
  validatorMiddleware,
];
exports.applayCouponValidator = [
  check("coupon").notEmpty().withMessage("coupon is required"),
  validatorMiddleware,
];
