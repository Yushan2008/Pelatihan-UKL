const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();


// REGISTER USER
exports.register = async (req, res) => {
  const { name, username, email, password, role } = req.body;

  try {
    // Cek apakah username atau email sudah digunakan
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res.status(400).json({
        status: "gagal",
        message: "Username atau email sudah terdaftar"
      });
    }

    // Hash password sebelum disimpan
    const hashedPassword = await bcrypt.hash(password, 10);

    // Simpan user baru ke database
    const newUser = new User({
      name,
      username,
      email,
      password: hashedPassword,
      role
    });
    await newUser.save();

    res.status(201).json({
      status: "berhasil",
      message: "Registrasi berhasil",
      data: {
        id: newUser._id,
        name: newUser.name,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role
      }
    });
  } catch (err) {
    console.error("Error di register:", err.message);
    res.status(500).json({
      status: "gagal",
      message: "Terjadi kesalahan server",
      error: err.message
    });
  }
};


exports.login = async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user)
      return res.status(400).json({ status: "gagal", message: "Username tidak ditemukan" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ status: "gagal", message: "Password salah" });

    const token = jwt.sign(
      { user: { id: user.id, username: user.username, role: user.role } },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({ status: "berhasil", message: "Login berhasil", token });
  } catch (err) {
    res.status(500).json({ status: "gagal", message: err.message });
  }
};
