const { MongoClient } = require("mongodb");

const client = new MongoClient(process.env.MONGODB_LOCAL_URL, { useNewUrlParser: true, useUnifiedTopology: false });

const mongo = {
  products: null,

  async connect() {
    await client.connect(); // Connecting to DB
    const db = client.db(process.env.MONGODB_NAME); // Selecting DB
    console.log("Mongo DB Connected");

    this.products = db.collection("products");
  },
  
  disconnect() {
    client.close();
  }
};

module.exports = mongo;
