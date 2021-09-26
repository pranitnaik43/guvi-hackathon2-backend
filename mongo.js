const { MongoClient } = require("mongodb");

const client = new MongoClient(process.env.MONGODB_LOCAL_URL, { useNewUrlParser: true, useUnifiedTopology: false });

const mongo = {
  products: null,
  categories: null,
  users: null,

  async connect() {
    await client.connect(); // Connecting to DB
    const db = client.db(process.env.MONGODB_NAME); // Selecting DB
    console.log("Mongo DB Connected");

    this.products = db.collection("products");
    this.categories = db.collection("categories");
    this.users = db.collection("users");
  }
};

module.exports = mongo;
