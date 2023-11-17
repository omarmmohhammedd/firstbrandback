const express = require("express");
const {
  addProductToCartValidator,
  removeSpecificCartItemValidator,
  updateCartItemQuantityValidator,
  applayCouponValidator,
} = require("../utils/validators/cartValidator");
const authServices = require("../services/authServices");
const {
  addProductToCart,
  getLoggedUserCart,
  removeSpecificCartItem,
  clearCart,
  updateCartItemQuantity,
  applayCoupon,
  removeCoupon
} = require("../services/cartServices");

const router = express.Router();
router.use(authServices.protect, authServices.allowedTo("user","admin"));

router
  .route("/")
  .post(addProductToCartValidator, addProductToCart)
  .get(getLoggedUserCart)
  .delete(clearCart);

router.put("/applaycoupon", applayCouponValidator, applayCoupon);
router.put("/removecoupon", removeCoupon);
router
  .route("/:itemId")
  .delete(removeSpecificCartItemValidator, removeSpecificCartItem)
  .put(updateCartItemQuantityValidator, updateCartItemQuantity);

module.exports = router;
