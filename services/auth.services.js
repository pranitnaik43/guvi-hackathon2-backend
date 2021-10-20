const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Joi = require("joi");

const db = require("../mongo");

const regBody = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(3).max(12).required(),
});

const signBody = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(3).max(12).required(),
});

const service = {
  findByEmail(email) {
    return db.users.findOne({ email });
  },
  createUser(data) {
    return db.users.insertOne(data);
  },
  async signUp(req, res) {
    const body = req.body;
    console.log("requested");
    // Validate Request Body
    const { error } = await regBody.validate(req.body);
    if (error) return res.status(400).send({ message: error.details[0].message });
    //status 400 - The server cannot or will not process the request due to an apparent client error

    // Check User Already Exists
    const data = await this.findByEmail(body.email);
    if (data) return res.status(409).send({ message: "Email already exists" });

    // Encrypt Password
    const salt = await bcrypt.genSalt(10);
    body.password = await bcrypt.hash(body.password, salt);

    // Insert User to DB
    let userCreated = await this.createUser(body);
    console.log(userCreated);

    res.status(200).send({ message: "Signup Done" });
  },
  async signIn(req, res) {
    const body = req.body;

    // Validate Request Body
    const { error } = await signBody.validate(req.body);
    if (error) return res.status(400).send({ message: error.details[0].message });

    // Check User Already Exists
    const data = await this.findByEmail(body.email);
    if (!data)
      return res.status(409).send({ message: "User doesn't exist. Please signup" });

    // Check Password
    const valid = await bcrypt.compare(req.body.password, data.password);
    if (!valid) return res.status(401).send({ message: "User credentials doesn't match" });

    // Generate Token
    const token = await jwt.sign({ _id: data._id }, process.env.AUTH_SECRET);

    res.status(200).send({ accessToken: token, userId: data._id, isAdmin: data.isAdmin });
  },
  async validateToken(req, res, next) {
    try {
      const token = req.headers["access-token"];
      if (token) {
        req.user = await jwt.verify(token, process.env.AUTH_SECRET);
        next();
      } else {
        res.status(403).send({ message: "Access Denied" });
      }
    } catch (err) {
      res.status(403).send({ message: "Access Denied" });
    }
  },
};

module.exports = service;
