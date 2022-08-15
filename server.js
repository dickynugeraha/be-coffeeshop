// require
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const multer = require("multer");
const path = require("path");
const cors = require("cors");

const sequelize = require("./util/database");
const authRoute = require("./routes/auth");
const adminRoute = require("./routes/admin");
const shopRoute = require("./routes/shop");
const User = require("./models/user");
const Product = require("./models/product");
const Cart = require("./models/cart");
const CartItem = require("./models/cart-item");
const Order = require("./models/order");
const OrderItem = require("./models/order-item");

// development
app.use(cors());
app.use(bodyParser.json());

//access public path
app.use(express.static(__dirname + "/images"));

app.use(express.static(path.join(__dirname, "images")));
app.use("/images", express.static(path.join(__dirname, "images")));
app.use(express.static(path.resolve("./images")));
app.use("/images", express.static(path.resolve(__dirname + "/images")));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Controll-Allow-Methods",
    "PUT, GET, POST, PATCH, DELETE, OPTIONS"
  );
  res.setHeader(
    "Access-Controll-Allow-Headers",
    "application/json, Authorization"
  );
  next();
});

// configure uploading
const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "images"));
  },
  filename: (req, file, cb) => {
    cb(
      null,
      new Date().toISOString().split(":")[0] + "_" + file.originalname.trim()
    );
  },
});
const filterImage = (req, file, cb) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};
app.use(
  multer({ fileFilter: filterImage, storage: fileStorage }).single("image")
);

// Routes pages
app.use("/auth", authRoute);
app.use("/admin", adminRoute);
app.use("/shop", shopRoute);

app.use((error, req, res, next) => {
  const status = error.statusCode || 500;
  const message = error.message;
  res.status(status).json({ message: message });
});

// model relationship
User.hasOne(Cart);
Cart.belongsTo(User);

Cart.belongsToMany(Product, { through: CartItem });
Product.belongsToMany(Cart, { through: CartItem });

User.hasMany(Order);
Order.belongsTo(User);

Order.belongsToMany(Product, { through: OrderItem });
Product.belongsToMany(Order, { through: OrderItem });

sequelize
  // .sync({ force: true })
  .sync()
  .then(() => {
    app.listen(process.env.PORT || 3002);
  })
  .catch((err) => {
    console.log(err);
  });
