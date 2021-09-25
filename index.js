const express = require("express");
const cors = require("cors");
const axios = require('axios');
require("dotenv").config();

// Mongo
const mongo = require("./mongo");

// Routes
const productRoutes = require("./routes/product.routes");

const app = express();

async function load() {
  try {
    await mongo.connect();

    app.use(express.json());    //body params -> json
    app.use(cors());    // allow Cross-Origin Resource sharing

    app.use("/products", productRoutes);

    app.listen(process.env.PORT, () =>
      console.log(`Server running at port ${process.env.PORT}`)
    );
  } catch (err) {
    console.log(err);
  }
}

load();





// async function populateDB() {
//   try {
//   await mongo.connect();
//   var data = JSON.stringify({
//     "token":"rQL40mpcvdw_7HCVhbX-2w",
//     "data":{
//       "name": "stringCharacters|5",
//       "price": "numberFloat|200,10000|2",
//       "_repeat": 10
//     }});

//   var config = {
//     method: 'post',
//     url: 'https://app.fakejson.com/q',
//     headers: { 
//       'content-type': 'application/json'
//     },
//     data : data
//   };

//   axios(config)
//   .then(function (response) {
//     console.log(JSON.stringify(response.data));
//     mongo.products.insertMany(response.data);
//   })
//   .catch(function (error) {
//     console.log(error);
//   });

//   var a = await mongo.products.find().toArray();
//   console.log("products: ", a);

//   } catch (err) {
//     console.log("Server facing issues");
//     console.log(err);
//   }
// }
// //images https://place-hold.it/300x300/666
// populateDB();


