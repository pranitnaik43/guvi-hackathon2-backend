const { ObjectId } = require("mongodb");

const db = require("../mongo");

const service = {
  async find(req, res) {
    const data = await db.users.findOne({ _id: new ObjectId(req.user._id) });
    console.log(data);
    res.send(data.cart);
  },
  async insert(req, res) {
    const newData = await db.users.findOne({ _id: new ObjectId(req.user._id) });
    if(newData.cart===undefined || newData.cart===null)
      newData.cart = []
    newData.cart.push(req.body);
    const data = await db.users.updateOne(
      { _id: new ObjectId(req.user._id) },
      { $set: { ...newData } }
    );
    res.send(data);
  },
  async delete(req,res) {
    const newData = await db.users.findOne({ _id: new ObjectId(req.user._id) });
    if(newData.cart===undefined || newData.cart===null)
      newData.cart = []
    newData.cart = newData.cart.filter(element => (element.productId!==req.body.productId));
    const data = await db.users.updateOne(
      { _id: new ObjectId(req.user._id) },
      { $set: { ...newData } }
    );
    res.send(data);
  }
};

module.exports = service;
