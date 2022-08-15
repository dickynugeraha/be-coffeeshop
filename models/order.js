const { DataTypes } = require("sequelize");
const sequelize = require("../util/database");

const Order = sequelize.define(
  "order",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true,
    },
    status: {
      type: DataTypes.STRING(16),
    },
    eat_by: {
      type: DataTypes.STRING(10),
      allowNull: false,
    },
    table_number: {
      type: DataTypes.STRING(4),
      defaultValue: "A01",
    },
    payment_method: {
      type: DataTypes.STRING(12),
      allowNull: false,
    },
    dateOrder: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    timestamps: false,
  }
);

module.exports = Order;
