(function () {
  'use strict';
  var U = SP.util, esc = U.esc, P = SP.panel;

  function render(ses, el) {
    var custId = U.qs('cust'), list = SP.transaksi.allJoin(), rows = '', custInfo = '';
    if (custId) {
      var cu = SP.customer.get(custId);
      list = list.filter(function (t) { return t.id_cust === custId; });
      custInfo = '<div class="ui-alert ui-alert-info flex justify-between items-center py-2 t-sm"><span><i class="ico ico-funnel mr-2"></i>Menampilkan transaksi customer: <strong>' +
        esc(cu ? cu.nama_cust : custId) + '</strong></span><a href="transaksi.html" class="ui-btn ui-btn-sm ui-btn-outline-primary r-pill py-0">Tampilkan semua</a></div>';
    }
    if (!list.length) rows = '<tr><td colspan="8" class="t-center py-5 t-muted"><i class="ico ico-inbox" style="font-size:2rem;"></i><p class="mt-2">Belum ada transaksi.</p></td></tr>';
    list.forEach(function (t) {
      rows += '<tr data-status="' + esc(t.status) + '"><td class="pl-3 mono t-sm bold" style="color:#0f4c81;">' + esc(t.no_tiket) + '</td>' +
        '<td class="t-sm">' + esc(t.nama_cust || 'Guest') + '</td><td class="t-sm t-muted">' + U.dmYHi(t.tanggal) + '</td>' +
        '<td class="t-sm">' + (t.tgl_kunjungan ? U.dmY(t.tgl_kunjungan) : '-') + '</td>' +
        '<td class="t-sm"><span class="ui-badge r-pill" style="background:#e0f0ff;color:#0f4c81;">' + esc(t.metode_bayar) + '</span></td>' +
        '<td class="t-sm semibold">' + U.rp(t.total_bayar) + '</td><td>' + P.badge(t.status) + '</td>' +
        '<td class="pr-3"><div class="flex gap-1"><a href="detail-transaksi.html?no=' + encodeURIComponent(t.no_tiket) + '" class="ui-btn btn-xs ui-btn-outline-primary r-pill py-0 px-2 t-sm">Detail</a>' +
        (t.status === 'menunggu_pembayaran' ? '<button type="button" data-act="verif" data-id="' + esc(t.no_tiket) + '" class="ui-btn btn-xs ui-btn-success r-pill py-0 px-2 t-sm t-white">Verif</button>' : '') +
        '</div></td></tr>';
    });
    el.innerHTML =
      '<div class="flex justify-between items-center mb-4 flex-wrap gap-2"><div><h4 class="bold mb-0" style="color:#0f4c81;"><i class="ico ico-receipt mr-2"></i>Data Transaksi</h4>' +
      '<p class="t-muted t-sm mb-0">Semua data pesanan e-ticketing</p></div><div class="flex gap-2">' +
      '<input type="text" class="ui-input ui-input-sm" id="searchInput" placeholder="Cari no. tiket / customer..." style="min-width:220px;border-radius:50px;" aria-label="Cari"></div></div>' +
      custInfo + '<div class="flex gap-2 mb-3 flex-wrap" id="filterBtns">' +
      '<button type="button" class="ui-btn ui-btn-sm r-pill active-filter" style="background:#0f4c81;color:#fff;border:none;" data-s="all">Semua</button>' +
      '<button type="button" class="ui-btn ui-btn-sm ui-btn-outline-warning r-pill" data-s="menunggu_pembayaran">Menunggu Bayar</button>' +
      '<button type="button" class="ui-btn ui-btn-sm ui-btn-outline-success r-pill" data-s="aktif">Aktif</button>' +
      '<button type="button" class="ui-btn ui-btn-sm ui-btn-outline-primary r-pill" data-s="digunakan">Digunakan</button>' +
      '<button type="button" class="ui-btn ui-btn-sm ui-btn-outline-danger r-pill" data-s="dibatalkan">Dibatalkan</button></div>' +
      '<div class="panel-card"><div class="ui-table-wrap"><table class="ui-table ui-table-hover v-middle mb-0" id="tblTransaksi">' +
      P.thead(['No. Tiket', 'Customer', 'Tanggal', 'Kunjungan', 'Metode', 'Total', 'Status', { t: 'Aksi', last: true }]) + '<tbody>' + rows + '</tbody></table></div></div>';

    var cur = 'all';
    function apply() {
      var q = document.getElementById('searchInput').value.toLowerCase();
      document.querySelectorAll('#tblTransaksi tbody tr[data-status]').forEach(function (r) {
        var okS = cur === 'all' || r.getAttribute('data-status') === cur;
        r.style.display = (okS && r.textContent.toLowerCase().indexOf(q) !== -1) ? '' : 'none';
      });
    }
    document.getElementById('searchInput').addEventListener('input', apply);
    document.getElementById('filterBtns').addEventListener('click', function (e) {
      var b = e.target.closest ? e.target.closest('button[data-s]') : null; if (!b) return;
      document.querySelectorAll('.active-filter').forEach(function (x) { x.classList.remove('active-filter'); x.style.background = ''; x.style.color = ''; x.style.border = ''; });
      b.classList.add('active-filter'); b.style.background = '#0f4c81'; b.style.color = '#fff'; b.style.border = 'none';
      cur = b.getAttribute('data-s'); apply();
    });
    P.on(el, {
      verif: function (b, no) {
        if (!confirm('Verifikasi pembayaran ini?')) return;
        var t = SP.transaksi.get(no);
        if (!t) { P.flashReload('error', 'Transaksi tidak ditemukan!'); return; }
        if (t.status !== 'menunggu_pembayaran') { P.flashReload('error', 'Transaksi ini tidak berstatus menunggu pembayaran.'); return; }
        SP.transaksi.setStatus(no, 'aktif');
        P.flashTo('success', 'Pembayaran berhasil diverifikasi! Tiket sekarang aktif.', 'detail-transaksi.html?no=' + encodeURIComponent(no));
      }
    });
  }
  P.mount({ roles: ['admin', 'manajer'], active: 'transaksi', title: 'Data Transaksi', render: render });
})();
