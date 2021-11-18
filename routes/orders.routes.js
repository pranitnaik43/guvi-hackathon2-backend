const router = require("express").Router();

const service = require("../services/orders.services");

router.get("/", service.getAllOrders)
router.get("/:id", service.getOrderByID);
router.post("/", service.createOrder);
router.put("/:id", service.updateOrder);

module.exports = router;
