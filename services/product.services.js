const { ObjectId } = require("mongodb");
const Joi = require("joi");

const db = require("../mongo");

const productBody = Joi.object({
  name: Joi.string().required(),
  price: Joi.number().required(),
  category: Joi.array().required()
});

const updateProduct = async (productId, productBody) => {
  try {
    //check if product exists
    const data = await db.products.findOne({ _id: new ObjectId(productId) });
    if(!data) {
      return { error: { message: "Product does not exist" }};
    }

    await db.products.updateOne(
      { _id: new ObjectId(productId) },
      { $set: { ...productBody } }
    );
    return { success: { message: "Product updated successfully" }};
  } catch(err) {
    console.log(err);
    return { error: { message: "Operation failed" }};
  }
}

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
      // Validate Request Body
      const { error } = await productBody.validate(req.body);
      if (error) return res.send({ error: { message: error.details[0].message }});

      //check if product already exists
      const data = await db.products.findOne({ name: req.body.name });
      if(data) {
        return res.send({ error: { message: "Product already exists" }});
      }

      await db.products.insertOne(req.body);
      res.send({ success: { message: "Product added successfully" }});
    } catch(err) {
      console.log(err);
      res.send({ error: { message: "Operation failed" }});
    }
  },
  async updateById(req, res) {
    try {
      // Validate Request Body
      const { error } = await productBody.validate(req.body);
      if (error) return res.send({ error: { message: error.details[0].message }});

      let result = await updateProduct(req.params.id, req.body);
      res.send(result);
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
      console.log("check123");
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
