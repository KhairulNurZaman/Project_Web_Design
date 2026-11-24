(function () {
  'use strict';
  var U = SP.util, esc = U.esc;
  function $(id) { return document.getElementById(id); }

  var ses = SP.session.get();
  $('topAuth').innerHTML = (ses && ses.type === 'customer')
    ? '<a href="riwayat.html" class="ui-btn ui-btn-sm ui-btn-outline-light"><i class="ico ico-clock-history mr-1"></i>Riwayat</a><a href="#" id="btnLogout" class="ui-btn ui-btn-sm ui-btn-light t-primary">Logout</a>'
    : '<a href="login.html" class="ui-btn ui-btn-sm ui-btn-outline-light">Login</a><a href="register.html" class="ui-btn ui-btn-sm ui-btn-warning">Daftar</a>';
  var lo = $('btnLogout');
  if (lo) lo.addEventListener('click', function (e) { e.preventDefault(); SP.auth.logout(); window.location.href = 'index.html'; });

  var flash = SP.flash.take();
  if (flash.error) $('flashBox').innerHTML = '<div class="ui-alert ui-alert-danger"><i class="ico ico-exclamation-circle mr-2"></i>' + flash.error + '</div>';

  var colors = {
    weekday: 'linear-gradient(135deg,#0f4c81,#1565c0)',
    weekend: 'linear-gradient(135deg,#f4a61c,#e67e00)',
    promo: 'linear-gradient(135deg,#dc3545,#c0392b)',
    paket: 'linear-gradient(135deg,#6f42c1,#563d7c)'
  };
  var layanan = SP.layanan.aktif(), selected = { id: '', nama: '', harga: 0 };

  var html = '';
  layanan.forEach(function (l) {
    var grad = colors[l.kategori] || colors.weekday;
    html += '<div class="span-sm-6 ticket-item" data-kat="' + esc(l.kategori) + '"><div class="ticket-card h-full" data-id="' + esc(l.id_layanan) + '" id="card_' + esc(l.id_layanan) + '">' +
      '<div class="ticket-head" style="background:' + grad + '"><span class="badge-kat">' + esc(U.ucfirst(l.kategori)) + '</span>' +
      '<h5 class="bold mt-1 mb-0">' + esc(l.nama_layanan) + '</h5></div>' +
      '<div class="ticket-body"><div class="price-big mb-1">' + U.rp(l.harga) + '</div>' +
      '<p class="t-muted t-sm mb-3">' + esc(l.deskripsi || 'Akses penuh semua wahana Sangkan Park.') + '</p>' +
      '<ul class="list-plain t-sm t-muted mb-3">' +
      '<li><i class="ico ico-check2 t-success mr-1"></i>Akses semua wahana</li>' +
      '<li><i class="ico ico-check2 t-success mr-1"></i>Berlaku 1 hari</li>' +
      '<li><i class="ico ico-x t-danger mr-1"></i>Tidak dapat di-refund</li></ul>' +
      '<button type="button" class="btn-select"><i class="ico ico-cart-plus mr-1"></i>Pilih Tiket</button></div></div></div>';
  });
  if (!layanan.length) html = '<div class="span-12 t-center py-5"><p class="t-muted">Belum ada tiket tersedia.</p></div>';
  $('ticketList').innerHTML = html;

  var tgl = $('tgl_kunjungan'); tgl.min = U.today(); tgl.value = U.today();

  function hitungTotal() {
    var q = parseInt($('qty_input').value, 10) || 1;
    $('s_total').textContent = U.rp(selected.harga * q);
  }
  function selectTicket(id) {
    var l = null; layanan.forEach(function (x) { if (x.id_layanan === id) l = x; });
    if (!l) return;
    document.querySelectorAll('.ticket-card').forEach(function (c) { c.classList.remove('selected'); });
    var card = $('card_' + id); if (card) card.classList.add('selected');
    selected = { id: l.id_layanan, nama: l.nama_layanan, harga: Number(l.harga) };
    $('summaryEmpty').style.display = 'none';
    $('summaryContent').style.display = 'block';
    $('s_nama').textContent = l.nama_layanan;
    $('s_harga').textContent = U.rp(l.harga);
    hitungTotal();
  }
  function clampQty() {
    var v = parseInt($('qty_input').value, 10);
    if (!(v >= 1)) v = 1; if (v > 20) v = 20;
    $('qty_input').value = v; hitungTotal();
  }

  $('ticketList').addEventListener('click', function (e) {
    var c = e.target.closest ? e.target.closest('.ticket-card') : null;
    if (c) selectTicket(c.getAttribute('data-id'));
  });
  $('qtyMinus').addEventListener('click', function () { $('qty_input').value = (parseInt($('qty_input').value, 10) || 1) - 1; clampQty(); });
  $('qtyPlus').addEventListener('click', function () { $('qty_input').value = (parseInt($('qty_input').value, 10) || 1) + 1; clampQty(); });
  $('qty_input').addEventListener('change', clampQty);
  $('qty_input').addEventListener('input', hitungTotal);

  $('btnCheckout').addEventListener('click', function () {
    if (!selected.id) { alert('Pilih tiket terlebih dahulu!'); return; }
    clampQty();
    var t = tgl.value || U.today();
    if (t < U.today()) { alert('Tanggal kunjungan tidak boleh sebelum hari ini.'); return; }
    window.location.href = 'checkout.html?tiket=' + encodeURIComponent(selected.id) + '&qty=' + encodeURIComponent($('qty_input').value) + '&tgl=' + encodeURIComponent(t);
  });

  document.querySelectorAll('#catPills .cat-pill').forEach(function (p) {
    p.addEventListener('click', function () {
      var kat = p.getAttribute('data-kat');
      document.querySelectorAll('#catPills .cat-pill').forEach(function (x) { x.classList.remove('active'); });
      p.classList.add('active');
      document.querySelectorAll('.ticket-item').forEach(function (it) {
        it.style.display = (kat === 'all' || it.getAttribute('data-kat') === kat) ? '' : 'none';
      });
    });
  });

  // prapilih dari landing page (?tiket=&qty=&tgl=)
  var qt = U.qs('tiket');
  if (qt) {
    var q = parseInt(U.qs('qty'), 10); if (q >= 1) $('qty_input').value = Math.min(q, 20);
    var d = U.qs('tgl'); if (/^\d{4}-\d{2}-\d{2}$/.test(d) && d >= U.today()) tgl.value = d;
    selectTicket(qt);
  }
})();
