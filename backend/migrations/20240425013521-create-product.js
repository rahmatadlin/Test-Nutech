"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Products", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
        onDelete: "cascade",
        onUpdate: "cascade",
      },
      name: {
        type: Sequelize.STRING,
      },
      hargaBeli: {
        type: Sequelize.INTEGER,
      },
      hargaJual: {
        type: Sequelize.INTEGER,
      },
      stock: {
        type: Sequelize.INTEGER,
      },
      kategori: {
        type: Sequelize.STRING,
      },
      image: {
        type: Sequelize.STRING,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Products");
  },
};
