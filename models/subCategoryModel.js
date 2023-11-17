const mongoose = require("mongoose");

const subCategorySchema = new mongoose.Schema(
  {
    name_ar: {
      type: String,
      trim: true,
      //unique: [true, "category must be unique"],
      minlength: [2, "too short subCategory name"],
      maxlength: [32, "too long subCategory name"],
    },
    name_en: {
      type: String,
      trim: true,
     // unique: [true, "category must be unique"],
      minlength: [2, "too short subCategory name"],
      maxlength: [32, "too long subCategory name"],
    },
    category: {
      type: mongoose.Schema.ObjectId,
      ref: "Category",
      required: [true, "subCategory must be belong to parent category"],
    },
    description_ar: {
      type: String,
      required: [true, "subCategory description is required"],
      trim: true,
      minlength: [20, "Too short subCategory description"],
    },
    description_en: {
      type: String,
      required: [true, "subCategory description is required"],
      trim: true,
      minlength: [20, "Too short subCategory description"],
    },
    imageCover: {
      type: String,
      required: [true, "subCategory image cover is required"],
    },
    images: [String],
  },
  { timestamps: true }
);


const setImageURL = (doc) => {
  //return image base url + iamge name
  if (doc.imageCover) {
    const imageUrl = `${process.env.BASE_URL}/subCategories/${doc.imageCover}`;
    doc.imageCover = imageUrl;
  }
  if (doc.images) {
    const imageListWithUrl = [];
    doc.images.forEach((image) => {
      const imageUrl = `${process.env.BASE_URL}/subCategories/${image}`;
      imageListWithUrl.push(imageUrl);
    });
    doc.images = imageListWithUrl;
  }
};
//after initializ the doc in db
// check if the document contains image
// it work with findOne,findAll,update
subCategorySchema.post("init", (doc) => {
  setImageURL(doc);
});
// it work with create
subCategorySchema.post("save", (doc) => {
  setImageURL(doc);
});

// ^find => it mean if part of of teh word contains find
subCategorySchema.pre(/^find/, function (next) {
  // this => query
  this.populate({
    path: "category",
    select: "name_en name_ar ",
  });
  next();
});

const subCategory =  mongoose.model("subCategory", subCategorySchema);
module.exports = subCategory;
