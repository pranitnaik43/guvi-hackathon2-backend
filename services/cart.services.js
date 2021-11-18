const { ObjectId } = require("mongodb");

const db = require("../mongo");

const service = {
  async find(req, res) {   //get all cart products for the user
    // console.log(req.userId);
    const data = await db.cart.findOne({ userId: req.userId });   //find the data for the user
    if(data && data.cart) {
      return res.send(data.cart);
    }
    res.send(null);
  },
  async addProductToCart(req, res) {  //add product id to the cart
    try {
      //check if product exists
      let productId = req.body.productId;
      const product = await db.products.findOne({ _id: new ObjectId(req.body.productId) });
      // console.log(productId, product)
      if(!product) {
        return res.send({error: {message: "Product does not exist"}});
      }
      let cartForUser = await db.cart.findOne({ userId: req.userId });  //find the data for the user
      if(!cartForUser) {
        cartForUser = { userId: req.userId, cart: [productId] }
        await db.cart.insertOne({...cartForUser});
        return res.send({success: {message: "Successfully added to cart"}});
      }
      if(!cartForUser.cart) {
        cartForUser.cart = []
      }
      cartForUser.cart.push(productId);  
      await db.cart.updateOne(
        { userId: req.userId },
        { $set: { ...cartForUser } }
      );
      res.send({success: {message: "Successfully added to cart"}});
    }
    catch(e) {
      console.log("Error in adding product to cart: ", e);
      res.send({error: {message: "Operation Failed"}});
    }
  },
  async removeProductFromCart(req, res) {   //remove product id from the user's cart
    try {
      const cartForUser = await db.cart.findOne({ userId: req.userId });
      if(!cartForUser) {
        return res.send({error: {message: "Cart is empty"}});
      }
      let productId = req.body.productId;
      if(!productId) {
        return res.send({error: {message: "product ID is missing"}});
      }
      if(!cartForUser.cart)
        cartForUser.cart = []
      cartForUser.cart = cartForUser.cart.filter(productId => (productId!==productId));

      await db.cart.updateOne(
        { userId: req.userId },
        { $set: { ...cartForUser } }
      );
      res.send({success: {message: "Successfully removed from cart"}});
    }
    catch(e) {
      console.log("Error in removing product from cart: ", e);
      res.send({error: {message: "Operation Failed"}});
    }
  },
  async empty(req, res) {
    try {
      const cartForUser = await db.cart.findOne({ userId: req.userId });
      if(!cartForUser) {
        return res.send({error: {message: "Invalid"}});
      }
      cartForUser.cart = null;
      await db.cart.updateOne(
        { userId: req.userId },
        { $set: { ...cartForUser } }
      );
      res.send({success: {message: "Cart emptied"}});
    }
    catch(e) {
      console.log("Error in removing product from cart: ", e);
      res.send({error: {message: "Operation Failed"}});
    }
  }
};

module.exports = service;
