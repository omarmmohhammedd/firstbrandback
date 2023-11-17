const express = require("express");

const {
  addProductToWishlistValidator,
} = require("../utils/validators/wishlistValidator");
const {
  addProductToWishlist,
  removeProductFromWishlist,
  getLoggedUserWishlist,
} = require("../services/wishlistService");
const authServices = require("../services/authServices");

const router = express.Router();

router.use(authServices.protect, authServices.allowedTo("user"));

router
  .route("/")
  .get(getLoggedUserWishlist)
  .post(addProductToWishlistValidator, addProductToWishlist);
router.delete("/:productId", removeProductFromWishlist);

module.exports = router;
