const express = require("express");
const {
  createSubCategory,
  getSubCategories,
  getSubCategory,
  updateSubCategory,
  deleteSubCategory,
  setCategoryIdToBody,
  createFilterObj,
  uploadSubCategoryImage,
  resizeImage,
  getSubWithType
} = require("../services/subCategoryService");
const authServices = require("../services/authServices");
const {
  createSupCategroyValidator,
  getsubCategoryValidator,
  updateCategroyValidator,
  deleteCategroyValidator,
} = require("../utils/validators/subCategoryValidator");

// mergeParams =>> it allows you to access the params from another resource
//ex: we need to access {categoryId} from category router
const router = express.Router({ mergeParams: true });

router.get('/getWithType/:type',getSubWithType)

router
  .route("/")
  //filter subCategories in specefic category by categoryId
  // the request will filter if the filterObj not empty then getSubCategories
  .get(createFilterObj, getSubCategories)
  // if you when you enter the data =>dont enter the category
  // this statment will take it from route params
  // the request will set the cateogryId if exist in params and go to validation{createSupCategroyValidator} then createSubCategroy
  .post(
    authServices.protect,
    authServices.allowedTo("admin", "manager"),
    uploadSubCategoryImage,resizeImage,
  	setCategoryIdToBody,
    createSupCategroyValidator,
    createSubCategory
  );
router
  .route("/:id")
  .get(getsubCategoryValidator, getSubCategory)
  .put(
    authServices.protect,
    authServices.allowedTo("admin", "manager"),
    uploadSubCategoryImage,resizeImage,
    updateCategroyValidator,
    updateSubCategory
  )
  .delete(
    authServices.protect,
    authServices.allowedTo("admin"),
    deleteCategroyValidator,
    deleteSubCategory
  );

module.exports = router;
