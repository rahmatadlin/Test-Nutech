const axios = require("axios");
const { hashPassword, comparePassword } = require("../helpers/bcrypt");
const { createToken } = require("../helpers/jwt");
const { User, Hero, Favourite } = require("../models");
const validator = require("validator");
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
}
