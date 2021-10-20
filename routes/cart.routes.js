const router = require("express").Router();

const service = require("../services/cart.services");

router.get("/", service.find);
router.post("/insertProduct", service.insert);
router.delete("/removeProduct", service.delete);

module.exports = router;
