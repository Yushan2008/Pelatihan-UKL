const Attendance = require("../models/Attendance");

// POST /api/attendance
exports.markAttendance = async (req, res) => {
  try {
    const { status } = req.body;
    const attendance = new Attendance({ user: req.user.id, status });
    await attendance.save();
    res.json({ status: "success", message: "Presensi berhasil disimpan", data: attendance });
  } catch (err) {
    res.status(500).json({ status: "failed", message: err.message });
  }
};

// GET /api/attendance/history/:user_id
exports.getHistory = async (req, res) => {
  try {
    const userId = req.params.user_id;

    // Validasi: pastikan userId tidak kosong
    if (!userId) {
      return res.status(400).json({
        status: "failed",
        message: "User ID tidak ditemukan di parameter"
      });
    }

    // Ambil semua data presensi berdasarkan ID user
    const records = await Attendance.find({ user: userId }).sort({ date: -1 });

    // Jika tidak ada data
    if (!records || records.length === 0) {
      return res.json({
        status: "success",
        data: []
      });
    }

    // Format hasil agar sesuai dengan dokumen PDF
    const formatted = records.map((record, index) => {
      const dateObj = new Date(record.date);
      return {
        attendance_id: index + 1,
        date: dateObj.toISOString().split("T")[0], // YYYY-MM-DD
        time: dateObj.toTimeString().split(" ")[0], // HH:MM:SS
        status: record.status
      };
    });

    // Kirim response
    res.status(200).json({
      status: "success",
      data: formatted
    });
  } catch (err) {
    console.error("Error getHistory:", err.message);
    res.status(500).json({
      status: "failed",
      message: "Terjadi kesalahan server",
      error: err.message
    });
  }
};


// GET /api/attendance/summary/:user_id
exports.getSummary = async (req, res) => {
  try {
    const all = await Attendance.find({ user: req.params.user_id });
    const summary = {
      total: all.length,
      hadir: all.filter(a => a.status === "hadir").length,
      izin: all.filter(a => a.status === "izin").length,
      alpha: all.filter(a => a.status === "alpha").length
    };
    res.json({ status: "success", data: summary });
  } catch (err) {
    res.status(500).json({ status: "failed", message: err.message });
  }
};

// POST /api/attendance/analysis
exports.analyzeAttendance = async (req, res) => {
  try {
    const { start_date, end_date } = req.body;
    const records = await Attendance.find({
      date: { $gte: new Date(start_date), $lte: new Date(end_date) }
    }).populate("user", "name role");

    const grouped = {};
    records.forEach(r => {
      if (!grouped[r.user.role]) grouped[r.user.role] = 0;
      grouped[r.user.role]++;
    });

    res.json({ status: "success", message: "Analisis berhasil", data: grouped });
  } catch (err) {
    res.status(500).json({ status: "failed", message: err.message });
  }
};
