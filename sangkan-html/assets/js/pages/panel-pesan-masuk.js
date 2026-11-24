(function () {
  'use strict';
  var U = SP.util, esc = U.esc, P = SP.panel;

  function render(ses, el) {
    var list = SP.pesan.all(), unread = SP.pesan.unread(), h = '';
    if (!list.length) {
      h = '<div class="panel-card p-5 t-center t-muted"><i class="ico ico-envelope" style="font-size:3rem;"></i><p class="mt-3 mb-0">Belum ada pesan masuk dari formulir kontak.</p></div>';
    } else {
      list.forEach(function (m) {
        h += '<div class="panel-card mb-3' + (m.dibaca ? '' : ' unread') + '"><div class="p-3"><div class="flex justify-between items-start flex-wrap gap-2">' +
          '<div><div class="bold">' + esc(m.subjek || '(Tanpa subjek)') + (m.dibaca ? '' : ' <span class="ui-badge bgc-warning t-dark ml-1">Baru</span>') + '</div>' +
          '<div class="t-sm t-muted">' + esc(m.nama) + ' · <a href="mailto:' + esc(m.email) + '">' + esc(m.email) + '</a> · ' + U.dMYHi(m.created_at) + '</div></div>' +
          '<div class="flex gap-1">' +
          '<button type="button" class="ui-btn ui-btn-sm btn-outline-' + (m.dibaca ? 'secondary' : 'success') + ' r-pill py-0 px-2" data-act="toggle" data-id="' + m.id + '">' + (m.dibaca ? '<i class="ico ico-envelope mr-1"></i>Tandai belum dibaca' : '<i class="ico ico-check2 mr-1"></i>Tandai dibaca') + '</button>' +
          '<button type="button" class="ui-btn ui-btn-sm ui-btn-outline-danger r-pill py-0 px-2" data-act="hapus" data-id="' + m.id + '" aria-label="Hapus"><i class="ico ico-trash"></i></button></div></div>' +
          '<p class="mb-0 mt-2 t-sm" style="white-space:pre-wrap;">' + esc(m.pesan) + '</p></div></div>';
      });
    }
    el.innerHTML = '<div class="mb-4"><h4 class="bold mb-0" style="color:#0f4c81;"><i class="ico ico-envelope mr-2"></i>Pesan Masuk</h4>' +
      '<p class="t-muted t-sm mb-0">Pesan dari formulir kontak di halaman utama (' + list.length + ' pesan, ' + unread + ' belum dibaca)</p></div>' + h;
    P.on(el, {
      toggle: function (b, id) {
        var n = parseInt(id, 10), cur = null; list.forEach(function (m) { if (m.id === n) cur = m; });
        if (cur) { SP.pesan.setRead(n, !cur.dibaca); window.location.reload(); }
      },
      hapus: function (b, id) {
        if (!confirm('Hapus pesan ini?')) return;
        SP.pesan.remove(parseInt(id, 10)); P.flashReload('success', 'Pesan berhasil dihapus.');
      }
    });
  }
  P.mount({ roles: ['admin'], active: 'pesan-masuk', title: 'Pesan Masuk', render: render });
})();
