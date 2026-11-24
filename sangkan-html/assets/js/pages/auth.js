(function () {
  'use strict';
  var U = SP.util;
  function $(id) { return document.getElementById(id); }

  // sudah login -> arahkan sesuai peran (login & register)
  var ses = SP.session.get();
  if (ses) { window.location.replace(SP.auth.homeFor(ses.role)); return; }

  var flash = SP.flash.take(), box = $('flashBox');
  function showAlert(type, html) {
    var icon = type === 'danger' ? 'ico-exclamation-circle' : 'ico-check-circle';
    box.innerHTML = '<div class="ui-alert ui-alert-' + type + ' t-sm py-2"><i class="ico ' + icon + ' mr-1"></i>' + html + '</div>';
  }
  if (flash.error) showAlert('danger', flash.error);
  if (flash.success) showAlert('success', flash.success);

  // tampilkan/sembunyikan password
  document.addEventListener('click', function (e) {
    var btn = e.target.closest ? e.target.closest('.js-toggle-pwd') : null;
    if (!btn) return;
    var inp = $(btn.getAttribute('data-target')), icon = btn.querySelector('i');
    if (inp.type === 'password') { inp.type = 'text'; icon.className = 'ico ico-eye-slash'; }
    else { inp.type = 'password'; icon.className = 'ico ico-eye'; }
  });

  /* ---- LOGIN ---- */
  if (document.body.classList.contains('page-login')) {
    function switchTab(tab) {
      var c = tab === 'customer';
      $('formCustomer').style.display = c ? 'block' : 'none';
      $('formStaff').style.display = c ? 'none' : 'block';
      $('tabCust').classList.toggle('active', c);
      $('tabStaff').classList.toggle('active', !c);
    }
    $('tabCust').addEventListener('click', function () { switchTab('customer'); });
    $('tabStaff').addEventListener('click', function () { switchTab('staff'); });

    Array.prototype.forEach.call(document.querySelectorAll('form.js-login'), function (f) {
      f.addEventListener('submit', function (e) {
        e.preventDefault();
        var r = SP.auth.login(f.elements.username.value, f.elements.password.value);
        if (!r.ok) { showAlert('danger', r.msg); return; }
        window.location.href = SP.auth.homeFor(r.role);
      });
    });
  }

  /* ---- REGISTER ---- */
  if (document.body.classList.contains('page-register')) {
    $('pwd2').addEventListener('input', function () {
      var p1 = $('pwd1').value, p2 = this.value, el = $('pwdMatch');
      if (!p2) el.innerHTML = '';
      else if (p1 === p2) el.innerHTML = '<span class="t-success"><i class="ico ico-check-circle mr-1"></i>Password cocok</span>';
      else el.innerHTML = '<span class="t-danger"><i class="ico ico-x-circle mr-1"></i>Password tidak cocok</span>';
    });
    $('formRegister').addEventListener('submit', function (e) {
      e.preventDefault();
      var f = this.elements;
      var r = SP.auth.register(f.nama_lengkap.value, f.email.value, f.no_telp.value, f.password.value, f.confirm_password.value);
      if (!r.ok) { showAlert('danger', r.msg); window.scrollTo(0, 0); return; }
      SP.flash.set('success', 'Registrasi berhasil! Silakan login dengan akun Anda.');
      window.location.href = 'login.html';
    });
  }
})();
