const { ObjectId } = require("mongodb");
const Joi = require("joi");
const multer  = require('multer');
const path = require("path");

const db = require("../mongo");

const productBody = Joi.object({
  name: Joi.string().required(),
  price: Joi.number().required(),
  category: Joi.string().optional().allow(null, "")
});

const supportedThumnbnailMimeTypes = ['image/jpeg', 'image/webp', 'image/png'];

//using multer for saving thumbnails
const storage = multer.diskStorage({
  destination: async function (req, file, cb) {
    //Validate Request Body
    const { error } = await productBody.validate(req.body);
    if (error) cb({ message: error.details[0].message });

    if (file.fieldname === "thumbnail" && supportedThumnbnailMimeTypes.includes(file.mimetype)) {  //image file
      cb(null, 'public/thumbnails')
    } else {
      console.log("invalidFileType: ",file.mimetype);
      cb({ message: 'Mime type not supported' })
    }
  },
  filename: (req, file, cb) => {
    let extension = path.extname(file.originalname);
    let fileNameWithoutExt = path.basename(file.originalname, extension);
    cb(null, fileNameWithoutExt + '-' + Date.now() + extension);
  }
})
const upload = multer({ storage: storage }).any();

const service = {
  async findAll(req, res) {
    const data = await db.products.find().toArray();
    res.send(data);
  },
  async findById(req, res) {
    try{
      const data = await db.products.findOne({ _id: new ObjectId(req.params.id) });
      res.send(data);
    } catch(err) {
      console.log(err);
      res.send({ error: { message: "Operation failed" }});
    }
  },
  async insert(req, res) {
    try {
      upload(req, res, async (err) => {
        if (err) {
          return res.send({ error: { message: "Error in saving file: "+err.message }});
        }
        
        //check if the file were stored
        if(!req.files) { //this file is added by multer after storing
          return res.send({ error: { message: "Error in saving file" }});
        }

        //check if product already exists
        const data = await db.products.findOne({ name: req.body.name });
        if(data) {
          return res.send({ error: { message: "Product already exists" }});
        }

        req.files.forEach(file => {
          req.body['thumbnail'] = file;
        });

        //convert category json string to object
        if(req.body.category) {
          req.body.category = JSON.parse(req.body.category);
        }
        // console.log("check",req.body, req.files);

        await db.products.insertOne(req.body);
        res.send({ success: { message: "Product added successfully" }});
      })
    } catch(err) {
      console.log(err);
      res.send({ error: { message: "Operation failed" }});
    }
  },
  async updateById(req, res) {
    try {
      upload(req, res, async (err) => {
        if (err) {
          return res.send({ error: { message: "Error in saving file: "+err.message }});
        }
        
        //check if the file were stored
        if(!req.files) { //this file is added by multer after storing
          return res.send({ error: { message: "Error in saving file" }});
        }

        let productId = req.params.id
        //check if product already exists
        const product = await db.products.findOne({ _id: new ObjectId(productId) });
        if(!product) {
          return res.send({ error: { message: "Product does not exist" }});
        }

        req.files.forEach(file => {
          req.body['thumbnail'] = file;
        });

        //convert category json string to object
        if(req.body.category) {
          req.body.category = JSON.parse(req.body.category);
        }
        // console.log("check",req.body, req.files);

        await db.products.updateOne({_id: new ObjectId(productId)}, { $set: { ...req.body } });
        res.send({ success: { message: "Product added successfully" }});
      })
    } catch(err) {
      console.log(err);
      res.send({ error: { message: "Operation failed" }});
    }
  },
  async deleteById(req, res) {
    try {
      //check if product exists
      const data = await db.products.findOne({ _id: new ObjectId(req.params.id) });
      if(!data) {
        return res.send({ error: { message: "Product does not exist" }});
      }

      await db.products.deleteOne({ _id: new ObjectId(req.params.id) });
      res.send({ success: { message: "Product deleted successfully" }});
    } catch(err) {
      console.log(err);
      res.send({ error: { message: "Operation failed" }});
    }
  },
  async removeCategoryForProducts(category_id) {
    try {
      const products = await db.products.find().toArray();
      await Promise.all(products.map(async product => {
        let categories = product.category;
        if(categories) {
          product.category = categories.filter(id => (id !== category_id));
        }
        await updateProduct(product._id, product);
      }));
    } catch(err) {
      console.log(err);
      res.send({ error: { message: "Operation failed" }});
    }
  }

};

module.exports = service;
