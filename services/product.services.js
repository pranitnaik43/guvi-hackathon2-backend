const { ObjectId } = require("mongodb");

const db = require("../mongo");

const service = {
  async find(req, res) {
    const data = await db.products.find().toArray();
    res.send(data);
  },
  async findById(req, res) {
    const data = await db.products.findOne({ _id: new ObjectId(req.params.id) });
    res.send(data);
  },
  async insert(req, res) {
    const data = await db.products.insertOne(req.body);
    res.send(data);
  },
  async updateById(req, res) {
    const data = await db.products.updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: { ...req.body } }
    );
    res.send(data);
  },
  async deleteById(req, res) {
    const data = await db.products.deleteOne({ _id: new ObjectId(req.params.id) });
    res.send(data);
  },
};

module.exports = service;
