(function () {
  'use strict';
  var U = SP.util, esc = U.esc;
  function $(id) { return document.getElementById(id); }

  var no = U.qs('no'), t = no ? SP.transaksi.getJoin(no) : null;
  if (!t) { window.location.replace('pesan.html'); return; }
  var detail = SP.transaksi.detail(no), flash = SP.flash.take();

  var cancelled = t.status === 'dibatalkan';
  var intro;
  if (t.status === 'menunggu_pembayaran') {
    intro = t.metode_bayar === 'Transfer'
      ? 'Silakan lakukan pembayaran dan upload bukti transfer untuk mengaktifkan tiket Anda.'
      : 'Silakan lakukan pembayaran langsung di loket dengan menunjukkan nomor tiket ini.';
  } else if (cancelled) {
    intro = 'Pesanan ini telah dibatalkan dan tiket tidak dapat digunakan.';
  } else {
    intro = 'Tiket Anda telah aktif. Tunjukkan QR code saat masuk ke Sangkan Park.';
  }

  var h = '';
  if (flash.success) h += '<div class="ui-alert ui-alert-success t-center"><i class="ico ico-check-circle mr-2"></i>' + flash.success + '</div>';
  if (flash.error) h += '<div class="ui-alert ui-alert-danger t-center"><i class="ico ico-exclamation-circle mr-2"></i>' + flash.error + '</div>';

  h += '<div class="t-center mb-4"><div class="success-icon"' + (cancelled ? ' style="background:linear-gradient(135deg,#dc3545,#c0392b);box-shadow:0 8px 25px rgba(220,53,69,.4);"' : '') + '><i class="ico ' + (cancelled ? 'ico-x-lg' : 'ico-check-lg') + '"></i></div>' +
    '<h3 class="bold" style="color:#0f4c81;">' + (cancelled ? 'Pesanan Dibatalkan' : 'Pesanan Berhasil Dibuat!') + '</h3><p class="t-muted">' + intro + '</p></div>';

  h += SP.ticketCard(t, detail);

  if (t.status === 'menunggu_pembayaran' && t.metode_bayar === 'Transfer') {
    h += '<div class="ui-card bd-0 elev-sm r-4 mb-4 mx-auto" style="max-width:650px;"><div class="ui-card-body p-4">' +
      '<h5 class="bold mb-3" style="color:#0f4c81;"><i class="ico ico-cloud-upload mr-2"></i>Upload Bukti Pembayaran</h5>' +
      '<div class="warn-box mb-3"><i class="ico ico-bank2 mr-2"></i>Transfer ke: <strong>BRI 1234-5678-9012-3456</strong> A.N PT. Sangkan Park<br>' +
      'Nominal: <strong>' + U.rp(t.total_bayar) + '</strong></div>';
    if (t.bukti_bayar) {
      h += '<div class="ui-alert ui-alert-success t-sm"><i class="ico ico-check-circle mr-1"></i>Bukti pembayaran sudah dikirim. Menunggu verifikasi petugas.</div>' +
        '<div class="t-center"><img src="' + t.bukti_bayar + '" alt="Bukti pembayaran" class="r-3" style="max-height:200px;max-width:100%;"></div>';
    } else {
      h += '<form id="formBukti"><div class="upload-area mb-3" id="uploadArea"><i class="ico ico-image" style="font-size:2rem;color:#dee2e6;"></i>' +
        '<p class="t-muted t-sm mt-2 mb-0">Klik untuk upload bukti transfer</p><p class="t-muted" style="font-size:.72rem;">Format: JPG, PNG (maks. 2MB)</p>' +
        '<input type="file" id="fileUpload" accept="image/*" class="hidden"></div>' +
        '<div id="preview" class="t-center mb-3" style="display:none;"><img id="previewImg" src="" class="r-3" style="max-height:200px;max-width:100%;" alt="Pratinjau"></div>' +
        '<div id="uploadErr" class="ui-alert ui-alert-danger t-sm py-2" style="display:none;"></div>' +
        '<button type="submit" class="ui-btn w-full bold" style="background:#0f4c81;color:#fff;border-radius:50px;"><i class="ico ico-send mr-2"></i>Kirim Bukti Pembayaran</button></form>';
    }
    h += '</div></div>';
  } else if (t.status === 'menunggu_pembayaran') {
    h += '<div class="ui-card bd-0 elev-sm r-4 mb-4 mx-auto" style="max-width:650px;"><div class="ui-card-body p-4">' +
      '<h5 class="bold mb-3" style="color:#0f4c81;"><i class="ico ico-cash-coin mr-2"></i>Bayar di Loket</h5>' +
      '<div class="warn-box"><i class="ico ico-info-circle mr-2"></i>Tunjukkan nomor tiket <strong>' + esc(t.no_tiket) + '</strong> kepada petugas loket dan bayar sebesar <strong>' + U.rp(t.total_bayar) + '</strong>. Tiket aktif setelah pembayaran dikonfirmasi.</div></div></div>';
  }

  h += '<div class="flex flex-wrap gap-3 justify-center mb-4">' +
    '<a href="print-tiket.html?no=' + encodeURIComponent(t.no_tiket) + '" target="_blank" class="ui-btn ui-btn-outline-primary r-pill px-4"><i class="ico ico-printer mr-2"></i>Cetak Tiket</a>' +
    '<a href="pesan.html" class="ui-btn r-pill px-4" style="background:#0f4c81;color:#fff;border:none;"><i class="ico ico-plus-circle mr-2"></i>Pesan Tiket Lain</a>' +
    '<a href="index.html" class="ui-btn ui-btn-outline-secondary r-pill px-4"><i class="ico ico-house mr-2"></i>Ke Beranda</a></div>';
  $('content').innerHTML = h;

  /* ---- upload bukti: validasi + kompres agar muat di penyimpanan browser ---- */
  var form = $('formBukti');
  if (!form) return;
  var file = null;
  function err(msg) { var e = $('uploadErr'); e.textContent = msg; e.style.display = msg ? 'block' : 'none'; }
  $('uploadArea').addEventListener('click', function () { $('fileUpload').click(); });
  $('fileUpload').addEventListener('change', function () {
    err(''); file = this.files && this.files[0] ? this.files[0] : null;
    if (!file) { $('preview').style.display = 'none'; return; }
    if (!/^image\/(jpeg|png|gif)$/.test(file.type)) { err('Format file harus JPG, PNG, atau GIF.'); file = null; this.value = ''; $('preview').style.display = 'none'; return; }
    if (file.size > 2048 * 1024) { err('Ukuran file maksimal 2MB.'); file = null; this.value = ''; $('preview').style.display = 'none'; return; }
    var rd = new FileReader();
    rd.onload = function (ev) { $('previewImg').src = ev.target.result; $('preview').style.display = 'block'; };
    rd.readAsDataURL(file);
  });
  function compress(f, cb) {
    var url = URL.createObjectURL(f), img = new Image();
    img.onload = function () {
      var max = 1000, sc = Math.min(1, max / Math.max(img.width, img.height));
      var c = document.createElement('canvas'); c.width = Math.round(img.width * sc); c.height = Math.round(img.height * sc);
      var ctx = c.getContext('2d'); ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, c.width, c.height); ctx.drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url); cb(c.toDataURL('image/jpeg', 0.75));
    };
    img.onerror = function () { URL.revokeObjectURL(url); cb(null); };
    img.src = url;
  }
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!file) { err('Pilih file bukti pembayaran terlebih dahulu.'); return; }
    compress(file, function (dataUrl) {
      if (!dataUrl) { err('File gambar tidak dapat dibaca.'); return; }
      var cur = SP.transaksi.get(no);
      if (!cur || cur.status !== 'menunggu_pembayaran') {
        SP.flash.set('error', 'Tiket tidak ditemukan atau sudah dikonfirmasi!'); window.location.reload(); return;
      }
      if (SP.transaksi.setBukti(no, dataUrl)) {
        SP.flash.set('success', 'Bukti pembayaran berhasil dikirim!');
        window.location.reload();
      }
    });
  });
})();
