const router = require("express").Router();

const shopController = require("../controllers/shop");

// URL = /shop
router.post("/cart-user", shopController.getCart);
router.post("/cart", shopController.postCart);
router.delete("/cart-product-delete", shopController.deleteCart);
router.post("/cart-get-edit", shopController.getEditCart);
router.post("/cart-edit", shopController.postEditCart);
router.post("/create-order", shopController.postOrder);
router.post("/order-get-by-user", shopController.getOrdersByUser);

module.exports = router;
