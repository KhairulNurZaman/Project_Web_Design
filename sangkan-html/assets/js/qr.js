/*
 * qr.js — generator QR Code native (tanpa library).
 * Mode byte, error correction M, versi 1–6 (maks. 106 byte).
 * Dipakai untuk QR pada e-tiket (isi QR = nomor tiket).
 * API: SP.qr.matrix(text) -> array 2D boolean ; SP.qr.svg(text, px) -> string SVG
 */
(function (w) {
  'use strict';
  var SP = w.SP = w.SP || {};

  // [totalCodewords, ecPerBlock, [[jumlahBlok, dataPerBlok], ...]] untuk level M
  var VERSIONS = {
    1: [26, 10, [[1, 16]]],
    2: [44, 16, [[1, 28]]],
    3: [70, 26, [[1, 44]]],
    4: [100, 18, [[2, 32]]],
    5: [134, 24, [[2, 43]]],
    6: [172, 16, [[4, 27]]]
  };
  var ALIGN = { 1: [], 2: [6, 18], 3: [6, 22], 4: [6, 26], 5: [6, 30], 6: [6, 34] };

  // ---- GF(256) ----
  var EXP = new Array(512), LOG = new Array(256);
  (function () {
    var x = 1;
    for (var i = 0; i < 255; i++) {
      EXP[i] = x; LOG[x] = i;
      x <<= 1; if (x & 0x100) x ^= 0x11D;
    }
    for (var j = 255; j < 512; j++) EXP[j] = EXP[j - 255];
  })();
  function gmul(a, b) { return (a === 0 || b === 0) ? 0 : EXP[LOG[a] + LOG[b]]; }

  function rsGenerator(deg) {
    var poly = [1];
    for (var i = 0; i < deg; i++) {
      var next = new Array(poly.length + 1);
      for (var k = 0; k < next.length; k++) next[k] = 0;
      for (var j = 0; j < poly.length; j++) {
        next[j] ^= poly[j];
        next[j + 1] ^= gmul(poly[j], EXP[i]);
      }
      poly = next;
    }
    return poly; // koefisien dari pangkat tertinggi, panjang deg+1
  }
  function rsRemainder(data, deg) {
    var gen = rsGenerator(deg);
    var rem = [];
    for (var i = 0; i < deg; i++) rem.push(0);
    for (var d = 0; d < data.length; d++) {
      var factor = data[d] ^ rem.shift();
      rem.push(0);
      for (var k = 0; k < deg; k++) rem[k] ^= gmul(gen[k + 1], factor);
    }
    return rem;
  }

  function utf8Bytes(str) {
    var s = unescape(encodeURIComponent(str)), out = [];
    for (var i = 0; i < s.length; i++) out.push(s.charCodeAt(i));
    return out;
  }

  function pickVersion(len) {
    for (var v = 1; v <= 6; v++) {
      var info = VERSIONS[v], dataCw = 0;
      for (var b = 0; b < info[2].length; b++) dataCw += info[2][b][0] * info[2][b][1];
      if (4 + 8 + len * 8 <= dataCw * 8) return v;
    }
    throw new Error('Teks QR terlalu panjang (maks. 106 byte).');
  }

  function buildCodewords(bytes, ver) {
    var info = VERSIONS[ver], dataCw = 0, i;
    for (i = 0; i < info[2].length; i++) dataCw += info[2][i][0] * info[2][i][1];
    var bits = [];
    function push(val, n) { for (var k = n - 1; k >= 0; k--) bits.push((val >>> k) & 1); }
    push(4, 4); push(bytes.length, 8);
    for (i = 0; i < bytes.length; i++) push(bytes[i], 8);
    var cap = dataCw * 8;
    var term = Math.min(4, cap - bits.length);
    push(0, term);
    while (bits.length % 8) bits.push(0);
    var cw = [];
    for (i = 0; i < bits.length; i += 8) {
      var v = 0; for (var k = 0; k < 8; k++) v = (v << 1) | bits[i + k];
      cw.push(v);
    }
    var pad = [0xEC, 0x11], pi = 0;
    while (cw.length < dataCw) cw.push(pad[pi++ % 2]);

    // pecah ke blok, hitung EC, interleave
    var blocks = [], ecBlocks = [], pos = 0, maxData = 0;
    for (i = 0; i < info[2].length; i++) {
      for (var n = 0; n < info[2][i][0]; n++) {
        var blk = cw.slice(pos, pos + info[2][i][1]);
        pos += info[2][i][1];
        blocks.push(blk);
        ecBlocks.push(rsRemainder(blk, info[1]));
        if (blk.length > maxData) maxData = blk.length;
      }
    }
    var out = [];
    for (i = 0; i < maxData; i++) for (var b = 0; b < blocks.length; b++) if (i < blocks[b].length) out.push(blocks[b][i]);
    for (i = 0; i < info[1]; i++) for (var e = 0; e < ecBlocks.length; e++) out.push(ecBlocks[e][i]);
    return out;
  }

  function newGrid(size, fill) {
    var g = [];
    for (var y = 0; y < size; y++) { var r = []; for (var x = 0; x < size; x++) r.push(fill); g.push(r); }
    return g;
  }

  function build(text) {
    var bytes = utf8Bytes(text);
    var ver = pickVersion(bytes.length);
    var size = ver * 4 + 17;
    var mod = newGrid(size, false), isFn = newGrid(size, false);

    function setFn(x, y, dark) { mod[y][x] = dark; isFn[y][x] = true; }

    // finder + separator
    function finder(cx, cy) {
      for (var dy = -4; dy <= 4; dy++) for (var dx = -4; dx <= 4; dx++) {
        var x = cx + dx, y = cy + dy;
        if (x < 0 || y < 0 || x >= size || y >= size) continue;
        var d = Math.max(Math.abs(dx), Math.abs(dy));
        setFn(x, y, d !== 2 && d !== 4);
      }
    }
    finder(3, 3); finder(size - 4, 3); finder(3, size - 4);

    // timing
    for (var i = 0; i < size; i++) {
      if (!isFn[6][i]) setFn(i, 6, i % 2 === 0);
      if (!isFn[i][6]) setFn(6, i, i % 2 === 0);
    }

    // alignment
    var ap = ALIGN[ver];
    for (var a = 0; a < ap.length; a++) for (var b = 0; b < ap.length; b++) {
      if ((a === 0 && b === 0) || (a === 0 && b === ap.length - 1) || (a === ap.length - 1 && b === 0)) continue;
      for (var dy = -2; dy <= 2; dy++) for (var dx = -2; dx <= 2; dx++) {
        setFn(ap[a] + dx, ap[b] + dy, Math.max(Math.abs(dx), Math.abs(dy)) !== 1);
      }
    }

    // area format (dicadangkan, diisi nanti)
    function drawFormat(mask) {
      var data = (0 << 3) | mask; // level M = 00
      var rem = data;
      for (var k = 0; k < 10; k++) rem = (rem << 1) ^ ((rem >>> 9) * 0x537);
      var bits = ((data << 10) | rem) ^ 0x5412;
      function bit(n) { return ((bits >>> n) & 1) !== 0; }
      for (var k1 = 0; k1 <= 5; k1++) setFn(8, k1, bit(k1));
      setFn(8, 7, bit(6)); setFn(8, 8, bit(7)); setFn(7, 8, bit(8));
      for (var k2 = 9; k2 < 15; k2++) setFn(14 - k2, 8, bit(k2));
      for (var k3 = 0; k3 < 8; k3++) setFn(size - 1 - k3, 8, bit(k3));
      for (var k4 = 8; k4 < 15; k4++) setFn(8, size - 15 + k4, bit(k4));
      setFn(8, size - 8, true);
    }
    drawFormat(0);

    // data
    var cw = buildCodewords(bytes, ver);
    var dbits = [];
    for (i = 0; i < cw.length; i++) for (var k = 7; k >= 0; k--) dbits.push((cw[i] >>> k) & 1);
    var bi = 0;
    for (var right = size - 1; right >= 1; right -= 2) {
      if (right === 6) right = 5;
      for (var vert = 0; vert < size; vert++) {
        for (var j = 0; j < 2; j++) {
          var x = right - j;
          var upward = ((right + 1) & 2) === 0;
          var y = upward ? size - 1 - vert : vert;
          if (!isFn[y][x] && bi < dbits.length) { mod[y][x] = dbits[bi] === 1; bi++; }
        }
      }
    }

    function maskFn(m, x, y) {
      switch (m) {
        case 0: return (x + y) % 2 === 0;
        case 1: return y % 2 === 0;
        case 2: return x % 3 === 0;
        case 3: return (x + y) % 3 === 0;
        case 4: return (Math.floor(x / 3) + Math.floor(y / 2)) % 2 === 0;
        case 5: return (x * y) % 2 + (x * y) % 3 === 0;
        case 6: return ((x * y) % 2 + (x * y) % 3) % 2 === 0;
        default: return ((x + y) % 2 + (x * y) % 3) % 2 === 0;
      }
    }
    function applyMask(m) {
      for (var y = 0; y < size; y++) for (var x = 0; x < size; x++) {
        if (!isFn[y][x] && maskFn(m, x, y)) mod[y][x] = !mod[y][x];
      }
    }

    function penalty() {
      var res = 0, x, y, run, prev;
      function line(getter) {
        var p = 0; run = 1; prev = getter(0);
        for (var t = 1; t < size; t++) {
          var cur = getter(t);
          if (cur === prev) { run++; if (run === 5) p += 3; else if (run > 5) p++; }
          else { run = 1; prev = cur; }
        }
        // pola 1:1:3:1:1
        var s = '';
        for (var u = 0; u < size; u++) s += getter(u) ? '1' : '0';
        var re = /(?=(1011101(0000)?|(0000)?1011101))/g, mt;
        while ((mt = re.exec(s)) !== null) { p += 40; re.lastIndex = mt.index + 1; }
        return p;
      }
      for (y = 0; y < size; y++) res += line(function (t) { return mod[y][t]; });
      for (x = 0; x < size; x++) res += line(function (t) { return mod[t][x]; });
      for (y = 0; y < size - 1; y++) for (x = 0; x < size - 1; x++) {
        var c = mod[y][x];
        if (c === mod[y][x + 1] && c === mod[y + 1][x] && c === mod[y + 1][x + 1]) res += 3;
      }
      var dark = 0;
      for (y = 0; y < size; y++) for (x = 0; x < size; x++) if (mod[y][x]) dark++;
      var pct = dark * 100 / (size * size);
      res += Math.floor(Math.abs(pct - 50) / 5) * 10;
      return res;
    }

    var best = 0, bestP = Infinity;
    for (var m = 0; m < 8; m++) {
      applyMask(m); drawFormat(m);
      var p = penalty();
      if (p < bestP) { bestP = p; best = m; }
      applyMask(m); // balikkan
    }
    applyMask(best); drawFormat(best);
    return mod;
  }

  SP.qr = {
    matrix: build,
    svg: function (text, px) {
      var m = build(String(text)), n = m.length, quiet = 3, total = n + quiet * 2, d = '';
      for (var y = 0; y < n; y++) {
        var x = 0;
        while (x < n) {
          if (m[y][x]) {
            var s = x; while (x < n && m[y][x]) x++;
            d += 'M' + (s + quiet) + ' ' + (y + quiet) + 'h' + (x - s) + 'v1h-' + (x - s) + 'z';
          } else x++;
        }
      }
      var size = px || 140;
      return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + total + ' ' + total + '" width="' + size + '" height="' + size +
        '" shape-rendering="crispEdges" role="img" aria-label="QR Code tiket"><rect width="' + total + '" height="' + total +
        '" fill="#fff"/><path d="' + d + '" fill="#000"/></svg>';
    }
  };
})(window);
