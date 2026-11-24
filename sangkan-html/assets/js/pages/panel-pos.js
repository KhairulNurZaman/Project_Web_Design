(function () {
  'use strict';
  var U = SP.util, esc = U.esc, P = SP.panel;
  var colors = { weekday: ['#0f4c81', '#e0f0ff'], weekend: ['#f4a61c', '#fffbf0'], promo: ['#dc3545', '#fff5f5'], paket: ['#6f42c1', '#f3e8ff'] };

  function render(ses, el) {
    var layanan = SP.layanan.aktif(), cart = {}, lastNo = '';
    var items = '';
    layanan.forEach(function (l) {
      var c = colors[l.kategori] || colors.weekday;
      items += '<div class="span-6 span-lg-4 produk-item" data-kat="' + esc(l.kategori) + '"><div class="item-card" id="card_' + esc(l.id_layanan) + '" data-act="add" data-id="' + esc(l.id_layanan) + '">' +
        '<div class="flex justify-between items-start mb-1"><span class="ui-badge r-pill" style="background:' + c[1] + ';color:' + c[0] + ';font-size:.65rem;">' + esc(U.ucfirst(l.kategori)) + '</span>' +
        '<i class="ico ico-plus-circle" style="color:' + c[0] + ';font-size:1.1rem;"></i></div><div class="bold t-sm mb-1" style="color:#1a1a2e;">' + esc(l.nama_layanan) + '</div>' +
        '<div class="bold" style="color:' + c[0] + ';">' + U.rp(l.harga) + '</div><div class="t-sm t-muted" style="font-size:.7rem;">/orang</div></div></div>';
    });
    if (!layanan.length) items = '<div class="span-12 t-center t-muted py-5">Belum ada tiket aktif. Minta admin menambahkan layanan.</div>';

    el.innerHTML =
      '<div style="margin-bottom:.75rem;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:.5rem;"><div>' +
      '<h4 class="bold mb-0" style="color:#0f4c81;"><i class="ico ico-cash-coin mr-2"></i>Point of Sale</h4><p class="t-muted t-sm mb-0"><span id="posClock"></span> WIB</p></div>' +
      '<div class="flex gap-2 flex-wrap" id="catBtns"><div class="cat-btn active" data-kat="all">Semua</div><div class="cat-btn" data-kat="weekday">Weekday</div><div class="cat-btn" data-kat="weekend">Weekend</div>' +
      '<div class="cat-btn" data-kat="promo">Promo</div><div class="cat-btn" data-kat="paket">Paket</div></div></div>' +
      '<div class="pos-grid"><div class="pos-left"><div class="grid gap-2" id="produkList">' + items + '</div></div>' +
      '<div class="pos-right"><div class="cart-header"><div class="flex justify-between items-center"><div><i class="ico ico-cart3 mr-2"></i><strong>Keranjang</strong></div>' +
      '<button type="button" data-act="clear" class="ui-btn ui-btn-sm" style="background:rgba(255,255,255,.15);color:#fff;border:none;border-radius:50px;font-size:.75rem;">Kosongkan</button></div></div>' +
      '<div class="p-3 bd-b"><input type="text" class="ui-input ui-input-sm mb-2" id="namaCust" placeholder="Nama Customer (opsional)" maxlength="100" aria-label="Nama customer">' +
      '<input type="text" class="ui-input ui-input-sm" id="noHp" placeholder="No. HP (opsional)" maxlength="15" aria-label="No. HP"></div>' +
      '<div class="cart-body"><div class="empty-cart" id="emptyCart"><i class="ico ico-cart" style="font-size:2.5rem;"></i><p class="mt-2 t-sm">Pilih tiket dari kiri</p></div><div id="cartItems"></div></div>' +
      '<div class="cart-footer"><div class="total-line bd-t pt-2 mb-2"><span class="t-muted t-sm">Subtotal</span><span class="semibold" id="subtotalDisp">Rp 0</span></div>' +
      '<div class="mb-2"><label class="ui-label t-sm semibold mb-1" for="jmlBayar">Jumlah Bayar (Rp)</label><input type="number" class="ui-input ui-input-sm" id="jmlBayar" placeholder="0" min="0">' +
      '<div class="flex justify-between mt-1"><small class="t-muted">Kembali:</small><small class="bold t-success" id="kembaliDisp">Rp 0</small></div></div>' +
      '<div class="flex justify-between items-center py-2 bd-t mb-2"><span class="bold">TOTAL</span><span class="bold" style="font-size:1.2rem;color:#0f4c81;" id="totalDisp">Rp 0</span></div>' +
      '<button type="button" class="btn-bayar" id="btnBayar" data-act="bayar" disabled><i class="ico ico-check-circle mr-2"></i>PROSES PEMBAYARAN</button></div></div></div>' +
      '<div class="ui-modal ui-fade" id="modalSukses" tabindex="-1" data-static><div class="ui-modal-dialog ui-modal-sm"><div class="ui-modal-content r-4 bd-0"><div class="ui-modal-body t-center p-4">' +
      '<div class="mx-auto mb-3 flex items-center justify-center r-circle" style="width:70px;height:70px;background:#d1fae5;"><i class="ico ico-check-lg" style="font-size:2rem;color:#28a745;"></i></div>' +
      '<h5 class="bold">Transaksi Berhasil!</h5><p class="t-muted t-sm" id="modalNoTiket">-</p><div class="flex gap-2">' +
      '<button type="button" class="ui-btn ui-btn-sm ui-btn-outline-secondary r-pill fill" id="btnCetak"><i class="ico ico-printer mr-1"></i>Cetak</button>' +
      '<button type="button" class="ui-btn ui-btn-sm r-pill fill t-white" style="background:#0f4c81;" data-act="baru"><i class="ico ico-plus mr-1"></i>Baru</button></div></div></div></div></div>';

    function clock() { document.getElementById('posClock').textContent = U.hariLengkap(); }
    clock(); setInterval(clock, 30000);

    function totalCart() { return Object.keys(cart).reduce(function (s, k) { return s + cart[k].harga * cart[k].qty; }, 0); }
    function renderCart() {
      var keys = Object.keys(cart), html = '', total = 0;
      document.getElementById('emptyCart').style.display = keys.length ? 'none' : 'flex';
      document.getElementById('btnBayar').disabled = keys.length === 0;
      keys.forEach(function (id) {
        var it = cart[id], sub = it.harga * it.qty; total += sub;
        html += '<div class="cart-item"><div class="fill"><div class="semibold t-sm">' + esc(it.nama) + '</div><div class="t-sm t-muted">' + U.rp(it.harga) + '/orang</div></div>' +
          '<div class="flex items-center gap-1"><div class="qty-btn" data-act="qty-" data-id="' + esc(id) + '">-</div><div class="bold t-sm px-1">' + it.qty + '</div><div class="qty-btn" data-act="qty+" data-id="' + esc(id) + '">+</div></div>' +
          '<div class="t-right" style="min-width:80px;"><div class="bold t-sm" style="color:#0f4c81;">' + U.rp(sub) + '</div><div class="t-danger" style="cursor:pointer;font-size:.7rem;" data-act="remove" data-id="' + esc(id) + '">Hapus</div></div></div>';
      });
      document.querySelectorAll('.item-card').forEach(function (c) { c.classList.remove('in-cart'); });
      keys.forEach(function (id) { var c = document.getElementById('card_' + id); if (c) c.classList.add('in-cart'); });
      document.getElementById('cartItems').innerHTML = html;
      document.getElementById('totalDisp').textContent = U.rp(total);
      document.getElementById('subtotalDisp').textContent = U.rp(total);
      document.getElementById('jmlBayar').value = '';
      var k = document.getElementById('kembaliDisp'); k.textContent = 'Rp 0'; k.style.color = '';
    }
    function hitungKembali() {
      var kembali = (parseInt(document.getElementById('jmlBayar').value, 10) || 0) - totalCart(), k = document.getElementById('kembaliDisp');
      k.textContent = kembali >= 0 ? U.rp(kembali) : 'Kurang ' + U.rp(Math.abs(kembali));
      k.style.color = kembali >= 0 ? '#28a745' : '#dc3545';
    }
    document.getElementById('jmlBayar').addEventListener('input', hitungKembali);
    document.getElementById('catBtns').addEventListener('click', function (e) {
      var b = e.target.closest ? e.target.closest('.cat-btn') : null; if (!b) return;
      document.querySelectorAll('.cat-btn').forEach(function (x) { x.classList.remove('active'); });
      b.classList.add('active');
      var kat = b.getAttribute('data-kat');
      document.querySelectorAll('.produk-item').forEach(function (i) { i.style.display = (kat === 'all' || i.getAttribute('data-kat') === kat) ? '' : 'none'; });
    });

    function resetBtn() { var b = document.getElementById('btnBayar'); b.innerHTML = '<i class="ico ico-check-circle mr-2"></i>PROSES PEMBAYARAN'; b.disabled = !Object.keys(cart).length; }
    P.on(el, {
      add: function (b, id) {
        var l = SP.layanan.get(id); if (!l || l.status !== 'aktif') return;
        if (cart[id]) cart[id].qty++; else cart[id] = { id: id, nama: l.nama_layanan, harga: Number(l.harga), qty: 1 };
        renderCart();
      },
      'qty+': function (b, id) { if (cart[id] && cart[id].qty < 99) { cart[id].qty++; renderCart(); } },
      'qty-': function (b, id) { if (!cart[id]) return; cart[id].qty--; if (cart[id].qty <= 0) delete cart[id]; renderCart(); },
      remove: function (b, id) { delete cart[id]; renderCart(); },
      clear: function () { cart = {}; renderCart(); },
      bayar: function () {
        var keys = Object.keys(cart);
        if (!keys.length) { alert('Keranjang kosong!'); return; }
        var total = totalCart(), bayar = parseInt(document.getElementById('jmlBayar').value, 10) || 0;
        if (bayar < total) { alert('Jumlah bayar kurang! Total: ' + U.rp(total)); return; }
        var btn = document.getElementById('btnBayar'); btn.disabled = true; btn.innerHTML = '<i class="ico ico-hourglass-split mr-2"></i>Memproses...';
        var r = SP.pos.simpan({
          cart: keys.map(function (id) { return { id: id, qty: cart[id].qty }; }), jum_bayar: bayar,
          nama_cust: document.getElementById('namaCust').value, no_hp: document.getElementById('noHp').value
        });
        if (!r.ok) { alert('Error: ' + (r.msg || 'Gagal!')); resetBtn(); return; }
        lastNo = r.no_tiket;
        document.getElementById('modalNoTiket').textContent = 'No: ' + r.no_tiket;
        document.getElementById('btnCetak').onclick = function () { window.open('cetak-struk.html?no=' + encodeURIComponent(lastNo), '_blank'); };
        UI.modal('#modalSukses').show();
      },
      baru: function () {
        UI.modal('#modalSukses').hide();
        cart = {}; document.getElementById('namaCust').value = ''; document.getElementById('noHp').value = '';
        renderCart(); resetBtn();
      }
    });
  }
  P.mount({ roles: ['manajer', 'admin'], active: 'pos', title: 'Point of Sale', render: render });
})();
