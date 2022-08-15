const Product = require("../models/product");
const Order = require("../models/order");
const User = require("../models/user");
const bcrypt = require("bcryptjs");
const path = require("path");
const fs = require("fs");
const { Op } = require("sequelize");
const baseUrl = require("../util/base-url");

// product
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.findAll();
    res.status(200).json({
      products: products,
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
      message: "Cannot fetch product",
    });
  }
};

exports.addProduct = async (req, res) => {
  const { title, price, type, description } = req.body;
  const nameImage = req.file.filename;

  const urlImage = `${baseUrl}/images/${nameImage}`;

  try {
    await Product.create({
      title: title,
      price: price,
      type: type,
      description: description,
      imageUrl: urlImage,
    });

    res.status(201).json({
      message: "Add product successfully!",
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};

exports.getDetailProduct = async (req, res) => {
  const prodId = req.params.prodId;

  const productFilter = await Product.findByPk(prodId);

  if (productFilter === null) {
    res.status(500).json({
      product: [],
      message: "Product not found",
    });
  } else {
    res.status(200).json({
      product: productFilter,
    });
  }
};

exports.getEditProduct = async (req, res) => {
  const { productId } = req.body;

  try {
    const product = await Product.findByPk(productId);

    res.status(200).json({
      product: product,
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};

exports.deleteProduct = async (req, res) => {
  const { productId } = req.body;

  try {
    await (await Product.findByPk(productId)).destroy();

    res.status(200).json({
      message: "Delete was successfully!",
    });
  } catch (err) {
    res.status(500).json({
      message: "Cannot delete product",
      error: err,
    });
  }
};

exports.updateProduct = async (req, res) => {
  const { id, title, price, type, description, isAvailable } = req.body;

  try {
    const singleProd = await Product.findByPk(id);
    let urlImage;

    if (!req.file) {
      urlImage = singleProd.imageUrl;
    } else {
      const nameImage = req.file.filename;
      urlImage = `${baseUrl}/images/${nameImage}`;
      clearImage(singleProd.imageUrl);
    }

    singleProd.set({
      title: title,
      price: price,
      description: description,
      type: type,
      isAvailable: isAvailable,
      imageUrl: urlImage,
    });

    await singleProd.save();

    res.status(200).json({
      message: "succeess",
    });
  } catch (err) {
    res.status(500).json({
      message: "Cannot updated data",
      error: err,
    });
  }
};

const clearImage = (filePath) => {
  filePath = path.join(__dirname, "..", filePath);
  fs.unlink(filePath, (err) => console.log(err));
};

// user
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      where: {
        isAdmin: false,
      },
    });

    let userList = [];
    for (const key in users) {
      const userObj = {
        id: users[key].id,
        name: users[key].name,
        phone: users[key].phone,
      };

      userList.push(userObj);
    }

    res.status(200).json({
      message: "Successfully for fetch all users",
      users: userList,
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};

exports.getEditUser = async (req, res) => {
  const { userId } = req.body;

  try {
    const singleUser = await User.findByPk(userId);

    res.status(200).json({
      message: "Successfully fetch user",
      user: {
        id: singleUser.id,
        name: singleUser.name,
        phone: singleUser.phone,
      },
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};

exports.updateUser = async (req, res) => {
  const { userId, name, newPassword } = req.body;
  try {
    const hashNewPassword = await bcrypt.hash(newPassword, 12);

    const singleUser = await User.findByPk(userId);

    singleUser.set({
      name: name,
      password: hashNewPassword,
    });

    await singleUser.save();

    res.status(201).json({
      message: "Successfully change password",
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};

exports.deleteUser = async (req, res) => {
  const { userId } = req.body;

  try {
    const singleUser = await User.findByPk(userId);
    singleUser.destroy();

    res.status(200).json({
      message: "Successfully delete user",
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};

// order
const helperOrder = (orders) => {
  let allOrder = [];

  for (const key in orders) {
    let arrProd = [];
    const products = orders[key].products;

    for (const keyProd in products) {
      const objProd = {
        title: products[keyProd].title,
        price: products[keyProd].price,
        quantity: products[keyProd].orderItem.quantity,
        pricePerItem: products[keyProd].orderItem.pricePerItem,
        description: products[keyProd].orderItem.description,
      };

      arrProd.push(objProd);
    }

    const summaryPrice = [];
    for (const keySum in products) {
      summaryPrice.push(products[keySum].orderItem.pricePerItem);
    }
    const sum = summaryPrice.reduce(
      (totalValue, currValue) => totalValue + currValue,
      0
    );

    const objUser = {
      name: orders[key].user.name,
      email: orders[key].user.email,
      userId: orders[key].userId,
      orderId: orders[key].id,
      status: orders[key].status,
      eat_by: orders[key].eat_by,
      table_number: orders[key].table_number,
      payment_method: orders[key].payment_method,
      date_order: orders[key].dateOrder,
      products: arrProd,
      allPrice: sum,
    };

    allOrder.push(objUser);
  }

  return allOrder;
};

exports.getFilterOrders = async (req, res) => {
  const { status } = req.params;
  let statusMerge, orderBy;

  if (status === "antrean") {
    statusMerge = {
      [Op.or]: [
        { status: "antrean" },
        { status: "process" },
        { status: "delivered" },
        { status: "verify_payment" },
      ],
    };
    orderBy = "DESC";
  } else {
    statusMerge = { status: status };
    orderBy = "ASC";
  }
  try {
    const orders = await Order.findAll({
      include: [
        {
          model: User,
        },
        {
          model: Product,
        },
      ],
      where: statusMerge,
      order: [["dateOrder", orderBy]],
    });

    let allOrder = helperOrder(orders);

    if (status === "success") {
      allOrder = [];
    }

    res.status(200).json({
      message: "Successfully for fetch all order",
      orders: allOrder,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

exports.getOrdersByDate = async (req, res) => {
  const { start, end } = req.body;

  try {
    const orderFilter = await Order.findAll({
      include: [
        {
          model: User,
        },
        {
          model: Product,
        },
      ],
      where: {
        status: "success",
        dateOrder: {
          [Op.and]: {
            [Op.gte]: Date.parse(start),
            [Op.lte]: Date.parse(end),
          },
        },
      },
      order: [["dateOrder", "ASC"]],
    });

    const dataOrderFilter = helperOrder(orderFilter);

    res.status(200).json({
      orders: dataOrderFilter,
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};

exports.getDetailOrder = async (req, res) => {
  const { orderId } = req.body;

  try {
    const order = await Order.findOne({
      where: {
        id: orderId,
      },
      include: Product,
    });

    res.status(200).json({
      message: "Successfully fetch get detail order!",
      order: order.products,
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};

exports.postGetEditOrder = async (req, res) => {
  const { orderId } = req.body;

  try {
    const singleOrder = await Order.findAll({
      include: Product,
      where: { id: orderId },
    });
    res.status(200).json({
      message: "Successfully for fetch all order",
      orders: singleOrder[0],
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

exports.editAntreanOrder = async (req, res) => {
  const { productId, orderId, quantity, pricePerItem, description } = req.body;

  try {
    const order = await Order.findByPk(orderId);
    const product = await Product.findByPk(productId);

    await order.addProduct(product, {
      through: {
        quantity: quantity,
        pricePerItem: pricePerItem,
        description: description,
      },
    });

    res.status(200).json({
      message: "Successfully for edit order product",
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};

exports.editStatusOrder = async (req, res) => {
  const { orderId, status } = req.body;

  try {
    const order = await Order.findByPk(orderId);

    order.set({
      status: status,
    });
    await order.save();

    res.status(200).json({
      message: "Successfully for edit status order",
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};
