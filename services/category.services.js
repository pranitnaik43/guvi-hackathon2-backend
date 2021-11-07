const { ObjectId } = require("mongodb");
const Joi = require("joi");

const db = require("../mongo");
const productServices = require("./product.services");

const categoryBody = Joi.object({
  name: Joi.string().required()
});

const service = {
  async findAll(req, res) {
    const data = await db.categories.find().toArray();
    res.send(data);
  },
  async findById(req, res) {
    try {
      const data = await db.categories.findOne({ _id: new ObjectId(req.params.id) });
      res.send(data);
    } catch(err) {
      console.log(err);
      res.send({ error: { message: "Operation failed" }});
    }
    
  },
  async insert(req, res) {
    try {
      // Validate Request Body
      const { error } = await categoryBody.validate(req.body);
      if (error) return res.send({ error: { message: error.details[0].message }});

      //check if category already exists
      const data = await db.categories.findOne({ name: req.body.name });
      if(data) {
        return res.send({ error: { message: "Category already exists" }});
      }

      await db.categories.insertOne(req.body);
      res.send({ success: { message: "Category added successfully" }});
    } catch(err) {
      console.log(err);
      res.send({ error: { message: "Operation failed" }});
    }
  },
  async updateById(req, res) {
    try {
      // Validate Request Body
      const { error } = await categoryBody.validate(req.body);
      if (error) return res.send({ error: { message: error.details[0].message }});

      //check if category exists
      const data = await db.categories.findOne({ _id: new ObjectId(req.params.id) });
      if(!data) {
        return res.send({ error: { message: "Category does not exist" }});
      }

      await db.categories.updateOne(
        { _id: new ObjectId(req.params.id) },
        { $set: { ...req.body } }
      );
      res.send({ success: { message: "Category updated successfully" }});
    } catch(err) {
      console.log(err);
      res.send({ error: { message: "Operation failed" }});
    }
  },
  async deleteById(req, res) {
    try {
      //check if category exists
      let category_id = req.params.id;
      const data = await db.categories.findOne({ _id: new ObjectId(category_id) });
      if(!data) {
        return res.send({ error: { message: "Category does not exist" }});
      }

      //remove the category from products data
      await productServices.removeCategoryForProducts(category_id);

      await db.categories.deleteOne({ _id: new ObjectId(category_id) });
      res.send({ success: { message: "Category deleted" }});
    } catch(err) {
      console.log(err);
      res.send({ error: { message: "Operation failed" }});
    }
  },
};

module.exports = service;
