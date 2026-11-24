(function () {
  'use strict';
  var U = SP.util, esc = U.esc, P = SP.panel;
  var KAT = ['weekday', 'weekend', 'promo', 'paket'], STAT = ['aktif', 'nonaktif'];
  var colors = { weekday: ['#0f4c81', '#e0f0ff'], weekend: ['#f4a61c', '#fff8e1'], promo: ['#dc3545', '#fee2e2'], paket: ['#6f42c1', '#ede7f6'] };

  function formFields(prefix) {
    return '<div class="mb-3"><label class="ui-label semibold t-sm" for="' + prefix + 'nama">Nama Layanan <span class="t-danger">*</span></label>' +
      '<input type="text" class="ui-input" id="' + prefix + 'nama" required maxlength="100"' + (prefix === 't_' ? ' placeholder="Contoh: Tiket Weekday"' : '') + '></div>' +
      '<div class="mb-3"><label class="ui-label semibold t-sm" for="' + prefix + 'desk">Deskripsi</label>' +
      '<textarea class="ui-input" id="' + prefix + 'desk" rows="2"' + (prefix === 't_' ? ' placeholder="Deskripsi singkat layanan ini..."' : '') + '></textarea></div>' +
      '<div class="grid gap-3"><div class="span-6"><label class="ui-label semibold t-sm" for="' + prefix + 'harga">Harga (Rp) <span class="t-danger">*</span></label>' +
      '<input type="number" class="ui-input" id="' + prefix + 'harga" required min="1000"' + (prefix === 't_' ? ' placeholder="35000"' : '') + '></div>' +
      '<div class="span-6"><label class="ui-label semibold t-sm" for="' + prefix + 'kat">Kategori</label><select class="ui-select" id="' + prefix + 'kat">' +
      '<option value="weekday">Weekday</option><option value="weekend">Weekend</option><option value="promo">Promo</option><option value="paket">Paket</option></select></div>' +
      '<div class="span-12"><label class="ui-label semibold t-sm" for="' + prefix + 'status">Status</label><select class="ui-select" id="' + prefix + 'status">' +
      '<option value="aktif">Aktif</option><option value="nonaktif">Nonaktif</option></select></div></div>';
  }

  function render(ses, el) {
    var list = SP.layanan.all(), cards = '';
    if (!list.length) {
      cards = '<div class="panel-card p-5 t-center t-muted"><i class="ico ico-ticket-perforated" style="font-size:3rem;"></i><p class="mt-3">Belum ada layanan. Klik <strong>Tambah Layanan</strong> untuk memulai.</p></div>';
    } else {
      cards = '<div class="grid gap-3 mb-4">';
      list.forEach(function (l) {
        var c = colors[l.kategori] || colors.weekday, d = l.deskripsi || '';
        var desk = d ? d.substr(0, 80) + (d.length > 80 ? '...' : '') : 'Tidak ada deskripsi.';
        cards += '<div class="span-sm-6 span-lg-4 span-xl-3"><div class="bgc-white r-4 elev-sm clip h-full flex flex-col">' +
          '<div class="p-3" style="background:' + c[0] + ';"><div class="flex justify-between items-start"><div>' +
          '<span class="ui-badge r-pill mb-1" style="background:rgba(255,255,255,.2);color:#fff;font-size:.65rem;">' + esc(U.ucfirst(l.kategori)) + '</span>' +
          '<h6 class="bold t-white mb-0">' + esc(l.nama_layanan) + '</h6></div>' +
          '<span class="ui-badge r-pill ' + (l.status === 'aktif' ? 'bgc-success' : 'bgc-secondary') + ' ml-2">' + (l.status === 'aktif' ? 'Aktif' : 'Nonaktif') + '</span></div></div>' +
          '<div class="p-3 grow flex flex-col"><div class="bold mb-1" style="font-size:1.25rem;color:' + c[0] + ';">' + U.rp(l.harga) +
          ' <small class="normal t-muted" style="font-size:.75rem;">/orang</small></div>' +
          '<p class="t-muted t-sm mb-3 grow" style="min-height:36px;">' + esc(desk) + '</p>' +
          '<div class="flex gap-2 mt-auto"><button type="button" class="ui-btn ui-btn-sm ui-btn-outline-primary r-pill fill" data-act="edit" data-id="' + esc(l.id_layanan) + '"><i class="ico ico-pencil mr-1"></i>Edit</button>' +
          '<button type="button" class="ui-btn ui-btn-sm ui-btn-outline-danger r-pill" data-act="hapus" data-id="' + esc(l.id_layanan) + '" aria-label="Hapus"><i class="ico ico-trash"></i></button></div></div></div></div>';
      });
      cards += '</div>';
    }

    el.innerHTML =
      '<div class="flex justify-between items-center mb-4"><div><h4 class="bold mb-0" style="color:#0f4c81;"><i class="ico ico-ticket-perforated mr-2"></i>Kelola Layanan &amp; Tiket</h4>' +
      '<p class="t-muted t-sm mb-0">Manajemen jenis tiket dan harga</p></div>' +
      '<button type="button" class="ui-btn semibold" style="background:#0f4c81;color:#fff;border-radius:50px;" data-open-modal="#modalTambah"><i class="ico ico-plus-circle mr-1"></i>Tambah Layanan</button></div>' + cards +
      '<div class="ui-modal ui-fade" id="modalTambah" tabindex="-1"><div class="ui-modal-dialog"><div class="ui-modal-content r-4 bd-0 elev"><div class="ui-modal-header" style="background:#0f4c81;color:#fff;border-radius:1rem 1rem 0 0;">' +
      '<h5 class="ui-modal-title bold"><i class="ico ico-plus-circle mr-2"></i>Tambah Layanan Baru</h5><button type="button" class="ui-close ui-close-white" data-close-modal aria-label="Tutup"></button></div>' +
      '<form id="formTambah"><div class="ui-modal-body p-4">' + formFields('t_') + '</div><div class="ui-modal-footer bd-0"><button type="button" class="ui-btn ui-btn-light r-pill" data-close-modal>Batal</button>' +
      '<button type="submit" class="ui-btn r-pill px-4" style="background:#0f4c81;color:#fff;"><i class="ico ico-save mr-1"></i>Simpan</button></div></form></div></div></div>' +
      '<div class="ui-modal ui-fade" id="modalEdit" tabindex="-1"><div class="ui-modal-dialog"><div class="ui-modal-content r-4 bd-0 elev"><div class="ui-modal-header" style="background:#f4a61c;color:#fff;border-radius:1rem 1rem 0 0;">' +
      '<h5 class="ui-modal-title bold"><i class="ico ico-pencil mr-2"></i>Edit Layanan</h5><button type="button" class="ui-close ui-close-white" data-close-modal aria-label="Tutup"></button></div>' +
      '<form id="formEdit"><input type="hidden" id="e_id"><div class="ui-modal-body p-4"><div class="mb-2"><label class="ui-label semibold t-sm" for="e_idshow">ID Layanan</label>' +
      '<input type="text" class="ui-input bgc-light" id="e_idshow" readonly></div>' + formFields('e_') + '</div><div class="ui-modal-footer bd-0">' +
      '<button type="button" class="ui-btn ui-btn-light r-pill" data-close-modal>Batal</button><button type="submit" class="ui-btn r-pill px-4" style="background:#f4a61c;color:#fff;"><i class="ico ico-save mr-1"></i>Update</button></div></form></div></div></div>';

    function read(prefix) {
      var nama = document.getElementById(prefix + 'nama').value.trim(), harga = parseInt(document.getElementById(prefix + 'harga').value, 10);
      var kat = document.getElementById(prefix + 'kat').value, st = document.getElementById(prefix + 'status').value;
      if (KAT.indexOf(kat) === -1) kat = 'weekday'; if (STAT.indexOf(st) === -1) st = 'aktif';
      return { nama_layanan: nama, deskripsi: document.getElementById(prefix + 'desk').value.trim(), harga: harga, kategori: kat, status: st };
    }
    document.getElementById('formTambah').addEventListener('submit', function (e) {
      e.preventDefault();
      var d = read('t_');
      if (!d.nama_layanan || !(d.harga > 0)) { P.flashReload('error', 'Nama layanan dan harga wajib diisi!'); return; }
      if (SP.layanan.insert(d)) P.flashReload('success', 'Layanan <strong>' + esc(d.nama_layanan) + '</strong> berhasil ditambahkan!');
    });
    document.getElementById('formEdit').addEventListener('submit', function (e) {
      e.preventDefault();
      var id = document.getElementById('e_id').value, d = read('e_');
      if (!id || !d.nama_layanan || !(d.harga > 0)) { P.flashReload('error', 'Data tidak lengkap!'); return; }
      if (!SP.layanan.get(id)) { P.flashReload('error', 'Layanan tidak ditemukan!'); return; }
      if (SP.layanan.update(id, d)) P.flashReload('success', 'Layanan berhasil diperbarui!');
    });
    P.on(el, {
      edit: function (b, id) {
        var l = SP.layanan.get(id); if (!l) return;
        document.getElementById('e_id').value = l.id_layanan; document.getElementById('e_idshow').value = l.id_layanan;
        document.getElementById('e_nama').value = l.nama_layanan; document.getElementById('e_desk').value = l.deskripsi || '';
        document.getElementById('e_harga').value = l.harga; document.getElementById('e_kat').value = l.kategori; document.getElementById('e_status').value = l.status;
        UI.modal('#modalEdit').show();
      },
      hapus: function (b, id) {
        var l = SP.layanan.get(id); if (!l) return;
        if (!confirm("Hapus layanan '" + l.nama_layanan + "'?\n\nLayanan yang sudah digunakan dalam transaksi tidak dapat dihapus.")) return;
        var n = SP.layanan.dipakai(id);
        if (n > 0) { P.flashReload('error', 'Layanan tidak bisa dihapus karena sudah digunakan dalam ' + n + ' transaksi!'); return; }
        if (SP.layanan.remove(id)) P.flashReload('success', 'Layanan berhasil dihapus!');
      }
    });
  }
  P.mount({ roles: ['admin'], active: 'layanan', title: 'Kelola Layanan', render: render });
})();
