/* =====================================================
   PENDAFTARAN EKSTRAKURIKULER - script.js
   Daftar isi:
   1. Data ekskul (EDIT DI SINI)   2. Helper
   3. Aturan validasi              4. Fungsi form
   5. Event form                   6. Chatbot
   ===================================================== */

/* ---------- 1. DATA EKSKUL ----------
   Format: ["Nama", "Deskripsi", "Jadwal"]
   Ubah / tambah / hapus baris sesuai kebutuhan sekolah. */
const EKSKUL = [
  ["Pramuka",     "Melatih kepemimpinan, kemandirian & kerja sama.", "Jumat 13.00"],
  ["Paskibra",    "Latihan baris-berbaris & pengibaran bendera.",    "Sabtu 08.00"],
  ["PMR",         "Pertolongan pertama & kepedulian sosial.",        "Rabu 15.20"],
  ["Drumband",    "Latihan musik & kekompakan tim.",                 "Senin 15.20"],
  ["Rohis",       "Kajian & kegiatan keagamaan Islam.",              "Kamis 15.20"],
  ["Seni Tari",   "Tari tradisional dan modern.",                    "Rabu 15.20"],
  ["Pencak Silat","Melatih mental, fisik, & bela diri.",              "Senin 15.30"],
  ["Bahasa Jepang","Belajar bahasa & budaya Jepang.",                "Senin 15.30"],
  ["Volly",        "Latihan servis, smash & tim.",                    "Rabu 15.30"],
  ["Futsal",      "Latihan fisik & taktik futsal.",                  "Rabu 15.30"],
  ["Rebana",         "Seni rebana & musik Islami.",               "Senin 15.20"],
  ["Jurnalistik", "Menulis berita, mading & liputan.",               "Selasa 15.20"],
  ["Safety Riding",  "Edukasi keselamatan & ketertiban berkendara.",          "Kamis 15.20"],
  ["Paduan suara","Melatih vokal & kekompakan suara.",         "Kamis 14.30"]
];

/* ---------- 2. HELPER ---------- */
const $     = (selector) => document.querySelector(selector);
const field = (name) => document.querySelector(`[data-f="${name}"]`);
const val   = (id) => $('#' + id).value;

const FIELDS  = ['nama', 'email', 'pw', 'pw2', 'ekskul'];
const touched = {};  // menandai isian yang sudah disentuh pengguna

/* ---------- 3. ATURAN VALIDASI ----------
   Mengembalikan teks error, atau '' kalau sudah benar. */
const RULES = {
  nama: (v) =>
    !v.trim() ? 'Nama lengkap wajib diisi.' :
    v.trim().length < 3 ? 'Nama lengkap minimal 3 karakter.' :
    !/^[A-Za-z\s.'-]+$/.test(v.trim()) ? 'Nama hanya boleh berisi huruf.' : '',

  email: (v) =>
    !v.trim() ? 'Email wajib diisi.' :
    !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? 'Format email tidak valid.' : '',

  pw: (v) =>
    !v ? 'Password wajib diisi.' :
    !/^\d+$/.test(v) ? 'Password hanya boleh berisi angka.' :
    v.length < 8 ? 'Password minimal 8 angka.' : '',

  pw2: (v) =>
    !v ? 'Konfirmasi password wajib diisi.' :
    v !== val('pw') ? 'Konfirmasi password tidak sama.' : '',

  ekskul: (v) => (v ? '' : 'Pilih salah satu ekstrakurikuler.')
};

const SUCCESS_TEXT = {
  nama: 'Nama terlihat bagus.',
  email: 'Email valid.',
  pw: 'Password angka valid.',
  pw2: 'Password cocok.',
  ekskul: 'Ekstrakurikuler dipilih.'
};

/* ---------- 4. FUNGSI FORM ---------- */

// Isi dropdown & tombol ekskul dari data
function renderEkskul() {
  EKSKUL.forEach(([nama]) => {
    $('#ekskul').add(new Option(nama, nama));

    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'chip';
    chip.textContent = nama;
    chip.onclick = () => {
      $('#ekskul').value = nama;
      $('#ekskul').dispatchEvent(new Event('change'));
      $('#form').scrollIntoView({ behavior: 'smooth', block: 'center' });
    };
    $('#chips').append(chip);
  });
}

// Cek satu isian & tampilkan hasilnya (merah / hijau)
function check(name, show = true) {
  const error = RULES[name](val(name));
  if (show) {
    const f = field(name);
    f.classList.toggle('bad', !!error);
    f.classList.toggle('good', !error);
    f.querySelector('.msg').textContent = error || SUCCESS_TEXT[name];
  }
  return !error;
}

// Bar progres: jumlah isian yang sudah benar
function updateProgress() {
  const done = FIELDS.filter((n) => !RULES[n](val(n))).length;
  $('#bar').style.width = (done / FIELDS.length) * 100 + '%';
}

// Indikator kekuatan password angka
function updateStrength() {
  const v = val('pw');
  const colors = ['#e11d48', '#f59e0b', '#84cc16', '#16a34a'];
  let score = 0;
  if (v.length >= 8)  score++;
  if (v.length >= 10) score++;
  if (v.length >= 12) score++;

  // Angka berulang / berurutan dianggap lemah
  const lemah = /^(\d)\1+$/.test(v) ||
    '01234567890123456789'.includes(v) || '98765432109876543210'.includes(v);
  if (score && lemah) score = 1;

  const bars = Math.max(score, v.length ? 1 : 0);
  document.querySelectorAll('#meter i').forEach((bar, i) => {
    bar.style.background = i < bars ? colors[bars - 1] : '';
  });
}

// Notifikasi kecil di atas layar
function toast(text, isError) {
  const el = $('#toast');
  el.textContent = text;
  el.className = 'toast show' + (isError ? ' err' : '');
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => el.classList.remove('show'), 3200);
}

// Kosongkan form untuk pendaftar berikutnya
function resetForm() {
  FIELDS.forEach((n) => {
    $('#' + n).value = '';
    field(n).classList.remove('good', 'bad');
    field(n).querySelector('.msg').textContent = '';
    touched[n] = false;
  });
  $('#info').classList.remove('show');
  updateStrength();
  updateProgress();
  $('#go').disabled = false;
  $('#go').innerHTML = '<span>✈ Daftar</span>';
  $('#ok').style.display = 'none';
  $('#formbox').style.display = 'block';
}

// Tombol Daftar
function submitForm() {
  let firstError = null;
  FIELDS.forEach((n) => {
    touched[n] = true;
    if (!check(n) && !firstError) firstError = n;
  });
  updateProgress();

  if (firstError) {
    toast('Periksa kembali isian yang berwarna merah.', true);
    $('#' + firstError).focus();
    return;
  }

  const btn = $('#go');
  btn.disabled = true;
  btn.innerHTML = '<i class="spin"></i><span>Memproses...</span>';

  // Simulasi kirim data (ganti dengan fetch() ke server jika sudah ada backend)
  setTimeout(() => {
    const e = EKSKUL.find((x) => x[0] === val('ekskul'));
    $('#sum').innerHTML =
      `<b>${escapeHtml(val('nama').trim())}</b><br>${escapeHtml(val('email').trim())}<br>` +
      `Ekskul: <b>${e[0]}</b> · ${e[2]}`;
    $('#formbox').style.display = 'none';
    $('#ok').style.display = 'block';
    toast('Pendaftaran berhasil! 🎉');
    botSay(`Selamat, pendaftaranmu ke ${e[0]} sudah masuk! 🎉`);
  }, 1200);
}

// Mencegah teks input dibaca sebagai kode HTML
function escapeHtml(text) {
  const d = document.createElement('div');
  d.textContent = text;
  return d.innerHTML;
}

/* ---------- 5. EVENT FORM ---------- */
function setupForm() {
  FIELDS.forEach((n) => {
    const el = $('#' + n);

    const validate = () => {
      touched[n] = true;
      check(n);
      if (n === 'pw') {
        updateStrength();
        if (touched.pw2) check('pw2');
      }
      updateProgress();
    };

    el.addEventListener('input', () => {
      // Password hanya boleh angka
      if (n === 'pw' || n === 'pw2') el.value = el.value.replace(/\D/g, '');

      if (touched[n] || n === 'ekskul') validate();
      else {
        updateProgress();
        if (n === 'pw') updateStrength();
      }
    });
    el.addEventListener('blur', validate);
    el.addEventListener('change', validate);
  });

  // Info deskripsi & jadwal saat ekskul dipilih
  $('#ekskul').addEventListener('change', () => {
    const e = EKSKUL.find((x) => x[0] === val('ekskul'));
    $('#info').classList.toggle('show', !!e);
    if (e) $('#info').innerHTML = `<b>${e[0]}</b> — ${e[1]}<br>🗓 Jadwal: ${e[2]}`;
  });

  // Tombol tampil / sembunyi password
  document.querySelectorAll('[data-eye]').forEach((btn) => {
    btn.onclick = () => {
      const input = $('#' + btn.dataset.eye);
      const hidden = input.type === 'password';
      input.type = hidden ? 'text' : 'password';
      btn.textContent = hidden ? '🙈' : '👁';
    };
  });

  // Tombol-tombol utama
  $('#go').onclick = submitForm;
  $('#again').onclick = resetForm;
  $('#form').addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && e.target.tagName !== 'SELECT') submitForm();
  });

  // Ganti tema terang / gelap
  $('#theme').onclick = () => {
    const root = document.documentElement;
    const isDark = root.dataset.theme
      ? root.dataset.theme === 'dark'
      : matchMedia('(prefers-color-scheme: dark)').matches;
    root.dataset.theme = isDark ? 'light' : 'dark';
  };
}

/* ---------- 6. CHATBOT ---------- */
const QUICK_QUESTIONS = ['Daftar ekskul', 'Cara daftar', 'Jadwal latihan', 'Syarat password'];

function addBubble(text, who) {
  const b = document.createElement('div');
  b.className = 'b ' + who;
  b.textContent = text;
  $('#log').append(b);
  $('#log').scrollTop = $('#log').scrollHeight;
}
const botSay = (text) => addBubble(text, 'bot');

// Menentukan jawaban bot berdasarkan kata kunci
function botReply(question) {
  const q = question.toLowerCase();
  const found = EKSKUL.find((x) => q.includes(x[0].toLowerCase()));

  if (found) return `${found[0]}: ${found[1]}\nJadwal: ${found[2]}.`;
  if (/halo|hai|hi\b|pagi|siang|malam/.test(q))
    return 'Halo! 👋 Saya bisa bantu soal daftar ekskul, jadwal, dan cara mendaftar.';
  if (/daftar ekskul|pilihan|apa saja|ekstra/.test(q))
    return `Ada ${EKSKUL.length} ekskul:\n` + EKSKUL.map((x, i) => `${i + 1}. ${x[0]}`).join('\n');
  if (/cara|bagaimana|langkah|mendaftar/.test(q))
    return '1. Isi nama, email, dan password.\n2. Pilih ekskul.\n3. Tekan tombol Daftar.\n4. Tunggu konfirmasi dari sekolah.';
  if (/jadwal|kapan|latihan/.test(q))
    return 'Sebutkan nama ekskulnya (misal "jadwal Futsal") dan saya beri jadwalnya.';
  if (/password|sandi/.test(q))
    return 'Password hanya berisi angka (0-9), minimal 8 angka. Hindari angka berulang atau berurutan seperti 12345678 agar lebih aman.';
  if (/email/.test(q)) return 'Gunakan email aktif, contoh: nama@email.com.';
  if (/biaya|bayar|gratis/.test(q)) return 'Informasi biaya ditentukan sekolah. Silakan tanyakan ke pembina ekskul.';
  if (/lebih dari|banyak|dua|2 ekskul/.test(q)) return 'Ketentuan jumlah ekskul mengikuti kebijakan sekolah. Tanyakan ke pembina.';
  return 'Maaf, saya belum paham. Coba tanya soal daftar ekskul, cara daftar, jadwal, atau password.';
}

function askBot(text) {
  text = text.trim();
  if (!text) return;
  addBubble(text, 'me');
  setTimeout(() => botSay(botReply(text)), 350);
}

function setupChatbot() {
  QUICK_QUESTIONS.forEach((q) => {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'chip';
    chip.textContent = q;
    chip.onclick = () => askBot(q);
    $('#qs').append(chip);
  });

  $('#fab').onclick = () => {
    $('#panel').classList.toggle('open');
    if (!$('#log').children.length) botSay('Halo! 👋 Saya asisten ekskul. Mau tanya apa?');
  };
  $('#x').onclick = () => $('#panel').classList.remove('open');
  $('#send').onclick = () => { askBot($('#q').value); $('#q').value = ''; };
  $('#q').addEventListener('keydown', (e) => { if (e.key === 'Enter') $('#send').click(); });
}

/* ---------- MULAI ---------- */
renderEkskul();
setupForm();
setupChatbot();
