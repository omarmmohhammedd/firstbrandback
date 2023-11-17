const sharp = require("sharp");
const { v4: uuidv4 } = require("uuid");
const asyncHandler = require("express-async-handler");
const SubCategory = require("../models/subCategoryModel");
const Category = require("../models/categoryModel");
const factory = require("./handllerFactory");
const { uploadMixOfImages } = require("../middlewares/uploadImageMiddleware");

//upload Singel image
// exports.uploadCategoryImage = uploadSingleImage("image");
exports.uploadSubCategoryImage = uploadMixOfImages([
  {
    name: "imageCover",
    maxCount: 1,
  },
  {
    name: "images",
    maxCount: 10,
  },
]);

//image processing
exports.resizeImage = asyncHandler(async (req, res, next) => {
  //1- Image processing for imageCover
  if (req.files.imageCover) {
    const imageCoverFileName = `subCategory-${uuidv4()}-${Date.now()}-cover.jpeg`;

    await sharp(req.files.imageCover[0].buffer)
     
      .toFormat("jpeg")
      .jpeg({ quality: 95 })
      .toFile(`uploads/subCategories/${imageCoverFileName}`);

    // Save image into our db
    req.body.imageCover = imageCoverFileName;
  }
  //2- Image processing for images
  if (req.files.images) {
    req.body.images = [];
    await Promise.all(
      req.files.images.map(async (img, index) => {
        const imageName = `subCategory-${uuidv4()}-${Date.now()}-${index + 1}.jpeg`;

        await sharp(img.buffer)
          
          .toFormat("jpeg")
          .jpeg({ quality: 95 })
          .toFile(`uploads/subCategories/${imageName}`);

        // Save image into our db
        req.body.images.push(imageName);
      })
    );
  }

  next();
});
// middleware to add categoryId to body
exports.setCategoryIdToBody = (req, res, next) => {
  //Nested Route
  if (!req.body.category) req.body.category = req.params.categoryId;
  next();
};

//filter subCategories in specefic category by categoryId
exports.createFilterObj = (req, res, next) => {
  let filterObject = {};
  if (req.params.categoryId) filterObject = { category: req.params.categoryId };
  req.filterObj = filterObject;
  next();
};
//@desc get list of subcategories
//@route GET /api/v1/subCategories
//@access public
exports.getSubCategories = factory.getALl(SubCategory);
//@desc get specific subCategories by id
//@route GET /api/v1/subCategories/:id
//@access public
exports.getSubCategory = factory.getOne(SubCategory);
//@desc create subCategory
//@route POST /api/v1/subcategories
//@access private
exports.createSubCategory = factory.createOne(SubCategory);
//@desc update specific subCategory
//@route PUT /api/v1/subCategories/:id
//@access private
exports.updateSubCategory = factory.updateOne(SubCategory);
//@desc delete subCategory
//@route DELETE /api/v1/subCategories/:id
//@access private

exports.deleteSubCategory = factory.deleteOne(SubCategory);

exports.getSubWithType = async (req,res)=> {
  try {
    const {type}=req.params
    // Find all categories that contain the specified type
    const categories = await Category.find({ type });

    // Extract an array of category IDs from the found categories
    const categoryIds = categories.map((category) => category._id);

    // Find all subcategories whose categoryId is in the categoryIds array
    const subcategories = await SubCategory.find({ category: { $in: categoryIds } });
    if(subcategories.length===0){
      return res.status(404).json({status:`faild`,msg:`there is no subCategories under this this type`})
    }

    return res.status(200).json({status:`success`,data:subcategories})
  } catch (error) {
    return res.status(400).json({status:`faild`,error:error})
  }
}