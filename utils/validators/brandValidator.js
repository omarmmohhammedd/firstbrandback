const { check, body } = require("express-validator");
const slugify = require("slugify");

const validatorMiddleware = require("../../middlewares/validatorMiddleware");

exports.getBrandValidator = [
  //rules
  check("id").isMongoId().withMessage("Invalid brand id format"),
  //catch error
  validatorMiddleware,
];
exports.createBrandValidator = [
  check("name_en")
    .notEmpty()
    .withMessage("brand english name required")
    .isLength({ min: 2 })
    .withMessage("too short brand english name")
    .isLength({ max: 32 })
    .withMessage("too long brand english name")
   ,
   check("name_ar")
   .notEmpty()
   .withMessage("brand arabic name required")
   .isLength({ min: 2 })
   .withMessage("too short brand arabic name")
   .isLength({ max: 32 })
   .withMessage("too long brand arabic name")
  ,
  validatorMiddleware,
];
exports.updateBrandValidator = [
  check("id").isMongoId().withMessage("Invalid brand id format"),
  body("name_en")
    .optional()
   ,
   body("name_ar")
   .optional()
  ,
  validatorMiddleware,
];
exports.deleteBrandValidator = [
  check("id").isMongoId().withMessage("Invalid brand id format"),
  validatorMiddleware,
];
