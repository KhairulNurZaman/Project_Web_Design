(function () {
  'use strict';
  var U = SP.util, esc = U.esc;
  var ses = SP.guard.customer(); if (!ses) return;
  document.getElementById('btnLogout').addEventListener('click', function (e) { e.preventDefault(); SP.auth.logout(); window.location.href = 'index.html'; });
  var user = SP.user.get(ses.id_user);
  if (!user) { SP.auth.logout(); SP.flash.set('error', 'Silakan login terlebih dahulu!'); window.location.href = 'login.html'; return; }
  var flash = SP.flash.take(), h = '';
  if (flash.success) h += '<div class="ui-alert ui-alert-success">' + flash.success + '</div>';
  if (flash.error) h += '<div class="ui-alert ui-alert-danger">' + flash.error + '</div>';
  h += '<div class="card-box"><div class="t-center mb-4"><div class="avatar">' + esc(U.initial(user.nama_lengkap)) + '</div>' +
    '<h5 class="bold">' + esc(user.nama_lengkap) + '</h5><span class="ui-badge" style="background:#e0f0ff;color:#0f4c81;">Customer</span></div>' +
    '<form id="formProfil"><div class="mb-3"><label class="ui-label semibold t-sm" for="pNama">Nama Lengkap</label>' +
    '<input type="text" class="ui-input" id="pNama" value="' + esc(user.nama_lengkap) + '" required maxlength="100"></div>' +
    '<div class="mb-3"><label class="ui-label semibold t-sm">Email</label>' +
    '<input type="email" class="ui-input" value="' + esc(user.email) + '" readonly style="background:#f8f9fa;"><div class="ui-hint">Email tidak dapat diubah.</div></div>' +
    '<div class="mb-4"><label class="ui-label semibold t-sm" for="pTelp">No. Handphone</label>' +
    '<input type="tel" class="ui-input" id="pTelp" value="' + esc(user.no_telp || '') + '" placeholder="08xxxxxxxxxx" maxlength="15"></div>' +
    '<button type="submit" class="ui-btn w-full bold" style="background:#0f4c81;color:#fff;border-radius:50px;">Simpan Perubahan</button></form>' +
    '<div class="t-center mt-3"><a href="riwayat.html" class="ui-btn ui-btn-outline-primary r-pill"><i class="ico ico-clock-history mr-1"></i>Lihat Riwayat Pesanan</a></div></div>';
  document.getElementById('content').innerHTML = h;
  document.getElementById('formProfil').addEventListener('submit', function (e) {
    e.preventDefault();
    var nama = document.getElementById('pNama').value.trim();
    if (!nama) return;
    SP.user.update(ses.id_user, { nama_lengkap: nama, no_telp: document.getElementById('pTelp').value.trim() });
    SP.session.update({ nama: nama });
    SP.flash.set('success', 'Profil berhasil diperbarui!');
    window.location.reload();
  });
})();
