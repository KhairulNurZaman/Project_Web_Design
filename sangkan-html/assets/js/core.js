/*
 * core.js — inti aplikasi Sangkan Park E-Ticketing (HTML/CSS/JS native).
 * Pengganti backend PHP + MySQL: data disimpan di localStorage browser.
 * Struktur tabel meniru sangkan_db.sql (admin, users, customer, layanan,
 * transaksi, detail_transaksi, scan_logs) + pesan_kontak & settings.
 */
(function (w) {
  'use strict';
  var SP = w.SP = w.SP || {};

  var KEY_DB = 'sangkan_db_v1';
  var KEY_SESSION = 'sangkan_session_v1';
  var KEY_FLASH = 'sangkan_flash_v1';
  var SESSION_TTL = 2 * 60 * 60 * 1000; // 2 jam (sama seperti sess_expiration CI)

  SP.base = (document.documentElement.getAttribute('data-base') || '');
  SP.url = function (p) { return SP.base + p; };
  SP.go = function (p) { w.location.href = SP.url(p); };

  /* ================= UTIL ================= */
  var BULAN = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  var BULAN_PANJANG = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  var HARI = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

  function pad2(n) { return (n < 10 ? '0' : '') + n; }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function parseDT(s) {
    if (s instanceof Date) return s;
    var m = /^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2})(?::(\d{2}))?)?/.exec(String(s || ''));
    if (!m) return new Date(NaN);
    return new Date(+m[1], +m[2] - 1, +m[3], +(m[4] || 0), +(m[5] || 0), +(m[6] || 0));
  }
  function ymd(d) { return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate()); }

  SP.util = {
    pad2: pad2,
    esc: esc,
    parseDT: parseDT,
    now: function () { var d = new Date(); return ymd(d) + ' ' + pad2(d.getHours()) + ':' + pad2(d.getMinutes()) + ':' + pad2(d.getSeconds()); },
    today: function () { return ymd(new Date()); },
    ymd: ymd,
    addDays: function (dateStr, n) { var d = parseDT(dateStr); d.setDate(d.getDate() + n); return ymd(d); },
    rp: function (n) {
      n = Math.round(Number(n) || 0);
      var neg = n < 0; n = Math.abs(n);
      return (neg ? '-' : '') + 'Rp ' + String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    },
    num: function (n) { return String(Math.round(Number(n) || 0)).replace(/\B(?=(\d{3})+(?!\d))/g, '.'); },
    // 14 Nov 2026
    dMY: function (s) { var d = parseDT(s); return isNaN(d) ? '-' : pad2(d.getDate()) + ' ' + BULAN[d.getMonth()] + ' ' + d.getFullYear(); },
    // 14 Nov 2026 13:05
    dMYHi: function (s) { var d = parseDT(s); return isNaN(d) ? '-' : SP.util.dMY(d) + ' ' + pad2(d.getHours()) + ':' + pad2(d.getMinutes()); },
    // 14 Nov 13:05
    dMHi: function (s) { var d = parseDT(s); return isNaN(d) ? '-' : pad2(d.getDate()) + ' ' + BULAN[d.getMonth()] + ' ' + pad2(d.getHours()) + ':' + pad2(d.getMinutes()); },
    // 14/11/2026
    dmY: function (s) { var d = parseDT(s); return isNaN(d) ? '-' : pad2(d.getDate()) + '/' + pad2(d.getMonth() + 1) + '/' + d.getFullYear(); },
    // 14/11/2026 13:05
    dmYHi: function (s) { var d = parseDT(s); return isNaN(d) ? '-' : SP.util.dmY(d) + ' ' + pad2(d.getHours()) + ':' + pad2(d.getMinutes()); },
    // Sabtu, 14 November 2026 13:05
    hariLengkap: function (d) {
      d = d || new Date();
      return HARI[d.getDay()] + ', ' + pad2(d.getDate()) + ' ' + BULAN_PANJANG[d.getMonth()] + ' ' + d.getFullYear() + ' ' + pad2(d.getHours()) + ':' + pad2(d.getMinutes());
    },
    ucfirst: function (s) { s = String(s || ''); return s.charAt(0).toUpperCase() + s.slice(1); },
    rand: function (min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; },
    qs: function (name) {
      var m = new RegExp('[?&]' + name + '=([^&#]*)').exec(w.location.search);
      if (!m) return '';
      try { return decodeURIComponent(m[1].replace(/\+/g, ' ')); } catch (e) { return m[1]; }
    },
    initial: function (s, fb) { s = String(s || '').trim(); return (s ? s.charAt(0) : (fb || '?')).toUpperCase(); },
    isEmail: function (s) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(s || '')); },
    // kelas & label status (sama dengan view PHP asli)
    status: {
      badgeAdmin: { menunggu_pembayaran: 'badge-menunggu', aktif: 'badge-aktif', digunakan: 'badge-digunakan', dibatalkan: 'badge-dibatalkan' },
      labelShort: { menunggu_pembayaran: 'Menunggu', aktif: 'Aktif', digunakan: 'Digunakan', dibatalkan: 'Batal' },
      labelLong: { menunggu_pembayaran: 'Menunggu Pembayaran', aktif: 'Aktif', digunakan: 'Sudah Digunakan', dibatalkan: 'Dibatalkan' }
    }
  };
  var U = SP.util;

  /* ================= SHA-256 (sinkron, tanpa WebCrypto) ================= */
  SP.sha256 = function (str) {
    var K = [
      0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
      0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
      0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
      0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
      0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
      0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
      0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
      0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
    ];
    var H = [0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19];
    var s = unescape(encodeURIComponent(String(str))), bytes = [], i;
    for (i = 0; i < s.length; i++) bytes.push(s.charCodeAt(i));
    var bitLen = bytes.length * 8;
    bytes.push(0x80);
    while (bytes.length % 64 !== 56) bytes.push(0);
    var hi = Math.floor(bitLen / 0x100000000), lo = bitLen >>> 0;
    bytes.push((hi >>> 24) & 255, (hi >>> 16) & 255, (hi >>> 8) & 255, hi & 255, (lo >>> 24) & 255, (lo >>> 16) & 255, (lo >>> 8) & 255, lo & 255);
    function rotr(x, n) { return (x >>> n) | (x << (32 - n)); }
    for (var off = 0; off < bytes.length; off += 64) {
      var W = new Array(64), t;
      for (t = 0; t < 16; t++) W[t] = (bytes[off + t * 4] << 24) | (bytes[off + t * 4 + 1] << 16) | (bytes[off + t * 4 + 2] << 8) | bytes[off + t * 4 + 3];
      for (t = 16; t < 64; t++) {
        var s0 = rotr(W[t - 15], 7) ^ rotr(W[t - 15], 18) ^ (W[t - 15] >>> 3);
        var s1 = rotr(W[t - 2], 17) ^ rotr(W[t - 2], 19) ^ (W[t - 2] >>> 10);
        W[t] = (W[t - 16] + s0 + W[t - 7] + s1) | 0;
      }
      var a = H[0], b = H[1], c = H[2], d = H[3], e = H[4], f = H[5], g = H[6], h = H[7];
      for (t = 0; t < 64; t++) {
        var S1 = rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25);
        var ch = (e & f) ^ (~e & g);
        var t1 = (h + S1 + ch + K[t] + W[t]) | 0;
        var S0 = rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22);
        var maj = (a & b) ^ (a & c) ^ (b & c);
        var t2 = (S0 + maj) | 0;
        h = g; g = f; f = e; e = (d + t1) | 0; d = c; c = b; b = a; a = (t1 + t2) | 0;
      }
      H[0] = (H[0] + a) | 0; H[1] = (H[1] + b) | 0; H[2] = (H[2] + c) | 0; H[3] = (H[3] + d) | 0;
      H[4] = (H[4] + e) | 0; H[5] = (H[5] + f) | 0; H[6] = (H[6] + g) | 0; H[7] = (H[7] + h) | 0;
    }
    var out = '';
    for (i = 0; i < 8; i++) out += ('00000000' + (H[i] >>> 0).toString(16)).slice(-8);
    return out;
  };
  function hashPw(pw) { return SP.sha256('sangkan::' + pw); }

  /* ================= DATABASE (localStorage) ================= */
  function seed() {
    var t = U.now();
    return {
      v: 1,
      admin: [
        { id_admin: 'A001', nama_admin: 'Administrator', username: 'admin', password: hashPw('admin123'), role: 'admin', created_at: t },
        { id_admin: 'M001', nama_admin: 'Manajer Operasional', username: 'manajer1', password: hashPw('manajer123'), role: 'manajer', created_at: t },
        { id_admin: 'M002', nama_admin: 'Manajer Pemasaran', username: 'manajer2', password: hashPw('manajer123'), role: 'manajer', created_at: t }
      ],
      users: [],
      customer: [],
      layanan: [
        { id_layanan: 'L001', nama_layanan: 'Tiket Weekday', deskripsi: 'Tiket masuk Sangkan Resort Aqua Park untuk hari Senin - Jumat. Nikmati berbagai wahana seru dengan harga spesial!', harga: 35000, harga_weekend: null, kategori: 'weekday', stok: 999, gambar: null, status: 'aktif', created_at: t },
        { id_layanan: 'L002', nama_layanan: 'Tiket Weekend', deskripsi: 'Tiket masuk Sangkan Resort Aqua Park untuk hari Sabtu - Minggu & Hari Libur Nasional. Harga spesial akhir pekan!', harga: 45000, harga_weekend: null, kategori: 'weekend', stok: 999, gambar: null, status: 'aktif', created_at: t },
        { id_layanan: 'L003', nama_layanan: 'Tiket Flash Sale', deskripsi: 'Promo terbatas! Harga spesial dengan slot terbatas. Segera dapatkan tiketmu!', harga: 24000, harga_weekend: null, kategori: 'promo', stok: 999, gambar: null, status: 'aktif', created_at: t },
        { id_layanan: 'L004', nama_layanan: 'Paket Keluarga (4 Orang)', deskripsi: 'Paket hemat untuk keluarga 4 orang. Lebih hemat daripada beli satuan!', harga: 130000, harga_weekend: null, kategori: 'paket', stok: 999, gambar: null, status: 'aktif', created_at: t },
        { id_layanan: 'L005', nama_layanan: 'Tiket Anak (3-12 Tahun)', deskripsi: 'Tiket khusus anak-anak usia 3-12 tahun. Anak di bawah 3 tahun gratis!', harga: 20000, harga_weekend: null, kategori: 'weekday', stok: 999, gambar: null, status: 'aktif', created_at: t }
      ],
      transaksi: [],
      detail_transaksi: [],
      scan_logs: [],
      pesan_kontak: [],
      settings: { kapasitas_harian: 1500 },
      seq: { user: 0, detail: 0, scan: 0, pesan: 0 }
    };
  }

  var cache = null;
  function readRaw() {
    try { return w.localStorage.getItem(KEY_DB); } catch (e) { return null; }
  }
  SP.db = {
    get: function () {
      var raw = readRaw();
      if (cache && cache.raw === raw && raw !== null) return cache.data;
      var data = null;
      if (raw) { try { data = JSON.parse(raw); } catch (e) { data = null; } }
      if (!data || data.v !== 1) { data = seed(); SP.db.save(data); raw = readRaw(); }
      cache = { raw: raw, data: data };
      return data;
    },
    // data dikembalikan sebagai salinan baru agar aman dimutasi lalu disimpan
    edit: function () { return JSON.parse(JSON.stringify(SP.db.get())); },
    save: function (data) {
      try {
        var raw = JSON.stringify(data);
        w.localStorage.setItem(KEY_DB, raw);
        cache = { raw: raw, data: data };
        return true;
      } catch (e) {
        w.alert('Penyimpanan browser penuh atau tidak tersedia. Data gagal disimpan.');
        return false;
      }
    },
    reset: function () { var d = seed(); SP.db.save(d); return d; }
  };

  function uniqueId(prefix, exists) {
    var id, n = 0;
    do {
      var d = new Date();
      id = prefix + d.getFullYear() + pad2(d.getMonth() + 1) + pad2(d.getDate()) + pad2(d.getHours()) + pad2(d.getMinutes()) + pad2(d.getSeconds()) + U.rand(10, 99);
      n++;
    } while (exists(id) && n < 500);
    return id;
  }

  /* ================= SESI & FLASH ================= */
  SP.session = {
    get: function () {
      try {
        var s = JSON.parse(w.localStorage.getItem(KEY_SESSION) || 'null');
        if (!s || !s.logged_in) return null;
        if (s.exp && s.exp < Date.now()) { w.localStorage.removeItem(KEY_SESSION); return null; }
        return s;
      } catch (e) { return null; }
    },
    set: function (s) {
      s.logged_in = true; s.exp = Date.now() + SESSION_TTL;
      try { w.localStorage.setItem(KEY_SESSION, JSON.stringify(s)); } catch (e) { /* abaikan */ }
    },
    update: function (patch) {
      var s = SP.session.get(); if (!s) return;
      for (var k in patch) s[k] = patch[k];
      SP.session.set(s);
    },
    clear: function () { try { w.localStorage.removeItem(KEY_SESSION); } catch (e) { /* abaikan */ } }
  };
  SP.flash = {
    set: function (type, msg) {
      try { var f = JSON.parse(w.localStorage.getItem(KEY_FLASH) || '{}'); f[type] = msg; w.localStorage.setItem(KEY_FLASH, JSON.stringify(f)); } catch (e) { /* abaikan */ }
    },
    // ambil lalu hapus (sekali tampil, seperti flashdata CodeIgniter)
    take: function () {
      var f = {};
      try { f = JSON.parse(w.localStorage.getItem(KEY_FLASH) || '{}') || {}; w.localStorage.removeItem(KEY_FLASH); } catch (e) { f = {}; }
      return f;
    }
  };

  /* ================= AUTH ================= */
  SP.auth = {
    login: function (username, password) {
      username = String(username || '').trim();
      if (!username || !password) return { ok: false, msg: 'Username/Email dan password wajib diisi!' };
      var d = SP.db.get(), pw = hashPw(password), i;
      for (i = 0; i < d.admin.length; i++) {
        var a = d.admin[i];
        if (a.username === username && a.password === pw) {
          SP.session.set({ type: 'staff', id_admin: a.id_admin, nama: a.nama_admin, username: a.username, role: a.role });
          return { ok: true, role: a.role };
        }
      }
      var lower = username.toLowerCase();
      for (i = 0; i < d.users.length; i++) {
        var u = d.users[i];
        if (String(u.email).toLowerCase() === lower && u.password === pw) {
          SP.session.set({ type: 'customer', id_user: u.id_user, nama: u.nama_lengkap, email: u.email, role: 'customer' });
          return { ok: true, role: 'customer' };
        }
      }
      return { ok: false, msg: 'Username/Email atau password salah!' };
    },
    register: function (nama, email, telp, pass, confirm) {
      nama = String(nama || '').trim(); email = String(email || '').trim(); telp = String(telp || '').trim();
      if (!nama || !email || !pass) return { ok: false, msg: 'Nama, email, dan password wajib diisi!' };
      if (!U.isEmail(email)) return { ok: false, msg: 'Format email tidak valid!' };
      if (pass.length < 6) return { ok: false, msg: 'Password minimal 6 karakter!' };
      if (pass !== confirm) return { ok: false, msg: 'Konfirmasi password tidak cocok!' };
      var d = SP.db.edit();
      var lower = email.toLowerCase();
      for (var i = 0; i < d.users.length; i++) {
        if (String(d.users[i].email).toLowerCase() === lower) {
          return { ok: false, msg: 'Email <strong>' + esc(email) + '</strong> sudah terdaftar. Silakan login!' };
        }
      }
      d.seq.user++;
      d.users.push({ id_user: d.seq.user, nama_lengkap: nama, email: email, no_telp: telp || null, password: hashPw(pass), avatar: null, created_at: U.now() });
      if (!SP.db.save(d)) return { ok: false, msg: 'Registrasi gagal, coba lagi.' };
      return { ok: true };
    },
    logout: function () { SP.session.clear(); },
    // arahkan ke halaman sesuai peran (dari halaman root)
    homeFor: function (role) { return (role === 'admin' || role === 'manajer') ? 'panel/index.html' : 'pesan.html'; }
  };
  SP.guard = {
    customer: function () {
      var s = SP.session.get();
      if (!s || s.type !== 'customer') {
        SP.flash.set('error', 'Silakan login terlebih dahulu!');
        SP.go('login.html');
        return null;
      }
      return s;
    },
    staff: function (roles) {
      var s = SP.session.get();
      if (!s) {
        SP.flash.set('error', 'Silakan login terlebih dahulu!');
        SP.go('login.html');
        return null;
      }
      if (s.type !== 'staff' || roles.indexOf(s.role) === -1) {
        document.body.innerHTML = '<div style="font-family:Segoe UI,sans-serif;max-width:520px;margin:12vh auto;text-align:center;padding:1rem">' +
          '<h1 style="color:#0f4c81">403</h1><p>Akses Ditolak. Halaman ini tidak tersedia untuk peran <strong>' + esc(s.role) + '</strong>.</p>' +
          '<a href="' + SP.url('panel/index.html') + '" style="color:#0f4c81">Kembali ke Dashboard</a></div>';
        return null;
      }
      return s;
    }
  };

  /* ================= MODEL ================= */
  function byId(arr, key, id) { for (var i = 0; i < arr.length; i++) if (arr[i][key] === id) return arr[i]; return null; }
  function copy(o) { return JSON.parse(JSON.stringify(o)); }
  var AKTIF_STATUS = ['aktif', 'digunakan'];

  SP.layanan = {
    all: function () { return copy(SP.db.get().layanan); },
    aktif: function () { return SP.layanan.all().filter(function (l) { return l.status === 'aktif'; }); },
    get: function (id) { var l = byId(SP.db.get().layanan, 'id_layanan', id); return l ? copy(l) : null; },
    insert: function (data) {
      var d = SP.db.edit(), max = 0;
      d.layanan.forEach(function (l) { var n = parseInt(String(l.id_layanan).substr(1), 10) || 0; if (n > max) max = n; });
      var id = 'L' + ('000' + (max + 1)).slice(-3);
      d.layanan.push({ id_layanan: id, nama_layanan: data.nama_layanan, deskripsi: data.deskripsi || '', harga: data.harga, harga_weekend: null, kategori: data.kategori, stok: 999, gambar: null, status: data.status, created_at: U.now() });
      return SP.db.save(d) ? id : null;
    },
    update: function (id, data) {
      var d = SP.db.edit(), l = byId(d.layanan, 'id_layanan', id);
      if (!l) return false;
      l.nama_layanan = data.nama_layanan; l.deskripsi = data.deskripsi || ''; l.harga = data.harga; l.kategori = data.kategori; l.status = data.status;
      return SP.db.save(d);
    },
    remove: function (id) {
      var d = SP.db.edit();
      d.layanan = d.layanan.filter(function (l) { return l.id_layanan !== id; });
      return SP.db.save(d);
    },
    dipakai: function (id) { return SP.db.get().detail_transaksi.filter(function (x) { return x.id_layanan === id; }).length; }
  };

  SP.customer = {
    all: function () { return copy(SP.db.get().customer); },
    get: function (id) { var c = byId(SP.db.get().customer, 'id_cust', id); return c ? copy(c) : null; },
    // dengan jumlah transaksi & total belanja (LEFT JOIN transaksi)
    allWithCount: function () {
      var d = SP.db.get();
      return copy(d.customer).map(function (c) {
        var ts = d.transaksi.filter(function (t) { return t.id_cust === c.id_cust; });
        c.jml_transaksi = ts.length;
        c.total_belanja = ts.reduce(function (s, t) { return s + (Number(t.total_bayar) || 0); }, 0);
        return c;
      }).sort(function (a, b) { return a.id_cust < b.id_cust ? 1 : (a.id_cust > b.id_cust ? -1 : 0); });
    },
    create: function (data) {
      var d = SP.db.edit();
      var id = uniqueId('CUST', function (x) { return !!byId(d.customer, 'id_cust', x); });
      d.customer.push({ id_cust: id, id_user: data.id_user || null, nama_cust: data.nama_cust, no_hp: data.no_hp || null, email: data.email || null });
      return SP.db.save(d) ? id : null;
    },
    update: function (id, data) {
      var d = SP.db.edit(), c = byId(d.customer, 'id_cust', id);
      if (!c) return false;
      c.nama_cust = data.nama_cust; c.no_hp = data.no_hp || null; c.email = data.email || null;
      return SP.db.save(d);
    },
    countTransaksi: function (id) { return SP.db.get().transaksi.filter(function (t) { return t.id_cust === id; }).length; },
    remove: function (id) {
      var d = SP.db.edit();
      d.customer = d.customer.filter(function (c) { return c.id_cust !== id; });
      return SP.db.save(d);
    }
  };

  SP.user = {
    all: function () { return copy(SP.db.get().users); },
    get: function (id) { var u = byId(SP.db.get().users, 'id_user', id); return u ? copy(u) : null; },
    update: function (id, data) {
      var d = SP.db.edit(), u = byId(d.users, 'id_user', id);
      if (!u) return false;
      u.nama_lengkap = data.nama_lengkap; u.no_telp = data.no_telp || null;
      return SP.db.save(d);
    }
  };

  SP.staff = {
    all: function () {
      return copy(SP.db.get().admin).sort(function (a, b) {
        if (a.role !== b.role) return a.role < b.role ? -1 : 1;
        return a.id_admin < b.id_admin ? -1 : (a.id_admin > b.id_admin ? 1 : 0);
      });
    },
    usernameExists: function (u) { return SP.db.get().admin.some(function (a) { return a.username === u; }); },
    insert: function (nama, username, password, role) {
      var d = SP.db.edit(), prefix = role === 'admin' ? 'A' : 'M', max = 0;
      d.admin.forEach(function (a) {
        if (a.id_admin.charAt(0) === prefix) { var n = parseInt(a.id_admin.substr(1), 10) || 0; if (n > max) max = n; }
      });
      var id = prefix + ('000' + (max + 1)).slice(-3);
      d.admin.push({ id_admin: id, nama_admin: nama, username: username, password: hashPw(password), role: role, created_at: U.now() });
      return SP.db.save(d) ? id : null;
    },
    update: function (id, nama, role, password) {
      var d = SP.db.edit(), a = byId(d.admin, 'id_admin', id);
      if (!a) return false;
      a.nama_admin = nama; a.role = role;
      if (password) a.password = hashPw(password);
      return SP.db.save(d);
    },
    remove: function (id) {
      var d = SP.db.edit();
      d.admin = d.admin.filter(function (a) { return a.id_admin !== id; });
      return SP.db.save(d);
    }
  };

  function join(t, d) {
    var c = byId(d.customer, 'id_cust', t.id_cust), a = byId(d.admin, 'id_admin', t.id_admin);
    var r = copy(t);
    r.nama_cust = c ? c.nama_cust : null;
    r.email = c ? c.email : null;
    r.no_hp = c ? c.no_hp : null;
    r.nama_admin = a ? a.nama_admin : null;
    return r;
  }
  function byTanggalDesc(a, b) { return a.tanggal < b.tanggal ? 1 : (a.tanggal > b.tanggal ? -1 : (a.no_tiket < b.no_tiket ? 1 : -1)); }

  SP.transaksi = {
    // simpan header + detail sekaligus (atomik: satu kali save)
    simpan: function (header, items) {
      var d = SP.db.edit();
      d.transaksi.push(header);
      items.forEach(function (it) {
        d.seq.detail++;
        it.id_detail = d.seq.detail;
        d.detail_transaksi.push(it);
      });
      return SP.db.save(d);
    },
    newNoTiket: function () {
      var d = SP.db.get();
      return uniqueId('WP', function (x) { return !!byId(d.transaksi, 'no_tiket', x); });
    },
    allJoin: function () { var d = SP.db.get(); return d.transaksi.map(function (t) { return join(t, d); }).sort(byTanggalDesc); },
    recent: function (limit) { return SP.transaksi.allJoin().slice(0, limit || 5); },
    get: function (no) { var t = byId(SP.db.get().transaksi, 'no_tiket', no); return t ? copy(t) : null; },
    getJoin: function (no) { var d = SP.db.get(), t = byId(d.transaksi, 'no_tiket', no); return t ? join(t, d) : null; },
    detail: function (no) {
      var d = SP.db.get();
      return d.detail_transaksi.filter(function (x) { return x.no_tiket === no; }).map(function (x) {
        var l = byId(d.layanan, 'id_layanan', x.id_layanan), r = copy(x);
        r.nama_layanan = l ? l.nama_layanan : null; r.kategori = l ? l.kategori : null;
        return r;
      });
    },
    byCustomerIds: function (ids) {
      return copy(SP.db.get().transaksi.filter(function (t) { return ids.indexOf(t.id_cust) !== -1; })).sort(byTanggalDesc);
    },
    byStaff: function (idAdmin) {
      var d = SP.db.get();
      return d.transaksi.filter(function (t) { return t.id_admin === idAdmin; }).map(function (t) { return join(t, d); }).sort(byTanggalDesc).slice(0, 100);
    },
    setStatus: function (no, status) {
      var d = SP.db.edit(), t = byId(d.transaksi, 'no_tiket', no);
      if (!t) return false;
      t.status = status;
      return SP.db.save(d);
    },
    setBukti: function (no, dataUrl) {
      var d = SP.db.edit(), t = byId(d.transaksi, 'no_tiket', no);
      if (!t) return false;
      t.bukti_bayar = dataUrl;
      return SP.db.save(d);
    },
    totalPendapatan: function () { return SP.db.get().transaksi.filter(function (t) { return AKTIF_STATUS.indexOf(t.status) !== -1; }).reduce(function (s, t) { return s + (Number(t.total_bayar) || 0); }, 0); },
    totalTiketTerjual: function () { return SP.db.get().transaksi.filter(function (t) { return AKTIF_STATUS.indexOf(t.status) !== -1; }).reduce(function (s, t) { return s + (Number(t.jumlah_tiket) || 0); }, 0); },
    totalTransaksi: function () { return SP.db.get().transaksi.filter(function (t) { return AKTIF_STATUS.indexOf(t.status) !== -1; }).length; },
    countMenunggu: function () { return SP.db.get().transaksi.filter(function (t) { return t.status === 'menunggu_pembayaran'; }).length; },
    // 7 hari terakhir (hari ini termasuk), hari tanpa transaksi = 0
    chartHarian: function (hari) {
      hari = hari || 7;
      var d = SP.db.get(), today = U.today(), out = [];
      for (var i = hari - 1; i >= 0; i--) {
        var tgl = U.addDays(today, -i);
        var ts = d.transaksi.filter(function (t) { return AKTIF_STATUS.indexOf(t.status) !== -1 && String(t.tanggal).substr(0, 10) === tgl; });
        out.push({ tgl: tgl, total: ts.reduce(function (s, t) { return s + (Number(t.total_bayar) || 0); }, 0), jumlah: ts.length });
      }
      return out;
    },
    laporan: function (dari, sampai) {
      var d = SP.db.get();
      return d.transaksi.filter(function (t) {
        var tg = String(t.tanggal).substr(0, 10);
        return tg >= dari && tg <= sampai && AKTIF_STATUS.indexOf(t.status) !== -1;
      }).map(function (t) { return join(t, d); }).sort(byTanggalDesc);
    },
    // jumlah tiket terpesan pada tanggal kunjungan (aktif + digunakan + menunggu bayar)
    terpesan: function (tgl) {
      return SP.db.get().transaksi.filter(function (t) {
        return t.tgl_kunjungan === tgl && t.status !== 'dibatalkan';
      }).reduce(function (s, t) { return s + (Number(t.jumlah_tiket) || 0); }, 0);
    },
    // tiket terlaris berdasarkan detail transaksi sukses
    terlaris: function (dari, sampai) {
      var d = SP.db.get(), map = {};
      d.transaksi.forEach(function (t) {
        var tg = String(t.tanggal).substr(0, 10);
        if (AKTIF_STATUS.indexOf(t.status) === -1) return;
        if (dari && tg < dari) return;
        if (sampai && tg > sampai) return;
        d.detail_transaksi.forEach(function (x) {
          if (x.no_tiket !== t.no_tiket) return;
          var l = byId(d.layanan, 'id_layanan', x.id_layanan);
          var k = x.id_layanan;
          map[k] = map[k] || { id_layanan: k, nama: l ? l.nama_layanan : k, qty: 0, omzet: 0 };
          map[k].qty += Number(x.qty) || 0; map[k].omzet += Number(x.subtotal) || 0;
        });
      });
      return Object.keys(map).map(function (k) { return map[k]; }).sort(function (a, b) { return b.qty - a.qty; });
    }
  };

  SP.scanlog = {
    add: function (no, by, hasil, catatan) {
      var d = SP.db.edit();
      d.seq.scan++;
      d.scan_logs.push({ id: d.seq.scan, no_tiket: no, scanned_by: by || null, scanned_at: U.now(), status_hasil: hasil, catatan: catatan || null });
      return SP.db.save(d);
    },
    // check-in atomik: ubah status + catat log dalam satu penyimpanan
    checkin: function (no, idAdmin, nama) {
      var d = SP.db.edit(), t = byId(d.transaksi, 'no_tiket', no);
      if (!t || t.status !== 'aktif') return false;
      t.status = 'digunakan';
      d.seq.scan++;
      d.scan_logs.push({ id: d.seq.scan, no_tiket: no, scanned_by: idAdmin || null, scanned_at: U.now(), status_hasil: 'valid', catatan: 'Check-in oleh ' + nama });
      return SP.db.save(d);
    },
    forToday: function () {
      var today = U.today();
      return SP.db.get().scan_logs.filter(function (s) { return String(s.scanned_at).substr(0, 10) === today && s.status_hasil === 'valid'; });
    }
  };

  SP.pesan = {
    add: function (nama, email, subjek, isi) {
      var d = SP.db.edit();
      d.seq.pesan++;
      d.pesan_kontak.push({ id: d.seq.pesan, nama: nama, email: email, subjek: subjek || '', pesan: isi, created_at: U.now(), dibaca: false });
      return SP.db.save(d);
    },
    all: function () { return copy(SP.db.get().pesan_kontak).sort(function (a, b) { return b.id - a.id; }); },
    unread: function () { return SP.db.get().pesan_kontak.filter(function (p) { return !p.dibaca; }).length; },
    setRead: function (id, val) {
      var d = SP.db.edit();
      d.pesan_kontak.forEach(function (p) { if (p.id === id) p.dibaca = !!val; });
      return SP.db.save(d);
    },
    remove: function (id) {
      var d = SP.db.edit();
      d.pesan_kontak = d.pesan_kontak.filter(function (p) { return p.id !== id; });
      return SP.db.save(d);
    }
  };

  SP.settings = {
    get: function (k, def) { var s = SP.db.get().settings || {}; return s[k] == null ? def : s[k]; },
    set: function (k, v) { var d = SP.db.edit(); d.settings = d.settings || {}; d.settings[k] = v; return SP.db.save(d); }
  };

  /* ================= CHECKOUT (dipakai pesan online) ================= */
  // Mengembalikan {ok, no_tiket} atau {ok:false, msg}
  SP.checkout = function (p) {
    var nama = String(p.nama || '').trim(), email = String(p.email || '').trim();
    var qty = parseInt(p.qty, 10), metode = p.metode || 'Transfer';
    if (!nama || !email || !p.id_layanan || !(qty >= 1)) return { ok: false, msg: 'Semua data wajib diisi!' };
    if (!U.isEmail(email)) return { ok: false, msg: 'Format email tidak valid!' };
    if (qty > 20) return { ok: false, msg: 'Maksimal 20 tiket per pesanan.' };
    var tgl = p.tgl_kunjungan || U.today();
    if (tgl < U.today()) return { ok: false, msg: 'Tanggal kunjungan tidak boleh sebelum hari ini.' };
    var layanan = SP.layanan.get(p.id_layanan);
    if (!layanan || layanan.status !== 'aktif') return { ok: false, msg: 'Tiket tidak ditemukan!' };
    var kap = Number(SP.settings.get('kapasitas_harian', 1500));
    var sisa = kap - SP.transaksi.terpesan(tgl);
    if (qty > sisa) {
      return { ok: false, msg: 'Kuota kunjungan tanggal ' + U.dMY(tgl) + ' tidak mencukupi (sisa ' + Math.max(sisa, 0) + ' tiket). Silakan pilih tanggal lain.' };
    }

    var d = SP.db.edit(), ses = SP.session.get();
    var idUser = ses && ses.type === 'customer' ? ses.id_user : null;
    var lowerMail = email.toLowerCase(), cust = null;
    for (var i = 0; i < d.customer.length; i++) {
      if (String(d.customer[i].email || '').toLowerCase() === lowerMail) { cust = d.customer[i]; break; }
    }
    var idCust;
    if (cust) {
      idCust = cust.id_cust;
      if (idUser && !cust.id_user) cust.id_user = idUser;
    } else {
      idCust = uniqueId('CUST', function (x) { return !!byId(d.customer, 'id_cust', x); });
      d.customer.push({ id_cust: idCust, id_user: idUser || null, nama_cust: nama, no_hp: p.no_hp || null, email: email });
    }
    var no = uniqueId('WP', function (x) { return !!byId(d.transaksi, 'no_tiket', x); });
    var total = Number(layanan.harga) * qty;
    d.transaksi.push({
      no_tiket: no, tanggal: U.now(), tgl_kunjungan: tgl, id_cust: idCust, id_admin: null,
      total_bayar: total, jum_bayar: total, changes: 0, metode_bayar: metode, bukti_bayar: null,
      jumlah_tiket: qty, status: metode === 'Cash' ? 'aktif' : 'menunggu_pembayaran', kode_qr: no, catatan: null, created_at: U.now()
    });
    d.seq.detail++;
    d.detail_transaksi.push({ id_detail: d.seq.detail, no_tiket: no, id_layanan: layanan.id_layanan, qty: qty, harga_satuan: layanan.harga, subtotal: total });
    if (!SP.db.save(d)) return { ok: false, msg: 'Gagal menyimpan pesanan!' };
    return { ok: true, no_tiket: no };
  };

  /* ================= POS (penjualan loket oleh staf) ================= */
  SP.pos = {
    simpan: function (p) {
      var ses = SP.session.get();
      if (!ses || ses.type !== 'staff') return { ok: false, msg: 'Sesi berakhir, silakan login ulang.' };
      if (!p.cart || !p.cart.length) return { ok: false, msg: 'Data kosong!' };
      var d = SP.db.edit(), total = 0, jumlah = 0, items = [];
      for (var i = 0; i < p.cart.length; i++) {
        var it = p.cart[i], l = byId(d.layanan, 'id_layanan', it.id), q = parseInt(it.qty, 10);
        if (!l || !(q >= 1)) return { ok: false, msg: 'Item keranjang tidak valid!' };
        var sub = Number(l.harga) * q; // harga selalu diambil dari data layanan, bukan dari klien
        total += sub; jumlah += q;
        items.push({ id_layanan: l.id_layanan, qty: q, harga_satuan: l.harga, subtotal: sub });
      }
      var bayar = Math.round(Number(p.jum_bayar) || 0);
      if (bayar < total) return { ok: false, msg: 'Jumlah bayar kurang! Total: ' + U.rp(total) };
      var no = uniqueId('WP', function (x) { return !!byId(d.transaksi, 'no_tiket', x); });
      var idCust = uniqueId('CUST', function (x) { return !!byId(d.customer, 'id_cust', x); });
      d.customer.push({ id_cust: idCust, id_user: null, nama_cust: (p.nama_cust && String(p.nama_cust).trim()) || 'Walk-in Customer', no_hp: (p.no_hp && String(p.no_hp).trim()) || null, email: null });
      d.transaksi.push({
        no_tiket: no, tanggal: U.now(), tgl_kunjungan: U.today(), id_cust: idCust, id_admin: ses.id_admin,
        total_bayar: total, jum_bayar: bayar, changes: bayar - total, metode_bayar: 'Cash', bukti_bayar: null,
        jumlah_tiket: jumlah, status: 'aktif', kode_qr: no, catatan: null, created_at: U.now()
      });
      items.forEach(function (it) { d.seq.detail++; it.id_detail = d.seq.detail; it.no_tiket = no; d.detail_transaksi.push(it); });
      if (!SP.db.save(d)) return { ok: false, msg: 'Gagal menyimpan!' };
      return { ok: true, no_tiket: no };
    }
  };

  /* ================= DATA DEMO ================= */
  SP.demo = function () {
    var d = SP.db.edit(), now = new Date(), n = 0;
    var names = ['Budi Santoso', 'Siti Rahmawati', 'Hendra Wijaya', 'Dewi Lestari', 'Agus Pratama', 'Rina Marlina', 'Dedi Kurniawan', 'Nina Sari', 'Eko Prasetyo', 'Lia Amelia'];
    var staff = ['M001', 'M002'], metode = ['Cash', 'Transfer', 'Online'];
    for (var day = 6; day >= 0; day--) {
      var count = 2 + (day % 3) + 1;
      for (var k = 0; k < count; k++) {
        var dt = new Date(now.getFullYear(), now.getMonth(), now.getDate() - day, 9 + k, 10 + k * 7, 0);
        var l = d.layanan[(day + k) % d.layanan.length];
        var qty = 1 + ((day + k) % 4);
        var cid = 'CUSTDEMO' + (++n);
        var nm = names[(day * 3 + k) % names.length];
        d.customer.push({ id_cust: cid, id_user: null, nama_cust: nm, no_hp: '0812' + (30000000 + n * 137), email: k % 2 ? nm.split(' ')[0].toLowerCase() + n + '@mail.com' : null });
        var no = 'WP' + ymd(dt).replace(/-/g, '') + pad2(dt.getHours()) + pad2(dt.getMinutes()) + '00' + pad2(10 + n);
        var pending = day <= 1 && k === 0; // 2 transaksi contoh yang menunggu verifikasi
        var m = pending ? (day === 0 ? 'Transfer' : 'Online') : metode[(day + k) % 3], total = l.harga * qty;
        var status = pending ? 'menunggu_pembayaran' : (day > 2 && k === 0 ? 'digunakan' : 'aktif');
        d.transaksi.push({
          no_tiket: no, tanggal: ymd(dt) + ' ' + pad2(dt.getHours()) + ':' + pad2(dt.getMinutes()) + ':00', tgl_kunjungan: ymd(dt),
          id_cust: cid, id_admin: m === 'Cash' ? staff[k % 2] : null, total_bayar: total, jum_bayar: total, changes: 0, metode_bayar: m,
          bukti_bayar: null, jumlah_tiket: qty, status: status, kode_qr: no, catatan: 'DEMO', created_at: U.now()
        });
        d.seq.detail++;
        d.detail_transaksi.push({ id_detail: d.seq.detail, no_tiket: no, id_layanan: l.id_layanan, qty: qty, harga_satuan: l.harga, subtotal: total });
      }
    }
    return SP.db.save(d);
  };
})(window);
