(function () {
  'use strict';
  var U = SP.util, esc = U.esc, P = SP.panel;

  function field(label, id, icon, type, ph, req) {
    return '<div class="mb-3"><label class="ui-label semibold t-sm" for="' + id + '">' + label + (req ? ' <span class="t-danger">*</span>' : '') + '</label>' +
      (icon ? '<div class="ui-group"><span class="ui-group-text"><i class="ico ' + icon + '"></i></span>' : '') +
      '<input type="' + type + '" class="ui-input" id="' + id + '"' + (req ? ' required' : '') + ' placeholder="' + ph + '" maxlength="100">' + (icon ? '</div>' : '') + '</div>';
  }

  function render(ses, el) {
    var cust = SP.customer.allWithCount(), users = SP.user.all(), walkin = cust.filter(function (c) { return !c.email; }).length;
    var rows = '';
    if (!cust.length) rows = '<tr><td colspan="7" class="t-center py-5 t-muted"><i class="ico ico-people" style="font-size:2.5rem;"></i><p class="mt-2 mb-0">Belum ada data customer.</p></td></tr>';
    cust.forEach(function (c, i) {
      var j = c.jml_transaksi || 0;
      rows += '<tr class="cust-row" data-search="' + esc(((c.nama_cust || '') + ' ' + (c.no_hp || '') + ' ' + (c.email || '')).toLowerCase()) + '">' +
        '<td class="pl-3 t-muted">' + (i + 1) + '</td><td><div class="flex items-center gap-2">' +
        '<div class="r-circle flex items-center justify-center bold" style="width:36px;height:36px;background:#0f4c81;color:#fff;font-size:.85rem;flex-shrink:0;">' + esc(U.initial(c.nama_cust)) + '</div>' +
        '<div><div class="semibold">' + esc(c.nama_cust || '-') + '</div><div class="t-muted" style="font-size:.72rem;font-family:monospace;">' + esc(c.id_cust) + '</div></div></div></td>' +
        '<td>' + esc(c.no_hp || '-') + '</td><td class="t-muted">' + esc(c.email || '-') + '</td>' +
        '<td class="t-center"><span class="ui-badge r-pill" style="background:#e0f0ff;color:#0f4c81;">' + j + ' transaksi</span></td>' +
        '<td class="semibold">' + (c.total_belanja > 0 ? U.rp(c.total_belanja) : '-') + '</td>' +
        '<td class="pr-3"><div class="flex gap-1 justify-center">' +
        '<button type="button" class="ui-btn ui-btn-sm ui-btn-outline-primary r-pill py-0 px-2" title="Edit" data-act="edit" data-id="' + esc(c.id_cust) + '"><i class="ico ico-pencil"></i></button>' +
        '<a href="transaksi.html?cust=' + encodeURIComponent(c.id_cust) + '" class="ui-btn ui-btn-sm ui-btn-outline-info r-pill py-0 px-2" title="Lihat Transaksi"><i class="ico ico-receipt"></i></a>' +
        (j === 0
          ? '<button type="button" class="ui-btn ui-btn-sm ui-btn-outline-danger r-pill py-0 px-2" title="Hapus" data-act="hapus" data-id="' + esc(c.id_cust) + '"><i class="ico ico-trash"></i></button>'
          : '<button type="button" class="ui-btn ui-btn-sm ui-btn-outline-secondary r-pill py-0 px-2" title="Tidak bisa dihapus - memiliki riwayat transaksi" data-act="nohapus" data-id="' + esc(c.id_cust) + '" style="cursor:not-allowed;"><i class="ico ico-trash"></i></button>') +
        '</div></td></tr>';
    });
    var urows = '';
    if (!users.length) urows = '<tr><td colspan="5" class="t-center py-4 t-muted">Belum ada akun user terdaftar.</td></tr>';
    users.forEach(function (u, i) {
      urows += '<tr><td class="pl-3 t-muted">' + (i + 1) + '</td><td><div class="flex items-center gap-2">' +
        '<div class="r-circle flex items-center justify-center bold" style="width:34px;height:34px;background:#28a745;color:#fff;font-size:.8rem;flex-shrink:0;">' + esc(U.initial(u.nama_lengkap)) + '</div>' +
        '<span class="semibold">' + esc(u.nama_lengkap) + '</span></div></td><td class="t-muted">' + esc(u.email) + '</td><td>' + esc(u.no_telp || '-') + '</td>' +
        '<td class="t-muted pr-3">' + U.dMY(u.created_at) + '</td></tr>';
    });

    el.innerHTML =
      '<div class="flex justify-between items-center mb-4"><div><h4 class="bold mb-0" style="color:#0f4c81;"><i class="ico ico-people mr-2"></i>Data Customer</h4>' +
      '<p class="t-muted t-sm mb-0">Manajemen data pemesan tiket Sangkan Park</p></div>' +
      '<button type="button" class="ui-btn semibold" style="background:#0f4c81;color:#fff;border-radius:50px;" data-open-modal="#modalTambahCust"><i class="ico ico-person-plus mr-1"></i>Tambah Customer</button></div>' +
      '<div class="grid gap-3 mb-4">' +
      '<div class="span-sm-4"><div class="stat-card primary"><div class="stat-icon" style="background:#e0f0ff;color:#0f4c81;"><i class="ico ico-people"></i></div><div class="stat-label">Total Customer</div><div class="stat-value">' + cust.length + '</div><div class="stat-sub">Semua pemesan terdaftar</div></div></div>' +
      '<div class="span-sm-4"><div class="stat-card success"><div class="stat-icon" style="background:#d1fae5;color:#065f46;"><i class="ico ico-person-check"></i></div><div class="stat-label">Akun Terdaftar</div><div class="stat-value">' + users.length + '</div><div class="stat-sub">User dengan akun login</div></div></div>' +
      '<div class="span-sm-4"><div class="stat-card warning"><div class="stat-icon" style="background:#fef3c7;color:#92400e;"><i class="ico ico-person-walking"></i></div><div class="stat-label">Walk-in</div><div class="stat-value">' + walkin + '</div><div class="stat-sub">Tanpa akun / walk-in</div></div></div></div>' +
      '<div class="panel-card mb-4 p-3"><div class="filter-row"><div class="filter-grow"><label class="ui-label t-sm semibold mb-1" for="searchCust">Cari Customer</label>' +
      '<input type="text" class="ui-input" id="searchCust" placeholder="Cari nama / email / no. HP..."></div><div><button type="button" class="ui-btn ui-btn-outline-secondary" id="btnResetCust"><i class="ico ico-x-circle mr-1"></i>Reset</button></div></div></div>' +
      '<div class="panel-card mb-4"><div class="panel-header"><h5><i class="ico ico-person mr-2 t-primary"></i>Semua Data Customer</h5><span class="ui-badge r-pill" style="background:#e0f0ff;color:#0f4c81;">' + cust.length + ' data</span></div>' +
      '<div class="ui-table-wrap"><table class="ui-table ui-table-hover v-middle mb-0" style="font-size:.85rem;"><thead style="background:#f8faff;"><tr>' +
      '<th class="pl-3 semibold t-sm t-muted">#</th><th class="semibold t-sm t-muted">Nama Customer</th><th class="semibold t-sm t-muted">No. HP</th><th class="semibold t-sm t-muted">Email</th>' +
      '<th class="semibold t-sm t-muted t-center">Transaksi</th><th class="semibold t-sm t-muted">Total Belanja</th><th class="semibold t-sm t-muted pr-3 t-center">Aksi</th></tr></thead><tbody>' + rows + '</tbody></table></div></div>' +
      '<div class="panel-card"><div class="panel-header"><h5><i class="ico ico-person-check mr-2 t-success"></i>Akun User Terdaftar (Register)</h5><span class="ui-badge r-pill" style="background:#d1fae5;color:#065f46;">' + users.length + ' akun</span></div>' +
      '<div class="ui-table-wrap"><table class="ui-table ui-table-hover v-middle mb-0" style="font-size:.85rem;"><thead style="background:#f8faff;"><tr><th class="pl-3 semibold t-sm t-muted">#</th><th class="semibold t-sm t-muted">Nama</th>' +
      '<th class="semibold t-sm t-muted">Email</th><th class="semibold t-sm t-muted">No. HP</th><th class="semibold t-sm t-muted pr-3">Terdaftar Sejak</th></tr></thead><tbody>' + urows + '</tbody></table></div></div>' +
      // modal tambah
      '<div class="ui-modal ui-fade" id="modalTambahCust" tabindex="-1"><div class="ui-modal-dialog"><div class="ui-modal-content r-4 bd-0 elev"><div class="ui-modal-header" style="background:#0f4c81;color:#fff;border-radius:1rem 1rem 0 0;">' +
      '<h5 class="ui-modal-title bold"><i class="ico ico-person-plus mr-2"></i>Tambah Customer Baru</h5><button type="button" class="ui-close ui-close-white" data-close-modal aria-label="Tutup"></button></div>' +
      '<form id="formTambahCust"><div class="ui-modal-body p-4"><div class="ui-alert ui-alert-info t-sm py-2 mb-3"><i class="ico ico-info-circle mr-1"></i>Digunakan untuk menambah data customer walk-in atau input manual oleh admin.</div>' +
      field('Nama Customer', 'tc_nama', '', 'text', 'Nama lengkap customer', true) + field('No. HP', 'tc_hp', 'ico-phone', 'tel', '08xxxxxxxxxx', false) + field('Email', 'tc_email', 'ico-envelope', 'email', 'email@gmail.com', false) +
      '</div><div class="ui-modal-footer bd-0"><button type="button" class="ui-btn ui-btn-light r-pill" data-close-modal>Batal</button><button type="submit" class="ui-btn r-pill px-4" style="background:#0f4c81;color:#fff;"><i class="ico ico-save mr-1"></i>Simpan</button></div></form></div></div></div>' +
      // modal edit
      '<div class="ui-modal ui-fade" id="modalEditCust" tabindex="-1"><div class="ui-modal-dialog"><div class="ui-modal-content r-4 bd-0 elev"><div class="ui-modal-header" style="background:#f4a61c;color:#fff;border-radius:1rem 1rem 0 0;">' +
      '<h5 class="ui-modal-title bold"><i class="ico ico-pencil mr-2"></i>Edit Data Customer</h5><button type="button" class="ui-close ui-close-white" data-close-modal aria-label="Tutup"></button></div>' +
      '<form id="formEditCust"><input type="hidden" id="ec_id"><div class="ui-modal-body p-4"><div class="mb-2"><label class="ui-label semibold t-sm" for="ec_idshow">ID Customer</label><input type="text" class="ui-input bgc-light" id="ec_idshow" readonly></div>' +
      field('Nama Customer', 'ec_nama', '', 'text', '', true) + field('No. HP', 'ec_hp', 'ico-phone', 'tel', '08xxxxxxxxxx', false) + field('Email', 'ec_email', 'ico-envelope', 'email', 'email@gmail.com', false) +
      '</div><div class="ui-modal-footer bd-0"><button type="button" class="ui-btn ui-btn-light r-pill" data-close-modal>Batal</button><button type="submit" class="ui-btn r-pill px-4" style="background:#f4a61c;color:#fff;"><i class="ico ico-save mr-1"></i>Update</button></div></form></div></div></div>';

    function filterCust() {
      var q = document.getElementById('searchCust').value.toLowerCase();
      document.querySelectorAll('.cust-row').forEach(function (r) { r.style.display = (!q || r.getAttribute('data-search').indexOf(q) !== -1) ? '' : 'none'; });
    }
    document.getElementById('searchCust').addEventListener('input', filterCust);
    document.getElementById('btnResetCust').addEventListener('click', function () { document.getElementById('searchCust').value = ''; filterCust(); });

    document.getElementById('formTambahCust').addEventListener('submit', function (e) {
      e.preventDefault();
      var nama = document.getElementById('tc_nama').value.trim();
      if (!nama) { P.flashReload('error', 'Nama customer wajib diisi!'); return; }
      if (SP.customer.create({ nama_cust: nama, no_hp: document.getElementById('tc_hp').value.trim(), email: document.getElementById('tc_email').value.trim() }))
        P.flashReload('success', 'Customer <strong>' + esc(nama) + '</strong> berhasil ditambahkan!');
    });
    document.getElementById('formEditCust').addEventListener('submit', function (e) {
      e.preventDefault();
      var id = document.getElementById('ec_id').value, nama = document.getElementById('ec_nama').value.trim();
      if (!id || !nama) { P.flashReload('error', 'ID dan nama customer wajib diisi!'); return; }
      if (!SP.customer.get(id)) { P.flashReload('error', 'Data customer tidak ditemukan!'); return; }
      SP.customer.update(id, { nama_cust: nama, no_hp: document.getElementById('ec_hp').value.trim(), email: document.getElementById('ec_email').value.trim() });
      P.flashReload('success', 'Data customer berhasil diperbarui!');
    });
    P.on(el, {
      edit: function (b, id) {
        var c = SP.customer.get(id); if (!c) return;
        document.getElementById('ec_id').value = c.id_cust; document.getElementById('ec_idshow').value = c.id_cust;
        document.getElementById('ec_nama').value = c.nama_cust || ''; document.getElementById('ec_hp').value = c.no_hp || ''; document.getElementById('ec_email').value = c.email || '';
        UI.modal('#modalEditCust').show();
      },
      hapus: function (b, id) {
        var c = SP.customer.get(id); if (!c) return;
        if (!confirm("Hapus customer '" + (c.nama_cust || '') + "'?\n\nTindakan ini tidak bisa dibatalkan!")) return;
        var n = SP.customer.countTransaksi(id);
        if (n > 0) { P.flashReload('error', 'Customer tidak bisa dihapus karena memiliki ' + n + ' riwayat transaksi!'); return; }
        SP.customer.remove(id); P.flashReload('success', 'Data customer berhasil dihapus!');
      },
      nohapus: function (b, id) { alert('Customer ini memiliki ' + SP.customer.countTransaksi(id) + ' transaksi dan tidak dapat dihapus.'); }
    });
  }
  P.mount({ roles: ['admin'], active: 'customer', title: 'Data Customer', render: render });
})();
