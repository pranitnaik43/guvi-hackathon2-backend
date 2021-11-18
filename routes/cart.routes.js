const router = require("express").Router();

const service = require("../services/cart.services");

router.get("/", service.find);
router.post("/addProduct", service.addProductToCart);
router.post("/removeProduct", service.removeProductFromCart);
router.delete("/", service.empty);

module.exports = router;
