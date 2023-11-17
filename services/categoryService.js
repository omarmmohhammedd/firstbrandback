const sharp = require("sharp");
const { v4: uuidv4 } = require("uuid");
const asyncHandler = require("express-async-handler");
const Category = require("../models/categoryModel");
const factory = require("./handllerFactory");
const { uploadMixOfImages } = require("../middlewares/uploadImageMiddleware");

//upload Singel image
// exports.uploadCategoryImage = uploadSingleImage("image");
exports.uploadCategoryImage = uploadMixOfImages([
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
    const imageCoverFileName = `category-${uuidv4()}-${Date.now()}-cover.jpeg`;

    await sharp(req.files.imageCover[0].buffer)
     
      .toFormat("jpeg")
      .jpeg({ quality: 95 })
      .toFile(`uploads/categories/${imageCoverFileName}`);

    // Save image into our db
    req.body.imageCover = imageCoverFileName;
  }
  //2- Image processing for images
  if (req.files.images) {
    req.body.images = [];
    await Promise.all(
      req.files.images.map(async (img, index) => {
        const imageName = `category-${uuidv4()}-${Date.now()}-${index + 1}.jpeg`;

        await sharp(img.buffer)
          .resize(2000, 1333)
          .toFormat("jpeg")
          .jpeg({ quality: 95 })
          .toFile(`uploads/categories/${imageName}`);

        // Save image into our db
        req.body.images.push(imageName);
      })
    );
  }

  next();
});
//@desc get list of categories
//@route GET /api/v1/categories
//@access public
exports.getCategories = factory.getALl(Category,"Category");
//@desc get specific category by id
//@route GET /api/v1/categories/:id
//@access public
exports.getCategory = factory.getOne(Category);
//@desc create category
//@route POST /api/v1/categories
//@access private
exports.createCategory = factory.createOne(Category);
//@desc update specific category
//@route PUT /api/v1/categories/:id
//@access private
exports.updateCategory = factory.updateOne(Category);

//@desc delete category
//@route DELETE /api/v1/categories/:id
//@access private
exports.deleteCategory = factory.deleteOne(Category);
