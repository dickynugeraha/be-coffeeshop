const { Sequelize } = require("sequelize");

// const sequelize = new Sequelize("casper_and_luna", "root", "123QwE", {
//   dialect: "mysql",
//   host: "localhost",
// });
const sequelize = new Sequelize("railway", "root", "GOhdPwWsqCfjtH5JNKT2", {
  dialect: "mysql",
  host: "containers-us-west-82.railway.app",
  port: 5747,
});

sequelize
  .authenticate()
  .then(() => {
    console.log("Connection has been established successfully.");
  })
  .catch((err) => {
    console.log("Unable to connect to the database:", err);
  });

module.exports = sequelize;
