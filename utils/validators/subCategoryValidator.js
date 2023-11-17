const { check } = require("express-validator");
const validatorMiddleware = require("../../middlewares/validatorMiddleware");
const Category = require("../../models/categoryModel");

exports.getsubCategoryValidator = [
  //rules
  check("id")
    .isMongoId()
    .withMessage("Invalid subCategory id format")
    .notEmpty()
    .withMessage("subCateogry must be belong to category"),
  //catch error
  validatorMiddleware,
];
exports.createSupCategroyValidator = [
  check("name_en")
    .notEmpty()
    .withMessage("subCategory required")
    .isLength({ min: 3 })
    .withMessage("too short subCateogry name")
    .isLength({ max: 32 })
    .withMessage("too long subCateogry name"),
  check("name_ar")
    .notEmpty()
    .withMessage("subCategory required")
    .isLength({ min: 2 })
    .withMessage("too short subCateogry arabic name ")
    .isLength({ max: 32 })
    .withMessage("too long subCateogry arabic name"),
  check("category")
    .notEmpty()
    .withMessage("subCateogry must be belong to category")
    .isMongoId()
    .withMessage("Invalid Category id format")
    .custom((categoryId) =>
      Category.findById(categoryId).then((cateogry) => {
        if (!cateogry) {
          return Promise.reject(
            new Error(`No Category for this id : ${categoryId}`)
          );
        }
      })
    ),
    check("description_en")
    .notEmpty()
    .withMessage("subCateogry english description is required")
    .isLength({ min: 20 })
    .withMessage("Too short ProsubCateogryduct english description")
    .isLength({ max: 2000 })
    .withMessage("Too long subCateogry english description"),
  check("description_ar")
    .notEmpty()
    .withMessage("subCateogry arabic description is required")
    .isLength({ min: 20 })
    .withMessage("Too short subCateogry arabic description")
    .isLength({ max: 2000 })
    .withMessage("Too long subCateogry arabic description"),
  check("imageCover").notEmpty().withMessage("subCateogry imageCover is required"),
  check("images")
    .optional()
    .isArray()
    .withMessage("images should be array of string"),
  validatorMiddleware,
];
exports.updateCategroyValidator = [
  check("id")
    .isMongoId()
    .withMessage("Invalid subCategory id format")
    .notEmpty()
    .withMessage("subCateogry must be belong to category"),
  check("category")
    .notEmpty()
    .withMessage("subCateogry must be belong to category")
    .isMongoId()
    .withMessage("Invalid Category id format")
    .custom((categoryId) =>
      Category.findById(categoryId).then((cateogry) => {
        if (!cateogry) {
          return Promise.reject(
            new Error(`No Category for this id : ${categoryId}`)
          );
        }
      })
    ),
  check("name_en")
    .optional()
    .isLength({ min: 3 })
    .withMessage("too short subCateogry name")
    .isLength({ max: 32 })
    .withMessage("too long subCateogry name"),
  check("name_ar")
    .optional()
    .isLength({ min: 2 })
    .withMessage("too short subCateogry arabic name ")
    .isLength({ max: 32 })
    .withMessage("too long subCateogry arabic name"),
  check("description_en")
    .optional()
    .isLength({ min: 20 })
    .withMessage("Too short subCateogry english description")
    .isLength({ max: 2000 })
    .withMessage("Too long subCateogry english description"),
  check("description_ar")
    .optional()
    .isLength({ min: 20 })
    .withMessage("Too short subCateogry arabic description")
    .isLength({ max: 2000 })
    .withMessage("Too long subCateogry arabic description"),
  validatorMiddleware,
];
exports.deleteCategroyValidator = [
  check("id").isMongoId().withMessage("Invalid subCategory id format"),
  validatorMiddleware,
];
