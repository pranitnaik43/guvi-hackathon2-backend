const router = require("express").Router();

const service = require("../services/product.services");

router.get("/", service.find);
router.get("/:id", service.findById);
router.post("/", service.insert);
router.put("/:id", service.updateById);
router.delete("/:id", service.deleteById);

module.exports = router;
