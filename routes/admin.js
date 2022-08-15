const router = require("express").Router();

const adminController = require("../controllers/admin");

// development

// /admin (product)
router.post("/product", adminController.addProduct);
router.get("/products", adminController.getAllProducts);
router.get("/product/:prodId", adminController.getDetailProduct);
router.post("/product-edit", adminController.getEditProduct);
router.delete("/delete-product/", adminController.deleteProduct);
router.put("/update-product", adminController.updateProduct);

// /admin (users)
router.get("/users", adminController.getAllUsers);
router.post("/get-edit-user", adminController.getEditUser);
router.put("/update-user", adminController.updateUser);
router.delete("/delete-user", adminController.deleteUser);

// admin (order)
router.post("/get-orders-date", adminController.getOrdersByDate);
router.get("/get-filter-orders/:status", adminController.getFilterOrders);
router.post("/get-detail-order", adminController.getDetailOrder);
router.post("/get-edit-order", adminController.postGetEditOrder);
router.put("/edit-order", adminController.editAntreanOrder);
router.put("/edit-status-order", adminController.editStatusOrder);

module.exports = router;
