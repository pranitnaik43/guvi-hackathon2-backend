const express = require("express");
const cors = require("cors");
const axios = require('axios');
require("dotenv").config();

// Mongo
const mongo = require("./mongo");

// Routes
const productRoutes = require("./routes/product.routes");
const cartRoutes = require("./routes/cart.routes");
const authRoutes = require("./routes/auth.routes");
const categoryRoutes = require("./routes/category.routes");


const authService = require("./services/auth.services");

const app = express();

async function load() {
  try {
    await mongo.connect();

    app.use(express.json());    //body params -> json
    app.use(cors());    // allow Cross-Origin Resource sharing

    app.use("/auth", authRoutes);

    app.use(authService.validateAccessToken);
    // app.use((req,res) => {
    //   console.log(req.url);
    //   console.log(res);
    // });

    app.use("/cart", cartRoutes);
    app.use("/products", productRoutes);
    app.use("/categories", categoryRoutes);

    app.listen(process.env.PORT, () =>
      console.log(`Server running at port ${process.env.PORT}`)
    );
  } catch (err) {
    console.log(err);
  }
}

load();





async function populateDB() {
  try {
  await mongo.connect();
  var data = JSON.stringify({
    "token":"rQL40mpcvdw_7HCVhbX-2w",
    "data":{
      "name": "stringCharacters|3",
      "price": "numberFloat|200,10000|2",
      "_repeat": 10
    }});

  var config = {
    method: 'post',
    url: 'https://app.fakejson.com/q',
    headers: { 
      'content-type': 'application/json'
    },
    data : data
  };

  axios(config)
  .then(function (response) {
    console.log(JSON.stringify(response.data));
    response.data.forEach(product => {
      mongo.products.insertOne({name: "Product_"+product.name, price: product.price, category: null});
    });
    // mongo.products.insertMany(response.data);
  })
  .catch(function (error) {
    console.log(error);
  });

  for(var i=1; i<6; i++) {
    mongo.categories.insertOne({name: "Category_"+i});
  }

  var a = await mongo.products.find().toArray();
  console.log("products: ", a);

  } catch (err) {
    console.log("Server facing issues");
    console.log(err);
  }
}
// populateDB();


