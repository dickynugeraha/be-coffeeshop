const router = require("express").Router();
const authController = require("../controllers/auth");

router.post("/signup", authController.postSignUp);
router.post("/signin", authController.postSignIn);
router.put("/account", authController.updatePassword);

module.exports = router;
