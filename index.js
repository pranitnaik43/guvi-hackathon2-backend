require("dotenv").config();

const axios = require('axios');
require("dotenv").config();

// Mongo
const mongo = require("./mongo");

// client.db(process.env.MONGODB_NAME).insertOne();
async function populateDB() {
  try {
  await mongo.connect();
  var data = JSON.stringify({
    "token":"rQL40mpcvdw_7HCVhbX-2w",
    "data":{
      "name": "stringCharacters|5",
      "price": "numberFloat|200,10000|2",
      "_repeat": 3
    }});

  var config = {
    method: 'post',
    url: 'https://app.fakejson.com/q',
    headers: { 
      'content-type': 'application/json'
    },
    data : data
  };

  // var a = await mongo.tools.find().toArray();
  // console.log("tools: ", a);

  axios(config)
  .then(function (response) {
    console.log(JSON.stringify(response.data));
  })
  .catch(function (error) {
    console.log(error);
  });
  } catch (err) {
    console.log("Server facing issues");
    console.log(err);
  }
}
//images https://place-hold.it/300x300/666
populateDB();


