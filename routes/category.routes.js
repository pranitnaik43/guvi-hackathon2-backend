const router = require("express").Router();

const service = require("../services/category.services");
const authService = require("../services/auth.services");

router.get("/", service.findAll);
router.get("/:id", service.findById);

//admin routes
router.use(authService.isAdmin);
router.post("/", service.insert);
router.put("/:id", service.updateById);
router.delete("/:id", service.deleteById);

module.exports = router;
