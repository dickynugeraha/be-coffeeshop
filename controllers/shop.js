const Product = require("../models/product");
const Order = require("../models/order");
const Cart = require("../models/cart");
const { Op } = require("sequelize");

exports.getCart = async (req, res) => {
  const { userId } = req.body;

  console.log(userId);

  let productsCart = [];

  const singleCart = await Cart.findOne({ where: { userId: userId } });

  if (!singleCart) {
    return res.status(200).json({
      message: "Fetch successfully, no products in cart",
      products: productsCart,
    });
  }

  try {
    const cartId = singleCart.id;

    const cartProduct = await Cart.findOne({
      where: { id: cartId },
      include: {
        model: Product,
      },
    });

    const products = cartProduct.products;

    for (const key in products) {
      const newProduct = {
        title: products[key].title,
        price: products[key].price,
        type: products[key].type,
        imageUrl: products[key].imageUrl,
        quantity: products[key].cartItem.quantity,
        pricePerItem: products[key].cartItem.pricePerItem,
        description: products[key].cartItem.description,
        cartId: products[key].cartItem.cartId,
        productId: products[key].cartItem.productId,
      };

      productsCart.push(newProduct);
    }

    res.status(200).json({
      products: productsCart,
    });
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
};

exports.postCart = async (req, res) => {
  const { userId, productId, description, price, quantity } = req.body;

  let productItem = await Product.findByPk(productId);

  let cartField = await Cart.findOne({ where: { userId: userId } }),
    newPrice = price * quantity,
    newQuantity = quantity;

  try {
    if (cartField === null) {
      cartField = await Cart.create({ userId: userId });
    } else {
      const productCartFetch = await Cart.findOne({
        include: [
          {
            model: Product,
            through: {
              where: { cartId: cartField.id, productId: productId },
            },
          },
        ],
      });

      try {
        const cartItemProduct = productCartFetch.products[0].cartItem;

        newQuantity = cartItemProduct.quantity + quantity;
        newPrice = cartItemProduct.pricePerItem + price * quantity;
      } catch (error) {
        console.log(error);
      }
    }
    await cartField.addProduct(productItem, {
      through: {
        quantity: newQuantity,
        pricePerItem: newPrice,
        description: description,
      },
    });

    res.status(201).json({
      message: "Succesfully for add or replace existing cart!",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

exports.deleteCart = async (req, res) => {
  const { cartId, productId } = req.body;

  try {
    const cartFetch = await Cart.findByPk(cartId);
    const fetchProductsByCart = await cartFetch.getProducts({
      where: { id: productId },
    });

    const singleItem = fetchProductsByCart[0];

    await singleItem.cartItem.destroy();

    res.status(200).json({
      message: "Product item was deleted!",
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};

exports.getEditCart = async (req, res) => {
  const { cartId, productId } = req.body;

  try {
    const fetchCart = await Cart.findOne({
      include: [
        {
          model: Product,
          through: {
            where: { cartId: cartId, productId: productId },
          },
        },
      ],
    });

    const dataFetch = fetchCart.products[0];
    const dataCart = {
      cartId: dataFetch.cartItem.cartId,
      productId: dataFetch.cartItem.productId,
      quantity: dataFetch.cartItem.quantity,
      description: dataFetch.cartItem.description,
      pricePerItem: dataFetch.cartItem.pricePerItem,
      price: dataFetch.price,
    };

    res.status(200).json({
      message: "Success for fetch one cart product",
      dataCart: dataCart,
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};

exports.postEditCart = async (req, res) => {
  const { cartId, productId, quantity, description, pricePerItem } = req.body;

  const cart = await Cart.findByPk(cartId);
  const product = await Product.findByPk(productId);

  try {
    await cart.addProduct(product, {
      through: {
        quantity: quantity,
        description: description,
        pricePerItem: pricePerItem,
      },
    });
    res.status(200).json({
      message: "Successfully edit cart",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

exports.postOrder = async (req, res) => {
  const { userId, eat_by, table_number, payment_method } = req.body;

  try {
    const cart = await Cart.findOne({ where: { userId: userId } });
    const products = await cart.getProducts();
    const createOrder = await Order.create({
      status: "antrean",
      userId: userId,
      eat_by: eat_by,
      table_number: table_number,
      payment_method: payment_method,
    });
    await createOrder.addProducts(
      products.map((product) => {
        product.orderItem = {
          quantity: product.cartItem.quantity,
          description: product.cartItem.description,
          pricePerItem: product.cartItem.pricePerItem,
        };
        return product;
      })
    );

    if (cart) {
      await cart.destroy();
    }

    res.status(201).json({
      message: "Complete for order product",
    });
  } catch (error) {
    res.status(300).json({
      message: error.message,
    });
  }
};

exports.getOrdersByUser = async (req, res) => {
  const { userId } = req.body;

  try {
    const orderProducts = await Order.findAll({
      where: {
        userId: userId,
        [Op.or]: [
          { status: "antrean" },
          { status: "process" },
          { status: "delivered" },
          { status: "verify_payment" },
        ],
      },
      include: Product,
      order: [["dateOrder", "DESC"]],
    });

    const orders = [];
    for (const key in orderProducts) {
      let dataProdutcs = [];
      const dataOrder = {
        orderId: orderProducts[key].id,
        status: orderProducts[key].status,
        dateOrder: orderProducts[key].dateOrder,
        eat_by: orderProducts[key].eat_by,
        table_number: orderProducts[key].table_number,
        products: dataProdutcs,
      };

      const productsInOrder = orderProducts[key].products;

      for (const key in productsInOrder) {
        const singleProduct = {
          title: productsInOrder[key].title,
          type: productsInOrder[key].type,
          price: productsInOrder[key].price,
          quantity: productsInOrder[key].orderItem.quantity,
          description: productsInOrder[key].orderItem.description,
          pricePerItem: productsInOrder[key].orderItem.pricePerItem,
        };
        dataProdutcs.push(singleProduct);
      }
      orders.push(dataOrder);
    }

    res.status(200).json({
      message: "Fetch orders successfully",
      orders: orders,
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};
