require("dotenv").config();
const express = require("express");
const { createClient } = require('@supabase/supabase-js'); // Import Supabase
const cors = require("cors");
const moment = require("moment");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors());

// 🔹 Konfigurasi Supabase
const supabaseUrl = 'https://vtlkagbqvvopaiaqstft.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ0bGthZ2JxdnZvcGFpYXFzdGZ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU5MTg1MzQsImV4cCI6MjA2MTQ5NDUzNH0.sxiTlDmZz-RUC71PAjSGRR8gy_AjjEAY7x5zoRvLzlw';
const supabase = createClient('https://vtlkagbqvvopaiaqstft.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ0bGthZ2JxdnZvcGFpYXFzdGZ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU5MTg1MzQsImV4cCI6MjA2MTQ5NDUzNH0.sxiTlDmZz-RUC71PAjSGRR8gy_AjjEAY7x5zoRvLzlw');

console.log("📌 Supabase Config:", { supabaseUrl, supabaseKey });

// 🔹 Fungsi koneksi ke Supabase
async function saveScore(nama_pemain, menu, skor, waktu) {
  const { data, error } = await supabase
      .from('nilai')
      .insert([{ nama_pemain, menu, skor, waktu }]);

  if (error) {
      console.error("❌ Gagal menyimpan skor:", error.message);
      throw new Error("Gagal menyimpan skor ke database.");
  }
  console.log("✅ Skor berhasil disimpan:", data);
}

// 🔹 Endpoint untuk submit skor
app.post("/submit-score", async (req, res) => {
  try {
    const { nama_pemain, menu, skor, waktu } = req.body;

    if (!nama_pemain || !menu || skor === undefined || !waktu) {
      return res.status(400).json({ error: "Data tidak lengkap!" });
    }

    const waktuFormatted = moment(waktu).format("YYYY-MM-DD HH:mm:ss");

    const { data, error } = await supabase
      .from('nilai') // Ganti dengan nama tabel Supabase kamu
      .insert([
        { nama_pemain, menu, skor, waktu: waktuFormatted }
      ]);

    if (error) {
      throw error;
    }

    res.json({
      message: "✅ Skor berhasil disimpan!",
      data: { nama_pemain, menu, skor, waktuFormatted },
    });
  } catch (error) {
    console.error("❌ Gagal menyimpan skor:", error);
    res.status(500).json({ error: "Gagal menyimpan skor ke database." });
  }
});

// 🔹 Endpoint untuk get leaderboard
app.get("/get-leaderboard", async (req, res) => {
  const menu = req.query.menu;

  if (!menu) {
    return res.status(400).json({ error: "Menu tidak valid! Kirimkan parameter menu." });
  }

  try {
    const { data, error } = await supabase
      .from('nilai')
      .select('nama_pemain, skor')
      .eq('menu', menu)
      .order('skor', { ascending: false })
      .limit(5);

    if (error) {
      throw error;
    }

    res.json(data);
  } catch (error) {
    console.error("❌ Error mengambil leaderboard:", error);
    res.status(500).json({ error: "Terjadi kesalahan server." });
  }
});

// 🔹 Endpoint test
app.get("/api/test", (req, res) => {
  res.json({ message: "✅ Backend aktif dan merespon dengan baik!" });
});

// 🔹 Endpoint cek sederhana
app.get("/cek", (req, res) => {
  res.send("✅ Backend Space Math aktif!");
});

// 🔹 Start Server
function startServer() {
  app.listen(PORT, () => {
    console.log(`🚀 Server berjalan di http://localhost:${PORT}`);
  });
}

startServer();
