const Joi = require("joi");
const { ObjectId } = require("mongodb");
const axios = require("axios");
const shortid = require("shortid");

const db = require("../mongo");

const orderBody = Joi.object({
  productDetails: Joi.array().items({
                      _id: Joi.string(),
                      category: Joi.string().allow(null, '').optional(),
                      name: Joi.string().required(),
                      pricePerUnit: Joi.number().required(),
                      price: Joi.number().required(),
                      quantity: Joi.number().integer().required(),
                    })
});

const updateOrderAllowedParams = Joi.object({
  productDetails: Joi.object().optional(),
  orderDetails: Joi.object().optional(),
  paymentStatus: Joi.string().allow(null, '').optional(),
  razorpayResponse: Joi.object().optional()
})

const orderPaymentStatus = {
  PENDING: "Pending",
  PAID: "Paid",
  FAILED: "Failed",
}

const service = {
  async getAllOrders(req, res) {
    try {
      let userId = req.userId;
      let orders = await db.orders.find({ userId }).toArray();
      res.send(orders);
    }
    catch(e) {
      console.log("Error in adding product to cart: ", e);
      res.send({error: {message: "Operation Failed"}});
    }
  },
  async getOrderByID(req, res) {
    try {
      let orderId = req.params.id;
      let orderDetails = await db.orders.findOne({ orderId });

      res.send(orderDetails);
    }
    catch(e) {
      console.log("Error in fetching order: ", e);
      res.send({error: {message: "Operation Failed"}});
    }
  },
  async createOrder(req, res) {
    try {
      // Validate Request Body
      const { error } = await orderBody.validate(req.body);
      if (error) return res.send({ error: { message: error.details[0].message }});

      let total = 0;
      let productDetails = req.body.productDetails;
      // console.log(productDetails);
      productDetails.forEach(element => {
        total += element.price;
      });
      // console.log(total);
      let response = await axios({
        url: "https://api.razorpay.com/v1/orders",
        method: "POST",
        headers: { 
          'content-type': 'application/json', 
          'Authorization': process.env.RAZORPAY_AUTHENTICATION_HEADER
        },
        data: {
          amount: total * 100,    //unit: paise
          currency: "INR",
          receipt: "Receipt#"+shortid.generate()
        }
      });

      // console.log(response);
      if(response && response.data){
        await db.orders.insertOne({ userId: req.userId, productDetails, orderId: response.data.id, orderDetails: response.data, paymentStatus: orderPaymentStatus.PENDING, timestamp: new Date() });
        return res.send(response.data);
      } 
      res.send({error: {message: "Error in creating order"}});
      

      // res.send({success: {message: "Successfully added to cart"}});
    }
    catch(e) {
      console.log("Error in adding product to cart: ", e);
      res.send({error: {message: "Operation Failed"}});
    }
  },
  async updateOrder(req, res) {
    try {
      let orderId = req.params.id;
      let order = await db.orders.findOne({ orderId });

      if(!order) {
        return res.send({ error: { message: "Order not found" }});
      }

      // Validate Request Body
      const { error } = await updateOrderAllowedParams.validate(req.body);
      if (error) return res.send({ error: { message: error.details[0].message }});

      order = {...order, ...req.body};
      // console.log("order", order);
      await db.orders.updateOne(
        { orderId },
        { $set: { ...order } }
      );
      res.send({ success: { message: "Order updated" }});

    }
    catch(e) {
      console.log("Error in updating order: ", e);
      res.send({error: {message: "Operation Failed"}});
    }
    
  }
};

module.exports = service;
