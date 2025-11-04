const User = require("../models/User");
const bcrypt = require("bcryptjs");

// POST /api/users
exports.createUser = async (req, res) => {
  const { name, username, email, password, role } = req.body;
  try {
    const exist = await User.findOne({ $or: [{ username }, { email }] });
    if (exist) return res.status(400).json({ status: "failed", message: "Username atau email sudah digunakan" });

    const hashed = await bcrypt.hash(password, 10);
    const user = new User({ name, username, email, password: hashed, role });
    await user.save();

    res.json({ status: "success", message: "Pengguna berhasil ditambahkan", data: user });
  } catch (err) {
    res.status(500).json({ status: "failed", message: err.message });
  }
};

// PUT /api/users/:id
exports.updateUser = async (req, res) => {
  const { name, username, password, role } = req.body;
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ status: "failed", message: "Pengguna tidak ditemukan" });

    user.name = name || user.name;
    user.username = username || user.username;
    if (password) user.password = await bcrypt.hash(password, 10);
    user.role = role || user.role;

    await user.save();
    res.json({ status: "success", message: "Data pengguna berhasil diubah", data: user });
  } catch (err) {
    res.status(500).json({ status: "failed", message: err.message });
  }
};

// GET /api/users/:id
exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ status: "failed", message: "Pengguna tidak ditemukan" });
    res.json({ status: "success", data: user });
  } catch (err) {
    res.status(500).json({ status: "failed", message: err.message });
  }
};
