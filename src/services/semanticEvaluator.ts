/**
 * Semantic Evaluator Service for Clash of Champions : IPS Arena
 * 
 * Verifikasi jawaban essay/uraian berdasarkan KESELARASAN MAKNA & ESENSI KONSEP:
 * "Yang penting jawabannya maknanya sama itu sudah dianggap benar,
 *  tanpa harus kata dan kalimatnya sama persis."
 */

import { Question } from '../types';

export interface SemanticEvaluationResult {
  isCorrect: boolean;
  semanticFeedback: string;
  source: 'ai-semantic' | 'local-semantic';
  confidence?: number;
  matchedConcepts?: string[];
}

/**
 * Normalisasi teks bahasa Indonesia:
 * - Huruf kecil
 * - Hapus tanda baca
 * - Normalisasi spasi berlebih
 */
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Klaster semantik komprehensif untuk materi IPS Perubahan Iklim & Kehidupan Sosial
 * Memetakan berbagai kosakata, sinonim, kata sehari-hari siswa, dan istilah ilmiah ke konsep makna yang sama.
 */
const SEMANTIC_CONCEPT_CLUSTERS: Record<string, string[]> = {
  // Pemanasan & Suhu
  pemanasan: [
    'panas', 'suhu', 'temperatur', 'gerah', 'hangat', 'makin panas', 'peningkatan suhu',
    'kenaikan suhu', 'bumi panas', 'memanas', 'suhu naik', 'termal', 'iklim memanas'
  ],
  // Efek Rumah Kaca & Emisi
  rumah_kaca: [
    'rumah kaca', 'efek rumah kaca', 'gas rumah kaca', 'karbon', 'co2', 'metana', 'ch4',
    'emisi', 'asap', 'polusi', 'gas buang', 'asap pabrik', 'asap knalpot', 'asap motor',
    'asap mobil', 'asap kendaraan', 'karbon dioksida', 'pencemaran udara', 'terperangkap', 'panas tertahan'
  ],
  // Bahan Bakar Fosil
  fosil: [
    'fosil', 'batu bara', 'minyak', 'bensin', 'solar', 'minyak bumi', 'bbm', 'tambang',
    'pltu', 'pln', 'energi tak terbarukan', 'pembakaran'
  ],
  // Deforestasi & Hutan
  hutan: [
    'hutan', 'pohon', 'pepohonan', 'deforestasi', 'tebang', 'penebangan', 'gundul', 'pembalakan',
    'bakar hutan', 'kebakaran hutan', 'kayu', 'tanam pohon', 'reboisasi', 'penghijauan', 'flora'
  ],
  // Pencairan Es & Kutub
  es_mencair: [
    'es', 'mencair', 'leleh', 'meleleh', 'lumer', 'gletser', 'kutub', 'antartika', 'arktik',
    'gunung es', 'bongkahan es', 'salju'
  ],
  // Kenaikan Air Laut & Pesisir
  laut_naik: [
    'air laut', 'permukaan laut', 'naik', 'pesisir', 'pantai', 'tenggelam', 'terendam', 'banjir rob',
    'rob', 'abrasi', 'pulau tenggelam', 'garis pantai', 'intrusi', 'air asin', 'terkikis'
  ],
  // Pertanian & Ketahanan Pangan
  pertanian: [
    'tani', 'petani', 'panen', 'gagal panen', 'sawah', 'kebun', 'padi', 'beras', 'pangan',
    'kelangkaan pangan', 'krisis pangan', 'harga naik', 'kemarau', 'musim tidak menentu', 'paceklik', 'hama'
  ],
  // Bencana & Cuaca Ekstrem
  cuaca_ekstrem: [
    'ekstrem', 'badai', 'topan', 'siklon', 'banjir', 'kekeringan', 'kemarau panjang', 'hujan deras',
    'cuaca tidak menentu', 'perubahan pola cuaca', 'anomali'
  ],
  // Kesehatan & Penyakit
  kesehatan: [
    'penyakit', 'sakit', 'nyamuk', 'dbd', 'demam berdarah', 'malaria', 'diare', 'ispa', 'pernapasan',
    'vektor', 'kuman', 'bakteri', 'wabah', 'kesehatan'
  ],
  // Migrasi & Pengungsi Iklim
  migrasi: [
    'migrasi', 'pindah', 'mengungsi', 'pengungsi', 'relokasi', 'kehilangan rumah', 'ungsi',
    'pindah rumah', 'evakuasi', 'keluar daerah', 'tergusur', 'pengungsi iklim'
  ],
  // Terumbu Karang & Ekosistem Laut
  terumbu_karang: [
    'terumbu karang', 'karang', 'coral', 'bleaching', 'memutih', 'ikan', 'lautan', 'asam laut',
    'pengasaman', 'ekosistem laut', 'habitat ikan', 'nelayan', 'tangkapan ikan berkurang'
  ],
  // Energi Terbarukan & Solusi
  energi_bersih: [
    'terbarukan', 'ebt', 'energi bersih', 'ramah lingkungan', 'matahari', 'surya', 'panel surya',
    'angin', 'bayu', 'kincir', 'air', 'hidro', 'geotermal', 'panas bumi', 'biomassa'
  ],
  // Kearifan Lokal
  kearifan_lokal: [
    'kearifan lokal', 'pranata mangsa', 'subak', 'adat', 'tradisional', 'petuah', 'leluhur',
    'ilmu perbintangan', 'musim tanam', 'kebijaksanaan lokal', 'budaya lokal'
  ],
  // Mitigasi vs Adaptasi
  mitigasi_adaptasi: [
    'mitigasi', 'adaptasi', 'pencegahan', 'penyesuaian', 'mengurangi', 'menahan', 'tanggul',
    'rumah panggung', 'solusi', 'upaya', 'tindakan'
  ],
  // Gender & Kelompok Rentan
  kelompok_rentan: [
    'perempuan', 'wanita', 'ibu', 'anak', 'lansia', 'beban domestik', 'air bersih', 'gender',
    'keluarga', 'kerentanan', 'kelompok rentan'
  ],
  // Dampak Psikologis / Mental
  kesehatan_mental: [
    'mental', 'stres', 'cemas', 'kecemasan', 'trauma', 'solastalgia', 'takut', 'duka',
    'kehilangan tempat tinggal', 'depresi'
  ]
};

/**
 * Evaluator Semantik Lokal Bahasa Indonesia
 * Bertugas menilai apakah esensi gagasan siswa sama dengan jawaban yang diharapkan,
 * tanpa menuntut kata atau struktur kalimat yang persis sama.
 */
export function evaluateLocalSemantics(
  studentAnswer: string,
  question: Question
): SemanticEvaluationResult {
  const normStudent = normalizeText(studentAnswer);
  const normRef = normalizeText(question.referenceAnswer);
  const normQuestion = normalizeText(question.question);
  const keywords = (question.keywords || []).map(k => normalizeText(k));

  if (!normStudent || normStudent.length < 3) {
    return {
      isCorrect: false,
      semanticFeedback: 'Jawaban masih kosong atau terlalu singkat untuk dinilai maknanya.',
      source: 'local-semantic',
      confidence: 0.1
    };
  }

  // 1. Cek apakah ada kecocokan kata kunci inti (lengkap atau parsial)
  const matchedKeywords: string[] = [];
  keywords.forEach((kw) => {
    if (kw.length >= 3) {
      if (normStudent.includes(kw)) {
        matchedKeywords.push(kw);
      } else {
        // Cek potongan kata/lemma
        const kwParts = kw.split(' ').filter(p => p.length >= 3);
        const matchParts = kwParts.filter(p => normStudent.includes(p));
        if (matchParts.length >= Math.ceil(kwParts.length * 0.6)) {
          matchedKeywords.push(kw);
        }
      }
    }
  });

  // 2. Cek keselarasan makna melalui klaster konsep semantik
  const detectedQuestionConcepts: string[] = [];
  const detectedStudentConcepts: string[] = [];

  Object.entries(SEMANTIC_CONCEPT_CLUSTERS).forEach(([conceptKey, terms]) => {
    // Apakah soal atau kunci jawaban berkaitan dengan konsep ini?
    const isRelevantToTopic =
      terms.some(t => normRef.includes(t)) ||
      terms.some(t => normQuestion.includes(t)) ||
      keywords.some(k => terms.some(t => k.includes(t)));

    if (isRelevantToTopic) {
      detectedQuestionConcepts.push(conceptKey);
      // Apakah siswa mengekspresikan konsep ini (lewat salah satu istilah/sinonim dalam klaster)?
      const studentMentionsConcept = terms.some(t => normStudent.includes(t));
      if (studentMentionsConcept) {
        detectedStudentConcepts.push(conceptKey);
      }
    }
  });

  // 3. Cek overlap token bermakna (mengabaikan stop words bahasa Indonesia)
  const stopWords = new Set([
    'yang', 'di', 'dan', 'ini', 'itu', 'adalah', 'yaitu', 'merupakan', 'karena', 'dari', 'ke', 'untuk',
    'pada', 'dengan', 'dalam', 'oleh', 'saat', 'seperti', 'bisa', 'dapat', 'akan', 'atau', 'bagi',
    'secara', 'serta', 'juga', 'agar', 'supaya', 'sehingga', 'maka', 'telah', 'sudah', 'oleh', 'karena',
    'bila', 'jika', 'kalau', 'tentang', 'bahwa', 'ada', 'tidak', 'bukan', 'hanya', 'antara'
  ]);

  const refTokens = normRef.split(' ').filter(w => w.length > 2 && !stopWords.has(w));
  let tokenMatches = 0;
  refTokens.forEach(t => {
    if (normStudent.includes(t)) {
      tokenMatches++;
    }
  });
  const tokenOverlapRatio = refTokens.length > 0 ? tokenMatches / refTokens.length : 0;

  // 4. Kriteria penentu: MAKNANYA SAMA
  // - Siswa mendeteksi konsep semantik yang relevan
  // - ATAU menemukan kata kunci
  // - ATAU token overlap gagasan >= 15%
  const hasMatchedConcepts = detectedStudentConcepts.length > 0;
  const hasMatchedKeywords = matchedKeywords.length > 0;
  const hasSubstantialOverlap = tokenOverlapRatio >= 0.15;

  const isCorrect = hasMatchedConcepts || hasMatchedKeywords || hasSubstantialOverlap;

  if (isCorrect) {
    const feedbackDetails: string[] = [];
    if (detectedStudentConcepts.length > 0) {
      feedbackDetails.push(`Konsep inti (${detectedStudentConcepts.join(', ')}) tersampaikan dengan baik`);
    } else if (matchedKeywords.length > 0) {
      feedbackDetails.push(`Gagasan selaras dengan topik materi`);
    } else {
      feedbackDetails.push(`Esensi jawaban sesuai dengan materi yang ditanyakan`);
    }

    return {
      isCorrect: true,
      semanticFeedback: `Makna jawaban tepat dan selaras! ${feedbackDetails.join('. ')}.`,
      source: 'local-semantic',
      confidence: 0.9,
      matchedConcepts: detectedStudentConcepts
    };
  }

  return {
    isCorrect: false,
    semanticFeedback: 'Makna atau gagasan uraian belum menyentuh konsep utama materi IPS yang dimaksud.',
    source: 'local-semantic',
    confidence: 0.8,
    matchedConcepts: []
  };
}

/**
 * Fungsi Utama Verifikasi Semantik:
 * Mengutamakan evaluasi AI cerdas (Gemini 3.8 Flash via endpoint server)
 * yang membaca makna fleksibel tanpa menuntut kesamaan kata perkata.
 * Jika koneksi offline/timeout, otomatis beralih mulus ke evaluator semantik lokal.
 */
export async function verifyAnswerSemantics(
  studentAnswer: string,
  question: Question
): Promise<SemanticEvaluationResult> {
  const trimmed = studentAnswer.trim();
  if (!trimmed || trimmed.length < 3) {
    return {
      isCorrect: false,
      semanticFeedback: 'Jawaban masih kosong. Mohon ketikkan uraian pemahaman Anda.',
      source: 'local-semantic',
      confidence: 0.0
    };
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 7000); // 7 detik batas waktu AI

    const response = await fetch('/api/evaluate-answer', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        question: question.question,
        referenceAnswer: question.referenceAnswer,
        studentAnswer: trimmed,
        keywords: question.keywords,
        explanation: question.explanation,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      if (data && data.success && typeof data.isCorrect === 'boolean') {
        return {
          isCorrect: data.isCorrect,
          semanticFeedback:
            data.semanticFeedback ||
            (data.isCorrect
              ? 'Makna jawaban diverifikasi selaras dengan konsep materi IPS.'
              : 'Gagasan jawaban belum sesuai dengan konsep yang ditanyakan.'),
          source: 'ai-semantic',
          confidence: data.confidence || 0.95
        };
      }
    }
  } catch (err) {
    console.info('Pemeriksaan AI dialihkan ke evaluator semantik lokal:', err);
  }

  // Fallback ke semantic engine lokal
  return evaluateLocalSemantics(trimmed, question);
}
