const { ObjectId } = require("mongodb");

const db = require("../mongo");

const service = {
  async find(req, res) {   //get all cart products for the user
    console.log(req.userId);
    const data = await db.users.findOne({ _id: new ObjectId(req.userId) });   //find the data for the user
    console.log(data);
    res.send(data.cart);
  },
  async addProductToCart(req, res) {  //add product id to the cart of the user
    const newData = await db.users.findOne({ _id: new ObjectId(req.user._id) });  //find the data for the user
    if(newData.cart===undefined || newData.cart===null)
      newData.cart = []
    newData.cart.push(req.body.productId);  
    const data = await db.users.updateOne(
      { _id: new ObjectId(req.user._id) },
      { $set: { ...newData } }
    );
    res.send(data);
  },
  async removeProductFromCart(req, res) {   //remove product id from the cart of the user
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
