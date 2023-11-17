const sharp = require("sharp");
const { v4: uuidv4 } = require("uuid");
const asyncHandler = require("express-async-handler");
const { uploadMixOfImages } = require("../middlewares/uploadImageMiddleware");
const Product = require("../models/productModel");
const factory = require("./handllerFactory");

exports.uploadProductImages = uploadMixOfImages([
  {
    name: "imageCover",
    maxCount: 1,
  },
  {
    name: "images",
    maxCount: 10,
  },
]);
exports.convertToArray = (req, res, next) => {
  if (req.body.subCategories) {
    // If it's not an array, convert it to an array
    if (!Array.isArray(req.body.subCategories)) {
      req.body.subCategories = [req.body.subCategories];
    }
  }
  if (req.body.colors) {
    // If it's not an array, convert it to an array
    if (!Array.isArray(req.body.colors)) {
      req.body.colors = [req.body.colors];
    }
  }
  if (req.body.sizes) {
    // If it's not an array, convert it to an array
    if (!Array.isArray(req.body.sizes)) {
      req.body.sizes = [req.body.sizes];
    }
  }
  if (req.body.size_EU) {
    // If it's not an array, convert it to an array
    if (!Array.isArray(req.body.size_EU)) {
      req.body.size_EU = [req.body.size_EU];
    }
  }
  if (req.body.size_UK) {
    // If it's not an array, convert it to an array
    if (!Array.isArray(req.body.size_UK)) {
      req.body.size_UK = [req.body.size_UK];
    }
  }
  if (req.body.size_US) {
    // If it's not an array, convert it to an array
    if (!Array.isArray(req.body.size_US)) {
      req.body.size_US = [req.body.size_US];
    }
  }
  if (req.body.size_Japan) {
    // If it's not an array, convert it to an array
    if (!Array.isArray(req.body.size_Japan)) {
      req.body.size_Japan = [req.body.size_Japan];
    }
  }
  if (req.body.size_ChinaTops) {
    // If it's not an array, convert it to an array
    if (!Array.isArray(req.body.size_ChinaTops)) {
      req.body.size_ChinaTops = [req.body.size_ChinaTops];
    }
  }
  if (req.body.size_ChinaButtoms) {
    // If it's not an array, convert it to an array
    if (!Array.isArray(req.body.size_ChinaButtoms)) {
      req.body.size_ChinaButtoms = [req.body.size_ChinaButtoms];
    }
  }
  if (req.body.size_korea) {
    // If it's not an array, convert it to an array
    if (!Array.isArray(req.body.size_korea)) {
      req.body.size_korea = [req.body.size_korea];
    }
  }
  if (req.body.size_italy) {
    // If it's not an array, convert it to an array
    if (!Array.isArray(req.body.size_italy)) {
      req.body.size_italy = [req.body.size_italy];
    }
  }
  if (req.body.size_france) {
    // If it's not an array, convert it to an array
    if (!Array.isArray(req.body.size_france)) {
      req.body.size_france = [req.body.size_france];
    }
  }
  if (req.body.size_Mexico) {
    // If it's not an array, convert it to an array
    if (!Array.isArray(req.body.size_Mexico)) {
      req.body.size_Mexico = [req.body.size_Mexico];
    }
  }
  if (req.body.size_In) {
    // If it's not an array, convert it to an array
    if (!Array.isArray(req.body.size_In)) {
      req.body.size_In = [req.body.size_In];
    }
  }
  if (req.body.size_Brazil) {
    // If it's not an array, convert it to an array
    if (!Array.isArray(req.body.size_Brazil)) {
      req.body.size_Brazil = [req.body.size_Brazil];
    }
  }
  if (req.body.size_CM) {
    // If it's not an array, convert it to an array
    if (!Array.isArray(req.body.size_CM)) {
      req.body.size_CM = [req.body.size_CM];
    }
  }
  if (req.body.highlights_ar) {
    // If it's not an array, convert it to an array
    if (!Array.isArray(req.body.highlights_ar)) {
      req.body.highlights_ar = [req.body.highlights_ar];
    }
  }
  if (req.body.highlights_en) {
    // If it's not an array, convert it to an array
    if (!Array.isArray(req.body.highlights_en)) {
      req.body.highlights_en = [req.body.highlights_en];
    }
  }
  next();
};

//image processing
exports.resizeProductImages = asyncHandler(async (req, res, next) => {
  //1- Image processing for imageCover
  if (req.files.imageCover) {
    const imageCoverFileName = `product-${uuidv4()}-${Date.now()}-cover.jpeg`;

    await sharp(req.files.imageCover[0].buffer)
      .toFormat("jpeg")
      .jpeg({ quality: 95 })
      .toFile(`uploads/products/${imageCoverFileName}`);

    // Save image into our db
    req.body.imageCover = imageCoverFileName;
  }
  //2- Image processing for images
  if (req.files.images) {
    req.body.images = [];
    await Promise.all(
      req.files.images.map(async (img, index) => {
        const imageName = `product-${uuidv4()}-${Date.now()}-${index + 1}.jpeg`;

        await sharp(img.buffer)
          .toFormat("jpeg")
          .jpeg({ quality: 95 })
          .toFile(`uploads/products/${imageName}`);

        // Save image into our db
        req.body.images.push(imageName);
      })
    );
  }

  next();
});


//@desc get list of products
//@route GET /api/v1/products
//@access public
exports.getProducts = factory.getALl(Product, "Product");
//@desc get specific product by id
//@route GET /api/v1/products/:id
//@access public
exports.getProduct = factory.getOne(Product, "reviews");
//@desc create product
//@route POST /api/v1/products
//@access private
exports.createProduct = factory.createOne(Product);
//@desc update specific product
//@route PUT /api/v1/products/:id
//@access private
exports.updateProduct = factory.updateOne(Product);

//@desc delete product
//@route DELETE /api/v1/products/:id
//@access private
exports.deleteProduct = factory.deleteOne(Product);
