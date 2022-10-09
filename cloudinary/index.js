const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

cloudinary.config({
  cloud_name: process.env.ClaudinaryCloudName,
  api_key: process.env.ClaudinaryKey,
  api_secret: process.env.ClaudinarySecret,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params:{
  folder: 'backery',
}
})
const VIDstorage = new CloudinaryStorage({
  cloudinary,
  params:{
    resource_type: "video",
      folder: "video",
}
})


module.exports = {
  cloudinary,
  storage,
  VIDstorage
}



