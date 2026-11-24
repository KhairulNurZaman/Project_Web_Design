(function () {
  'use strict';
  var U = SP.util, esc = U.esc;
  function $(id) { return document.getElementById(id); }

  /* ---------- tahun footer ---------- */
  $('tahun').textContent = new Date().getFullYear();

  /* ---------- navbar saat scroll ---------- */
  var nav = $('navbar');
  function onScroll() { nav.classList.toggle('scrolled', window.scrollY > 80); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- smooth scroll ---------- */
  document.addEventListener('click', function (e) {
    var a = e.target.closest ? e.target.closest('a[href^="#"]') : null;
    if (!a) return;
    var href = a.getAttribute('href');
    if (href === '#') { e.preventDefault(); return; }
    var t = document.querySelector(href);
    if (t) {
      e.preventDefault();
      t.scrollIntoView({ behavior: 'smooth', block: 'start' });
      var menu = $('navMenu');
      if (menu && menu.classList.contains('is-open')) { menu.classList.remove('is-open'); var tg = document.querySelector('[data-toggle-menu]'); if (tg) tg.setAttribute('aria-expanded', 'false'); }
    }
  });

  /* ---------- tombol auth di navbar ---------- */
  (function () {
    var s = SP.session.get(), box = $('navAuth'), html = '';
    if (s) {
      if (s.role === 'admin') html += '<a href="panel/index.html" class="nav-btn nav-btn-outline">Dashboard</a>';
      else if (s.role === 'manajer') html += '<a href="panel/index.html" class="nav-btn nav-btn-outline">Manajer</a>';
      else html += '<a href="riwayat.html" class="nav-btn nav-btn-outline">Pesanan Saya</a>';
      html += '<a href="#" id="btnLogout" class="nav-btn nav-btn-ghost">Logout</a>';
    } else {
      html += '<a href="login.html" class="nav-btn nav-btn-ghost"><i class="ico ico-person mr-1"></i>Masuk</a>' +
        '<a href="register.html" class="nav-btn nav-btn-outline">Daftar</a>';
    }
    html += '<a href="pesan.html" class="nav-btn nav-btn-solid">Pesan Tiket</a>';
    box.innerHTML = html;
    var lo = $('btnLogout');
    if (lo) lo.addEventListener('click', function (e) { e.preventDefault(); SP.auth.logout(); window.location.href = 'index.html'; });
  })();

  /* ---------- status buka / tutup (WIB) ---------- */
  function updateStatus() {
    var now = new Date();
    var wib = new Date(now.getTime() + now.getTimezoneOffset() * 60000 + 7 * 3600000);
    var mins = wib.getHours() * 60 + wib.getMinutes();
    var el = $('statusBuka'), open = mins >= 8 * 60 && mins < 17 * 60;
    el.hidden = false;
    el.classList.toggle('open', open);
    el.classList.toggle('closed', !open);
    if (open) el.innerHTML = '<i class="ico ico-circle-fill mr-1"></i>Buka sekarang · tutup 17.00 WIB';
    else if (mins < 8 * 60) el.innerHTML = '<i class="ico ico-circle-fill mr-1"></i>Tutup · buka hari ini 08.00 WIB';
    else el.innerHTML = '<i class="ico ico-circle-fill mr-1"></i>Tutup · buka besok 08.00 WIB';
  }
  updateStatus();
  setInterval(updateStatus, 60000);

  /* ---------- tiket (select, kartu, footer) ---------- */
  var layanan = SP.layanan.aktif();
  (function () {
    var sel = $('quickTiket'), opts = sel.innerHTML;
    layanan.forEach(function (l) {
      opts += '<option value="' + esc(l.id_layanan) + '">' + esc(l.nama_layanan) + ' — ' + U.rp(l.harga) + '</option>';
    });
    sel.innerHTML = opts;
    var tgl = $('quickTgl'); tgl.min = U.today(); tgl.value = U.today();

    var cardClasses = ['', 'featured', 'promo', '', ''], html = '';
    layanan.forEach(function (l, i) {
      var cls = cardClasses[i % cardClasses.length];
      html += '<div class="card-col"><div class="ticket-card ' + cls + '">';
      if (cls === 'featured') html += '<div class="ticket-ribbon" style="background:#f4a61c;">TERLARIS</div>';
      else if (cls === 'promo') html += '<div class="ticket-ribbon" style="background:#dc3545;">PROMO!</div>';
      html += '<div class="ticket-header"><div class="ticket-badge">' + esc(U.ucfirst(l.kategori)) + '</div>' +
        '<h5 class="bold mb-1">' + esc(l.nama_layanan) + '</h5>' +
        '<small class="op-75"><i class="ico ico-clock mr-1"></i>Berlaku seharian</small></div>' +
        '<div class="ticket-body"><div class="price mb-1">' + U.rp(l.harga) + ' <small>/orang</small></div>' +
        '<p class="t-muted t-sm mb-3">' + esc(l.deskripsi || 'Akses penuh semua wahana Sangkan Resort Aqua Park.') + '</p>' +
        '<ul class="list-plain t-sm t-muted mb-3">' +
        '<li class="mb-1"><i class="ico ico-check2 t-success mr-1"></i>Akses semua wahana</li>' +
        '<li class="mb-1"><i class="ico ico-check2 t-success mr-1"></i>Tiket digital QR</li>' +
        '<li class="mb-1"><i class="ico ico-x t-danger mr-1"></i>Tidak dapat di-refund</li></ul>' +
        '<a href="pesan.html?tiket=' + encodeURIComponent(l.id_layanan) + '" class="ui-btn btn-ticket ' + (cls === 'featured' ? 'ui-btn-warning' : 'ui-btn-primary') + '">' +
        '<i class="ico ico-cart-plus mr-1"></i>Pesan Sekarang</a></div></div></div>';
    });
    if (!layanan.length) html = '<div class="span-12 t-center py-5"><p class="t-muted">Tiket belum tersedia. Hubungi kami untuk informasi lebih lanjut.</p></div>';
    $('ticketGrid').innerHTML = html;

    var f = '';
    layanan.forEach(function (l) {
      f += '<li class="mb-2"><a href="pesan.html?tiket=' + encodeURIComponent(l.id_layanan) + '">' + esc(l.nama_layanan) + '</a></li>';
    });
    $('footerTiket').innerHTML = f;
  })();

  /* ---------- wahana & fasilitas ---------- */
  (function () {
    var items = [
      ['ico-tsunami', '#0f4c81', '#e0f0ff', 'Octopus Slide', 'Seluncuran tinggi berbelok-belok yang memacu adrenalin.'],
      ['ico-water', '#00899f', '#e0f8ff', 'Raft Slide', 'Meluncur bersama rakit karet bersama teman dan keluarga.'],
      ['ico-moisture', '#1565c0', '#e3f2fd', 'Kolam Ombak', 'Kolam luas dengan ombak buatan, favorit semua usia.'],
      ['ico-balloon', '#e67e00', '#fff3cd', 'Kiddy Pool', 'Kolam dangkal dengan permainan air khusus anak-anak.'],
      ['ico-emoji-smile', '#c2185b', '#fce4ec', 'Baby Pool', 'Kolam khusus balita, dangkal dan aman diawasi orang tua.'],
      ['ico-tree', '#388e3c', '#e8f5e9', 'Mini Zoo', 'Kebun binatang mini untuk mengenal satwa dengan santai.'],
      ['ico-house-heart', '#6f42c1', '#ede7f6', 'Resort &amp; Penginapan', 'Menginap nyaman di tengah alam, dekat dengan wahana.'],
      ['ico-cup-hot', '#f4a61c', '#fff8e1', 'Resto &amp; Café', 'Kuliner lezat untuk mengisi tenaga setelah bermain air.']
    ];
    var html = '';
    items.forEach(function (it) {
      html += '<div class="span-sm-6 span-lg-3"><div class="wahana-card"><div class="feature-icon" style="background:' + it[2] + ';color:' + it[1] + ';"><i class="ico ' + it[0] + '"></i></div>' +
        '<h6 class="bold">' + it[3] + '</h6><p class="t-muted t-sm mb-0">' + it[4] + '</p></div></div>';
    });
    $('wahanaGrid').innerHTML = html;
  })();

  /* ---------- denah (gambar resmi + keterangan area) ---------- */
  (function () {
    var areas = [
      ['ico-house-heart', '#8d6e63', 'Area Penginapan / Cottages (Sangkan Resort)', 'Cottage dan penginapan resort di bagian utara kawasan, dekat dengan area kolam resort.'],
      ['ico-water', '#00b4d8', 'Kolam Renang Resort', 'Kolam renang untuk tamu resort dengan perosotan kecil.'],
      ['ico-tsunami', '#7e57c2', 'Wahana Seluncuran Raksasa (Water Slides)', 'Deretan seluncuran air raksasa dengan lintasan lurus dan berputar.'],
      ['ico-tree', '#66bb6a', 'Gazebo / Area Istirahat', 'Gazebo di sekeliling kolam untuk beristirahat bersama keluarga.'],
      ['ico-moisture', '#1565c0', 'Kolam Gelombang & Kolam Arus', 'Kolam gelombang utama yang dikelilingi sungai arus.'],
      ['ico-cup-hot', '#f4a61c', 'Kantin / Area Kuliner', 'Kantin dan area kuliner untuk makan dan minum setelah bermain air.'],
      ['ico-balloon', '#ff8a65', 'Kolam Anak & Playground', 'Kolam dangkal dan area bermain khusus anak-anak.'],
      ['ico-water', '#0288d1', 'Kolam Renang Utama (Semi-Olympic)', 'Kolam renang ukuran semi-olimpik dengan jalur lintasan.']
    ], legend = [
      ['#1e88e5', 'Kolam Renang'], ['#8e24aa', 'Wahana & Seluncuran'], ['#8d6e63', 'Penginapan'], ['#f4a61c', 'Kantin / F&B'], ['#3949ab', 'Fasilitas Umum']
    ], h = '', l = '';
    areas.forEach(function (a, i) {
      h += '<div class="denah-area"><div class="denah-ico" style="background:' + a[1] + ';"><i class="ico ' + a[0] + '"></i></div>' +
        '<div><div class="semibold">' + (i + 1) + '. ' + esc(a[2]) + '</div><div class="t-muted t-sm">' + esc(a[3]) + '</div></div></div>';
    });
    legend.forEach(function (x) { l += '<span class="legend-item"><span class="legend-dot" style="background:' + x[0] + ';"></span>' + esc(x[1]) + '</span>'; });
    $('denahAreas').innerHTML = h; $('denahLegend').innerHTML = l;
  })();

  /* ---------- cara pesan ---------- */
  (function () {
    var steps = [
      ['ico-cursor', '#0f4c81', 'Pilih Tiket', 'Pilih jenis tiket dan tanggal kunjungan yang diinginkan'],
      ['ico-person-fill-add', '#f4a61c', 'Isi Data Diri', 'Masukkan nama, email, dan jumlah tiket yang dipesan'],
      ['ico-credit-card', '#00b4d8', 'Lakukan Pembayaran', 'Bayar via Transfer Bank atau langsung di Loket'],
      ['ico-qr-code', '#28a745', 'Tunjukkan Tiket', 'Tunjukkan QR Code tiket saat masuk ke Sangkan Park']
    ], html = '';
    steps.forEach(function (st, i) {
      html += '<div class="span-sm-6 span-lg-3"><div class="t-center p-4">' +
        '<div class="mx-auto mb-3 flex items-center justify-center" style="width:70px;height:70px;border-radius:50%;background:' + st[1] + '20;color:' + st[1] + ';font-size:1.8rem;position:relative;">' +
        '<i class="ico ' + st[0] + '"></i>' +
        '<div style="position:absolute;top:-5px;right:-5px;width:24px;height:24px;background:' + st[1] + ';border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-size:.7rem;font-weight:700;">' + (i + 1) + '</div></div>' +
        '<h6 class="bold mb-2">' + st[2] + '</h6><p class="t-muted t-sm">' + st[3] + '</p></div></div>';
    });
    $('stepsGrid').innerHTML = html;
  })();

  /* ---------- testimoni ---------- */
  (function () {
    var rv = [
      ['Budi Santoso', 'Bandung', 5, 'Wahana airnya seru banget! Anak-anak happy, orang tua pun senang. Pemesanan online juga mudah banget, langsung dapat QR code-nya.'],
      ['Siti Rahmawati', 'Jakarta', 5, 'Pertama kali ke Sangkan Park, langsung jatuh cinta. Tempatnya bersih, wahana lengkap, staff ramah. Pasti balik lagi!'],
      ['Hendra Wijaya', 'Cirebon', 4, 'Harga tiketnya terjangkau untuk kualitas yang ditawarkan. Sistem e-ticketing bikin antrian masuk jadi lebih cepat. Recommended!']
    ], html = '';
    rv.forEach(function (r) {
      html += '<div class="span-md-4"><div class="testimonial-card"><div class="stars mb-2">' + new Array(r[2] + 1).join('★') + '</div>' +
        '<p class="t-muted t-sm mb-3">"' + esc(r[3]) + '"</p><div class="flex items-center gap-2">' +
        '<div class="r-circle flex items-center justify-center t-white bold" style="width:36px;height:36px;background:#0f4c81;flex-shrink:0;">' + esc(r[0].charAt(0)) + '</div>' +
        '<div><div class="bold t-sm">' + esc(r[0]) + '</div><div class="t-muted" style="font-size:.75rem;"><i class="ico ico-geo-alt mr-1"></i>' + esc(r[1]) + '</div></div></div></div></div>';
    });
    $('reviewGrid').innerHTML = html;
  })();

  /* ---------- FAQ ---------- */
  (function () {
    var faq = [
      ['Jam berapa Sangkan Resort Aqua Park buka?', 'Kami buka setiap hari pukul 08.00 - 17.00 WIB. Tiket berlaku seharian sesuai tanggal kunjungan yang dipilih.'],
      ['Bagaimana cara memesan tiket online?', 'Pilih jenis tiket dan tanggal kunjungan, isi data pemesan, pilih metode pembayaran, lalu konfirmasi pesanan. Nomor tiket dan QR Code langsung tampil di halaman tiket Anda.'],
      ['Metode pembayaran apa saja yang tersedia?', 'Transfer Bank (unggah bukti transfer setelah memesan) atau Bayar di Tempat langsung di loket. Tiket aktif setelah pembayaran dikonfirmasi petugas.'],
      ['Apakah tiket bisa di-refund?', 'Tiket tidak dapat di-refund. Pastikan tanggal kunjungan sudah sesuai sebelum mengonfirmasi pesanan.'],
      ['Apakah anak kecil perlu membeli tiket?', 'Anak di bawah 3 tahun gratis. Untuk anak usia 3-12 tahun tersedia Tiket Anak dengan harga khusus.'],
      ['Bagaimana cara masuk dengan e-tiket?', 'Tunjukkan QR Code tiket (dari layar ponsel atau hasil cetak) kepada petugas di pintu masuk. Petugas akan memverifikasi dan melakukan check-in.'],
      ['Saya lupa nomor tiket, bagaimana?', 'Masuk ke akun Anda lalu buka menu Pesanan Saya. Jika memesan tanpa akun, hubungi kami dengan menyebutkan nama dan email pemesan.']
    ], html = '';
    faq.forEach(function (f, i) {
      html += '<div class="ui-acc-item"><h2 class="ui-acc-header"><button class="ui-acc-button' + (i ? ' is-collapsed' : '') + '" type="button" data-acc="faq' + i + '" aria-expanded="' + (i ? 'false' : 'true') + '" aria-controls="faq' + i + '">' + esc(f[0]) + '</button></h2>' +
        '<div id="faq' + i + '" class="ui-collapse' + (i ? '' : ' is-open') + '"><div class="ui-acc-body t-muted t-sm">' + esc(f[1]) + '</div></div></div>';
    });
    $('faqAcc').innerHTML = html;
  })();

  /* ---------- cek tiket ---------- */
  $('formCek').addEventListener('submit', function (e) {
    e.preventDefault();
    var no = $('cekNo').value.trim(), msg = $('cekMsg');
    if (!no) { msg.textContent = 'Masukkan nomor tiket terlebih dahulu.'; msg.hidden = false; return; }
    var t = SP.transaksi.get(no) || SP.transaksi.get(no.toUpperCase());
    if (!t) { msg.textContent = 'Nomor tiket tidak ditemukan. Periksa kembali nomor tiket Anda.'; msg.hidden = false; return; }
    msg.hidden = true;
    window.location.href = 'tiket.html?no=' + encodeURIComponent(t.no_tiket);
  });

  /* ---------- form kontak ---------- */
  $('formKontak').addEventListener('submit', function (e) {
    e.preventDefault();
    var nama = $('kNama').value.trim(), email = $('kEmail').value.trim(), subjek = $('kSubjek').value.trim(), isi = $('kPesan').value.trim();
    var box = $('kontakAlert');
    function show(type, text) {
      box.className = 'ui-alert ui-alert-' + type + ' t-sm py-2';
      box.innerHTML = text; box.hidden = false;
    }
    if (!nama || !email || !isi) return show('danger', '<i class="ico ico-exclamation-circle mr-1"></i>Nama, email, dan pesan wajib diisi.');
    if (!U.isEmail(email)) return show('danger', '<i class="ico ico-exclamation-circle mr-1"></i>Format email tidak valid.');
    if (SP.pesan.add(nama, email, subjek, isi)) {
      show('success', '<i class="ico ico-check-circle mr-1"></i>Terima kasih, pesan Anda sudah terkirim. Kami akan segera menghubungi Anda.');
      $('formKontak').reset();
    }
  });
})();
