'use strict';
const { Model, Sequelize } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Product extends Model {
    static associate(models) {
      // define association here
    }
  }
  Product.init({
    name: {
      type: DataTypes.STRING,
      unique: true, // Ensures name is unique
      allowNull: false,
    },
    hargaBeli: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        isNumeric: true, // Validates as a number
      },
    },
    hargaJual: {
      type: DataTypes.VIRTUAL, // Virtual field, not stored in the database
      get() {
        // Calculates selling price as 30% higher than the buying price
        const hargaBeli = this.getDataValue('hargaBeli');
        return hargaBeli * 1.3;
      },
    },
    stock: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        isNumeric: true, // Validates as a number
      },
    },
    kategori: DataTypes.STRING,
    image: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'Product', // Changed modelName to 'Product'
  });
  return Product;
};
