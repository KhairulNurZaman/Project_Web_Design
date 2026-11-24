(function () {
  'use strict';
  var U = SP.util, esc = U.esc, P = SP.panel;

  function pwdField(id, name, ph, req, min) {
    return '<div class="ui-group"><input type="password" class="ui-input" id="' + id + '" placeholder="' + ph + '"' + (req ? ' required' : '') + (min ? ' minlength="' + min + '"' : '') + ' autocomplete="new-password">' +
      '<button type="button" class="ui-btn ui-btn-outline-secondary" data-act="togglepwd" data-id="' + id + '" aria-label="Tampilkan password"><i class="ico ico-eye"></i></button></div>';
  }
  var roleOpts = '<option value="manajer">Manajer</option><option value="admin">Admin</option>';

  function render(ses, el) {
    var list = SP.staff.all(), rows = '';
    if (!list.length) rows = '<tr><td colspan="5" class="t-center py-4 t-muted">Belum ada data staff.</td></tr>';
    list.forEach(function (s) {
      rows += '<tr><td class="pl-3 mono t-sm bold" style="color:#0f4c81;">' + esc(s.id_admin) + '</td><td><div class="flex items-center gap-2">' +
        '<div class="r-circle flex items-center justify-center" style="width:36px;height:36px;background:' + (s.role === 'admin' ? '#0f4c81' : '#f4a61c') + ';color:#fff;font-size:.85rem;font-weight:700;flex-shrink:0;">' + esc(U.initial(s.nama_admin)) + '</div>' +
        '<span class="semibold t-sm">' + esc(s.nama_admin) + '</span></div></td><td class="t-sm t-muted">' + esc(s.username) + '</td>' +
        '<td><span class="ui-badge r-pill ' + (s.role === 'admin' ? 'bgc-primary' : 'bgc-warning t-dark') + '">' + esc(U.ucfirst(s.role)) + '</span></td><td class="pr-3 t-center">' +
        (s.id_admin !== 'A001'
          ? '<div class="flex gap-1 justify-center"><button type="button" class="ui-btn ui-btn-sm ui-btn-outline-primary r-pill py-0 px-2" data-act="edit" data-id="' + esc(s.id_admin) + '" title="Edit"><i class="ico ico-pencil"></i></button>' +
            '<button type="button" class="ui-btn ui-btn-sm ui-btn-outline-danger r-pill py-0 px-2" data-act="hapus" data-id="' + esc(s.id_admin) + '" title="Hapus"><i class="ico ico-trash"></i></button></div>'
          : '<span class="ui-badge bgc-secondary r-pill">Super Admin</span>') + '</td></tr>';
    });
    el.innerHTML =
      '<div class="flex justify-between items-center mb-4"><div><h4 class="bold mb-0" style="color:#0f4c81;"><i class="ico ico-person-badge mr-2"></i>Kelola Staff</h4>' +
      '<p class="t-muted t-sm mb-0">Manajemen akun Admin dan Manajer</p></div>' +
      '<button type="button" class="ui-btn semibold" style="background:#0f4c81;color:#fff;border-radius:50px;" data-open-modal="#modalTambahStaff"><i class="ico ico-person-plus mr-1"></i>Tambah Staff</button></div>' +
      '<div class="panel-card"><div class="ui-table-wrap"><table class="ui-table ui-table-hover v-middle mb-0"><thead style="background:#f8faff;"><tr>' +
      '<th class="pl-3 semibold t-sm t-muted">ID</th><th class="semibold t-sm t-muted">Nama</th><th class="semibold t-sm t-muted">Username</th><th class="semibold t-sm t-muted">Role</th><th class="semibold t-sm t-muted pr-3 t-center">Aksi</th></tr></thead><tbody>' + rows + '</tbody></table></div></div>' +
      '<div class="ui-modal ui-fade" id="modalTambahStaff" tabindex="-1"><div class="ui-modal-dialog"><div class="ui-modal-content r-4 bd-0 elev"><div class="ui-modal-header" style="background:#0f4c81;color:#fff;border-radius:1rem 1rem 0 0;">' +
      '<h5 class="ui-modal-title bold"><i class="ico ico-person-plus mr-2"></i>Tambah Staff Baru</h5><button type="button" class="ui-close ui-close-white" data-close-modal aria-label="Tutup"></button></div>' +
      '<form id="formTambahStaff"><div class="ui-modal-body p-4">' +
      '<div class="mb-3"><label class="ui-label semibold t-sm" for="ts_nama">Nama Lengkap <span class="t-danger">*</span></label><input type="text" class="ui-input" id="ts_nama" required placeholder="Nama lengkap staff" maxlength="100"></div>' +
      '<div class="mb-3"><label class="ui-label semibold t-sm" for="ts_user">Username <span class="t-danger">*</span></label><input type="text" class="ui-input" id="ts_user" required placeholder="Username untuk login" maxlength="50" autocomplete="off"></div>' +
      '<div class="mb-3"><label class="ui-label semibold t-sm" for="ts_pwd">Password <span class="t-danger">*</span></label>' + pwdField('ts_pwd', 'password', 'Min. 6 karakter', true, 6) + '</div>' +
      '<div class="mb-3"><label class="ui-label semibold t-sm" for="ts_role">Role <span class="t-danger">*</span></label><select class="ui-select" id="ts_role">' + roleOpts + '</select></div></div>' +
      '<div class="ui-modal-footer bd-0"><button type="button" class="ui-btn ui-btn-light r-pill" data-close-modal>Batal</button><button type="submit" class="ui-btn r-pill px-4" style="background:#0f4c81;color:#fff;"><i class="ico ico-save mr-1"></i>Simpan</button></div></form></div></div></div>' +
      '<div class="ui-modal ui-fade" id="modalEditStaff" tabindex="-1"><div class="ui-modal-dialog"><div class="ui-modal-content r-4 bd-0 elev"><div class="ui-modal-header" style="background:#f4a61c;color:#fff;border-radius:1rem 1rem 0 0;">' +
      '<h5 class="ui-modal-title bold"><i class="ico ico-pencil mr-2"></i>Edit Staff</h5><button type="button" class="ui-close ui-close-white" data-close-modal aria-label="Tutup"></button></div>' +
      '<form id="formEditStaff"><input type="hidden" id="es_id"><div class="ui-modal-body p-4">' +
      '<div class="mb-3"><label class="ui-label semibold t-sm" for="es_idshow">ID Staff</label><input type="text" class="ui-input bgc-light" id="es_idshow" readonly></div>' +
      '<div class="mb-3"><label class="ui-label semibold t-sm" for="es_nama">Nama Lengkap <span class="t-danger">*</span></label><input type="text" class="ui-input" id="es_nama" required maxlength="100"></div>' +
      '<div class="mb-3"><label class="ui-label semibold t-sm" for="es_user">Username</label><input type="text" class="ui-input bgc-light" id="es_user" readonly><div class="ui-hint">Username tidak dapat diubah.</div></div>' +
      '<div class="mb-3"><label class="ui-label semibold t-sm" for="es_role">Role</label><select class="ui-select" id="es_role">' + roleOpts + '</select></div>' +
      '<div class="mb-3"><label class="ui-label semibold t-sm" for="es_pwd">Password Baru <span class="t-muted">(kosongkan jika tidak diubah)</span></label>' + pwdField('es_pwd', 'password', 'Isi untuk ganti password', false, 6) + '</div></div>' +
      '<div class="ui-modal-footer bd-0"><button type="button" class="ui-btn ui-btn-light r-pill" data-close-modal>Batal</button><button type="submit" class="ui-btn r-pill px-4" style="background:#f4a61c;color:#fff;"><i class="ico ico-save mr-1"></i>Update</button></div></form></div></div></div>';

    document.getElementById('formTambahStaff').addEventListener('submit', function (e) {
      e.preventDefault();
      var nama = document.getElementById('ts_nama').value.trim(), user = document.getElementById('ts_user').value.trim(), pwd = document.getElementById('ts_pwd').value, role = document.getElementById('ts_role').value;
      if (!nama || !user || !pwd) { P.flashReload('error', 'Semua field wajib diisi!'); return; }
      if (pwd.length < 6) { P.flashReload('error', 'Password minimal 6 karakter!'); return; }
      if (role !== 'admin' && role !== 'manajer') role = 'manajer';
      if (SP.staff.usernameExists(user)) { P.flashReload('error', 'Username <strong>' + esc(user) + '</strong> sudah digunakan!'); return; }
      var id = SP.staff.insert(nama, user, pwd, role);
      if (id) P.flashReload('success', 'Staff <strong>' + esc(nama) + '</strong> berhasil ditambahkan! (ID: ' + id + ')');
    });
    document.getElementById('formEditStaff').addEventListener('submit', function (e) {
      e.preventDefault();
      var id = document.getElementById('es_id').value, nama = document.getElementById('es_nama').value.trim(), role = document.getElementById('es_role').value, pwd = document.getElementById('es_pwd').value;
      if (!id || !nama) { P.flashReload('error', 'Data tidak lengkap!'); return; }
      if (pwd && pwd.length < 6) { P.flashReload('error', 'Password baru minimal 6 karakter!'); return; }
      if (role !== 'admin' && role !== 'manajer') role = 'manajer';
      if (id === ses.id_admin && role !== ses.role) { P.flashReload('error', 'Tidak bisa mengubah role akun yang sedang digunakan!'); return; }
      SP.staff.update(id, nama, role, pwd);
      if (id === ses.id_admin) SP.session.update({ nama: nama });
      P.flashReload('success', 'Data staff berhasil diperbarui!');
    });
    P.on(el, {
      edit: function (b, id) {
        var s = null; SP.staff.all().forEach(function (x) { if (x.id_admin === id) s = x; }); if (!s) return;
        document.getElementById('es_id').value = s.id_admin; document.getElementById('es_idshow').value = s.id_admin;
        document.getElementById('es_nama').value = s.nama_admin; document.getElementById('es_user').value = s.username;
        document.getElementById('es_role').value = s.role; document.getElementById('es_pwd').value = '';
        UI.modal('#modalEditStaff').show();
      },
      hapus: function (b, id) {
        var s = null; SP.staff.all().forEach(function (x) { if (x.id_admin === id) s = x; }); if (!s) return;
        if (!confirm('Hapus staff ' + s.nama_admin + '?\nTindakan ini tidak bisa dibatalkan!')) return;
        if (id === 'A001') { P.flashReload('error', 'Super Admin tidak dapat dihapus!'); return; }
        if (id === ses.id_admin) { P.flashReload('error', 'Tidak bisa menghapus akun yang sedang aktif!'); return; }
        var n = SP.db.get().transaksi.filter(function (t) { return t.id_admin === id; }).length;
        if (n > 0) { P.flashReload('error', 'Staff tidak bisa dihapus karena tercatat pada ' + n + ' transaksi!'); return; }
        SP.staff.remove(id); P.flashReload('success', 'Staff berhasil dihapus!');
      },
      togglepwd: function (btn, id) {
        var inp = document.getElementById(id), icon = btn.querySelector('i');
        if (inp.type === 'password') { inp.type = 'text'; icon.className = 'ico ico-eye-slash'; } else { inp.type = 'password'; icon.className = 'ico ico-eye'; }
      }
    });
  }
  P.mount({ roles: ['admin'], active: 'staff', title: 'Kelola Staff', render: render });
})();
