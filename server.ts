import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// API route for semantic answer evaluation
app.post('/api/evaluate-answer', async (req, res) => {
  try {
    const { question, referenceAnswer, studentAnswer, keywords, explanation } = req.body;
    if (!studentAnswer || !question) {
      return res.status(400).json({ error: 'Data soal atau jawaban siswa tidak lengkap' });
    }

    const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
    if (!apiKey) {
      return res.json({
        fallback: true,
        message: 'GEMINI_API_KEY tidak terdeteksi, beralih ke semantic engine lokal'
      });
    }

    const ai = new GoogleGenAI({ apiKey });
    const prompt = `Anda adalah penilai kuis cerdas cermat IPS (Ilmu Pengetahuan Sosial) tingkat SMP/MTs.
Tugas Anda adalah menilai jawaban uraian/essay siswa secara SEMANTIK (berdasarkan KESAMAAN MAKNA / ESENSI KONSEP), BUKAN kesamaan kata perkata.

PEDOMAN UTAMA:
1. Yang penting jawaban siswa memiliki makna, konsep, pemahaman, atau gagasan yang selaras dengan pertanyaan dan kunci jawaban, MAKA HARUS DIANGGAP BENAR.
2. Siswa TIDAK HARUS menulis kalimat atau kata yang persis sama. Pemilihan sinonim, penyusunan kalimat yang berbeda, atau bahasa siswa sehari-hari tetap BENAR asalkan maknanya tepat.
3. Nilai SALAH HANYA JIKA:
   - Jawaban bertentangan dengan fakta ilmiah IPS.
   - Jawaban sama sekali tidak menyentuh topik yang ditanyakan atau ngawur.
   - Jawaban menolak menjawab atau kosong.

Data Soal:
- Pertanyaan: "${question}"
- Kunci Jawaban Acuan: "${referenceAnswer}"
- Konsep/Kata Kunci Terkait: "${(keywords || []).join(', ')}"
- Pembahasan IPS: "${explanation || ''}"

Jawaban Uraian Siswa:
"${studentAnswer}"

Kembalikan jawaban HANYA dalam format JSON valid tanpa tanda kutip markdown:
{
  "isCorrect": true/false,
  "confidence": 0.0 - 1.0,
  "semanticFeedback": "Ulasan singkat 1-2 kalimat mengapa jawaban ini memiliki makna yang selaras atau belum sesuai"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.2,
      }
    });

    const text = response.text || '';
    let parsed: any;
    try {
      parsed = JSON.parse(text);
    } catch {
      const match = text.match(/\{[\s\S]*\}/);
      if (match) {
        parsed = JSON.parse(match[0]);
      } else {
        throw new Error('Gagal mem-parsing respon JSON AI');
      }
    }

    return res.json({
      success: true,
      isCorrect: Boolean(parsed.isCorrect),
      semanticFeedback: parsed.semanticFeedback || 'Makna jawaban telah diverifikasi secara semantik.',
      confidence: parsed.confidence || 0.9,
      source: 'gemini-semantic'
    });
  } catch (err: any) {
    console.error('Error saat verifikasi semantik di server:', err);
    return res.json({
      fallback: true,
      error: err.message
    });
  }
});

// Mount Vite middleware in dev or serve static files in production
async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Clash of Champions Server berjalan di http://0.0.0.0:${PORT}`);
  });
}

startServer();
