const router = require("express").Router();

const service = require("../services/cart.services");

router.get("/", service.find);
router.post("/insertProduct", (req, res) => service.addProductToCart(req, res));
router.delete("/removeProduct", (req, res) => service.removeProductFromCart(req, res));

module.exports = router;
