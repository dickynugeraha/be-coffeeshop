const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.postSignUp = async (req, res) => {
  const { data } = req.body;
  const { name, phone, password } = data;

  try {
    const userByEmail = await User.findAll({ where: { phone: phone } });
    if (userByEmail.length !== 0) {
      return res.status(401).json({
        message: "Phone number has been used",
        name: null,
        phone: null,
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = await User.create({
      name: name,
      phone: phone,
      password: hashedPassword,
    });

    const token = jwt.sign(
      { phone: newUser.phone, userId: newUser.id },
      "tokensupersecret",
      { expiresIn: "3h" }
    );

    res.status(201).json({
      message: "User successfully created",
      expiresIn: "10800",
      userId: newUser.id,
      name: newUser.name,
      phone: newUser.phone,
      isAdmin: newUser.isAdmin,
      token: token,
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};

exports.postSignIn = async (req, res) => {
  const { data } = req.body;
  const { phone, password } = data;

  let user;
  try {
    user = await User.findOne({ where: { phone: phone } });

    if (!user) {
      return res.status(401).json({
        message: "User not available",
        name: null,
        phone: null,
      });
    }

    const doMatchPassword = await bcrypt.compare(password, user.password);
    if (!doMatchPassword) {
      return res.status(401).json({
        message: "Invalid password",
        name: user.name,
        phone: user.phone,
        password: false,
      });
    }

    const token = jwt.sign(
      { phone: user.phone, userId: user.id },
      "tokensupersecret",
      { expiresIn: "3h" }
    );

    res.status(200).json({
      message: "User available",
      expiresIn: "10800",
      userId: user.id,
      name: user.name,
      phone: user.phone,
      token: token,
      isAdmin: user.isAdmin,
      password: true,
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};

exports.updatePassword = async (req, res) => {
  const { phone, newPassword } = req.body;

  try {
    const userExist = await User.findOne({ where: { phone: phone } });

    console.log(userExist);

    if (!userExist) {
      return res.status(401).json({
        message: "Phone number undefined!",
      });
    }

    const hashNewPassword = await bcrypt.hash(newPassword, 12);

    const singleUser = await User.findByPk(userExist.id);

    singleUser.set({
      password: hashNewPassword,
    });

    await singleUser.save();

    res.status(200).json({
      message: "Successfully change password",
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};
