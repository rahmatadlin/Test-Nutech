const axios = require("axios");
const { hashPassword, comparePassword } = require("../helpers/bcrypt");
const { createToken } = require("../helpers/jwt");
const { User, Product } = require("../models");
const validator = require("validator");
const moment = require("moment");
const { Op, Sequelize } = require("sequelize");
const ExcelJS = require("exceljs");
// Jangan lupa error handler sesuaikan dengan api docs

class Controller {
  static async login(req, res, next) {
    try {
      const { email, password } = req.body;

      // Validasi untuk email and password are required
      if (!email && !password) {
        throw { name: "LoginError" };
      }

      // Validasi apakah email kosong atau tidak
      if (!email) {
        throw { name: "EmptyEmail" };
      }
      // Validasi email format dengan package validator
      if (!validator.isEmail(email)) {
        throw { name: "EmailFormat" };
      }

      // Validasi apakah password kosong atau tidak
      if (!password) {
        throw { name: "EmptyPassword" };
      }

      const user = await User.findOne({
        where: { email: email },
      });

      // Validasi apakah email/password salah
      if (!user) {
        throw { name: "WrongEmailPassword" };
      }

      if (!comparePassword(password, user.password)) {
        throw { name: "WrongEmailPassword" };
      }

      const payload = {
        id: user.id,
        email: user.email,
      };

      const access_token = createToken(payload);

      res.status(200).json({ access_token });
    } catch (err) {
      console.log(err);
      next(err);
    }
  }

  static async register(req, res, next) {
    try {
      const { email, password } = req.body;

      // Validasi agar email and password are required
      if (!email && !password) {
        throw { name: "LoginError" };
      }

      // Cek dulu apakah email sudah pernah exist atau belum
      const existingUser = await User.findOne({ where: { email } });

      if (existingUser) {
        throw { name: "ExistedEmail" };
      }

      // Validasi email kosong
      if (!email) {
        throw { name: "EmptyEmail" };
      }

      // Validasi email format pakai package validator
      if (!validator.isEmail(email)) {
        throw { name: "EmailFormat" };
      }

      // Validasi passwor kosong
      if (!password) {
        throw { name: "EmptyPassword" };
      }

      // Hash the password before storing it
      const hashedPassword = await hashPassword(password);

      const user = await User.create({
        email,
        password: hashedPassword,
      });

      res.status(201).json(user);
    } catch (err) {
      next(err);
    }
  }

  static async postProduct(req, res, next) {
    const { name, hargaBeli, stock, kategori } = req.body;
    const file = req.file;

    try {
      // Validate inputs
      if (!name || !hargaBeli || !stock || !kategori || !file) {
        throw { name: "IncompleteInput" };
      }

      // Check if the product name already exists
      const existingProduct = await Product.findOne({ where: { name } });
      if (existingProduct) {
        throw { name: "ProductExists" };
      }

      // Validate image format and size
      const allowedFormats = ["image/jpeg", "image/png"];
      if (!allowedFormats.includes(file.mimetype)) {
        throw { name: "InvalidImageFormat" };
      }
      if (file.size > 100 * 1024) {
        throw { name: "ImageSizeExceeded" };
      }

      // Upload image and create the product
      const dateCreated = moment().format("YYYY-MM-DD hh:mm:ss");
      const imagePath = `/uploads/${file.filename}`;
      const product = await Product.create({
        name,
        hargaBeli,
        hargaJual: hargaBeli * 1.3,
        stock,
        kategori,
        image: imagePath,
        createdAt: dateCreated,
        updatedAt: dateCreated,
      });

      res.status(201).json(product);
    } catch (error) {
      next(error);
    }
  }

  static async getProducts(req, res, next) {
    try {
      const { page = 1, limit = 10, search, category, sort } = req.query;
  
      const whereCondition = {};
      if (search) {
        whereCondition.name = { [Op.iLike]: `%${search}%` };
      }
      if (category) {
        whereCondition.kategori = category;
      }
  
      let order = [];
      if (sort === 'created_asc') {
        order.push(['createdAt', 'ASC']);
      } else if (sort === 'created_desc') {
        order.push(['createdAt', 'DESC']);
      }
  
      const { count, rows } = await Product.findAndCountAll({
        where: whereCondition,
        limit: limit,
        offset: (page - 1) * limit,
        order: order, // Menambahkan pengaturan urutan
      });
  
      res.status(200).json({ total: count, products: rows });
    } catch (error) {
      next(error);
    }
  }

  static async updateProduct(req, res, next) {
    const { id } = req.params;
    const { name, hargaBeli, stock, kategori } = req.body;
    const file = req.file;

    try {
      // Validasi input
      if (!name || !hargaBeli || !stock || !kategori) {
        throw { name: "IncompleteInput" };
      }

      // Periksa apakah produk ada
      const product = await Product.findByPk(id);
      if (!product) {
        throw { name: "ProductNotFound" };
      }

      // Update informasi produk
      product.name = name;
      product.hargaBeli = hargaBeli;
      product.hargaJual = hargaBeli * 1.3;
      product.stock = stock;
      product.kategori = kategori;

      // Jika ada file gambar baru, validasi dan unggah gambar
      if (file) {
        const allowedFormats = ["image/jpeg", "image/png"];
        if (!allowedFormats.includes(file.mimetype)) {
          throw { name: "InvalidImageFormat" };
        }
        if (file.size > 100 * 1024) {
          throw { name: "ImageSizeExceeded" };
        }
        const imagePath = `/uploads/${file.filename}`;
        product.image = imagePath;
      }

      await product.save();

      res.status(200).json(product);
    } catch (error) {
      next(error);
    }
  }

  static async deleteProduct(req, res, next) {
    try {
      const { id } = req.params;

      const product = await Product.findByPk(id);
      if (!product) {
        throw { name: "ProductNotFound" };
      }

      // Confirm delete action here

      await product.destroy();

      res.status(200).json({ message: "Product deleted successfully" });
    } catch (error) {
      next(error);
    }
  }

  static async exportProductsToExcel(req, res, next) {
    try {
      const { search, category } = req.query;

      // Build query conditions based on search and category
      const whereCondition = {};
      if (search) {
        whereCondition.name = { [Op.iLike]: `%${search}%` };
      }
      if (category) {
        whereCondition.kategori = category;
      }

      // Fetch products from the database based on query conditions
      const products = await Product.findAll({
        where: whereCondition,
      });

      // Create a new workbook
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Products");

      // Add headers to the worksheet
      worksheet.addRow([
        "Name",
        "Harga Beli",
        "Harga Jual",
        "Stock",
        "Kategori",
        "Image",
      ]);

      // Add products data to the worksheet
      products.forEach((product) => {
        worksheet.addRow([
          product.name,
          product.hargaBeli,
          product.hargaJual,
          product.stock,
          product.kategori,
          product.image,
        ]);
      });

      // Set response headers for Excel file
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=products.xlsx"
      );

      // Write the workbook data to response
      await workbook.xlsx.write(res);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = Controller;
