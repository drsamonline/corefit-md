/* CoreFit MD — presentation layer.
   Renders every view from store state. No business logic lives here. */
(function (CF) {
  'use strict';
  var S = CF.Store, C = CF.CONFIG;
  var $ = function (id) { return document.getElementById(id); };

  function fmtDur(sec) {
    sec = Math.max(0, Math.round(sec));
    return Math.floor(sec / 60) + ':' + String(sec % 60).padStart(2, '0');
  }
  function fmtSec(sec) {
    sec = Math.max(0, Math.round(sec));
    return Math.floor(sec / 60) + ':' + String(sec % 60).padStart(2, '0');
  }
  function exName(ex) { return CF.pick(ex.name); }
  function exCue(ex) { return CF.pick(ex.cue); }

  var TOGGLES = [
    { key: 'sound',    label: 'set.sound',     desc: 'set.sound.d' },
    { key: 'voice',    label: 'set.voice',     desc: 'set.voice.d' },
    { key: 'haptics',  label: 'set.haptics',   desc: 'set.haptics.d' },
    { key: 'wake',     label: 'set.wake',      desc: 'set.wake.d' },
    { key: 'videoSound', label: 'set.video',   desc: 'set.video.d' },
    { key: 'warmup',   label: 'set.warmup',    desc: 'set.warmup.d' },
    { key: 'cooldown', label: 'set.cooldown',  desc: 'set.cooldown.d' },
    { key: 'bigText',  label: 'set.bigtext',   desc: 'set.bigtext.d' },
    { key: 'audioOnly', label: 'set.audioonly', desc: 'set.audioonly.d' },
    { key: 'reminders', label: 'set.reminders', desc: 'set.reminders.d' }
  ];

  var UI = {
    fmtDur: fmtDur,
    fmtSec: fmtSec,
    exName: exName,
    exCue: exCue,
    currentView: 'today',

    /* ---------------- global chrome ---------------- */
    paintChrome: function () {
      var p = S.programWeek();
      var s = S.streak();
      $('streakNum').textContent = s;
      $('streakWord').textContent = CF.t(s === 1 ? 'unit.day' : 'unit.days');
      $('streakPill').classList.toggle('hot', s >= 2);
      $('langTag').textContent = S.get('lang') === 'hi' ? 'हि' : S.get('lang') === 'gu' ? 'ગુ' : 'EN';
      $('brandMeta').textContent = CF.EXERCISES.length + ' ' + CF.t('label.moves') + ' · ' + fmtDur(UI.planTotal());

      var flags = S.profile.flags || [];
      var painLast = lastPain();
      var b = $('banner');
      if (painLast) { $('bannerText').textContent = CF.t('banner.pain'); b.hidden = false; }
      else if (flags.length) { $('bannerText').textContent = CF.t('banner.mods'); b.hidden = false; }
      else b.hidden = true;
      return p;
    },

    planTotal: function () {
      var p = S.programWeek();
      return CF.scheduleTotal(CF.buildSchedule({
        exercises: CF.EXERCISES, work: p.work, rest: p.rest,
        warmup: S.get('warmup'), cooldown: S.get('cooldown')
      }));
    },

    /* ---------------- today ---------------- */
    renderToday: function () {
      var p = UI.paintChrome();
      var done = S.doneToday();
      var d = new Date();
      $('todayDate').textContent = d.toLocaleDateString(CF.I18n.locale(), { weekday: 'short', day: 'numeric', month: 'short' });
      $('footTime').textContent = fmtDur(UI.planTotal());
      $('footMoves').textContent = CF.EXERCISES.length + ' ' + CF.t('label.moves');
      $('footClip').textContent = fmtSec(S.clipFor(CF.EXERCISES[0]).start);

      var hero = $('hero'), resume = S.snap && S.snap.si < 99;
      hero.classList.toggle('done', done && !resume);
      $('heroResume').hidden = !resume;
      $('btnStart').hidden = !!resume;

      if (resume) {
        $('heroStatus').textContent = CF.t('hero.resume');
        $('heroTitle').textContent = CF.t('hero.resume.title');
        $('heroSub').textContent = CF.t('hero.resume.sub');
      } else if (done) {
        $('heroStatus').textContent = CF.t('hero.done');
        $('heroTitle').textContent = CF.t('hero.done.title');
        $('heroSub').textContent = CF.t('hero.done.sub');
        $('btnStartText').textContent = CF.t('btn.repeat');
      } else {
        $('heroStatus').textContent = CF.t('hero.ready');
        $('heroTitle').innerHTML = CF.t('hero.ready.title');
        $('heroSub').textContent = CF.t('hero.ready.sub');
        $('btnStartText').textContent = CF.t('btn.start');
      }

      // plan
      var html = '';
      var warm = S.get('warmup'), cool = S.get('cooldown');
      if (warm) html += row('—', CF.t('phase.warmup'), C.WARMUP + ' s', C.WARMUP);
      for (var i = 0; i < CF.EXERCISES.length; i++) {
        var ex = CF.EXERCISES[i], c = S.clipFor(ex);
        var sub = (ex.mode === 'reps' && ex.reps)
          ? ex.reps + ' ' + CF.t('label.reps') + ' · ' + CF.t('label.sec') + ' cap ' + p.work
          : p.work + 's · ' + p.rest + 's ' + CF.t('phase.rest').toLowerCase();
        var line = sub;
        if (S.get('videoSource') === 'youtube' && ex.videoId) {
          line += ' · ' + CF.t('clip.start').toLowerCase() + ' ' + fmtSec(c.start);
        }
        html += row(String(i + 1).padStart(2, '0'), exName(ex), line, p.work);
      }
      if (cool) html += row('—', CF.t('phase.cooldown'), C.COOLDOWN + ' s', C.COOLDOWN);
      $('planList').innerHTML = html;
      $('planTotal').textContent = fmtDur(UI.planTotal()) + ' ' + CF.t('label.total');

      // programme
      $('programWeek').textContent = 'W' + p.week;
      $('programLabel').textContent = p.label;
      $('programSets').textContent = p.work + 's ' + CF.t('phase.work').toLowerCase() + ' · ' + p.rest + 's ' + CF.t('phase.rest').toLowerCase();
      var doneW = S.weekCount(), goal = C.WEEKLY_GOAL;
      $('goalCount').textContent = doneW + '/' + goal;
      $('goalArc').style.strokeDashoffset = String(113 - 113 * Math.min(1, doneW / goal));
      $('programBar').style.width = Math.min(100, (S.history.length % 7) / 7 * 100) + '%';
      $('programHint').textContent = S.history.length + ' ' + CF.t('label.sessions').toLowerCase() +
        ' logged · ' + Math.max(0, 7 - (S.history.length % 7)) + ' to the next week';

      $('sTotal').textContent = S.history.length;
      $('sStreak').textContent = S.bestStreak();
      $('sMonth').textContent = S.monthCount();

      function row(num, name, sub, dur) {
        return '<li class="plan-item"><span class="plan-num">' + num + '</span>' +
          '<span class="plan-body"><b>' + name + '</b><small>' + sub + '</small></span>' +
          '<span class="plan-dur">' + fmtDur(dur) + '</span></li>';
      }
    },

    /* ---------------- progress ---------------- */
    renderProgress: function () {
      var d = new Date(), y = d.getFullYear(), m = d.getMonth();
      $('calTitle').textContent = d.toLocaleDateString(CF.I18n.locale(), { month: 'long', year: 'numeric' });
      var pre = y + '-' + String(m + 1).padStart(2, '0');
      var count = S.history.filter(function (h) { return h.d.indexOf(pre) === 0; }).length;
      $('calCount').textContent = count + ' ' + CF.t(count === 1 ? 'unit.session' : 'unit.sessions');

      var set = {};
      S.history.forEach(function (h) { set[h.d] = 1; });
      var first = new Date(y, m, 1).getDay();
      var days = new Date(y, m + 1, 0).getDate();
      var html = '', dows = ['S', 'M', 'T', 'W', 'T', 'F', 'S'], i;
      for (i = 0; i < 7; i++) html += '<div class="cal-dow">' + dows[i] + '</div>';
      for (i = 0; i < first; i++) html += '<div class="cal-day pad"></div>';
      for (i = 1; i <= days; i++) {
        var key = y + '-' + String(m + 1).padStart(2, '0') + '-' + String(i).padStart(2, '0');
        var cls = 'cal-day';
        if (set[key]) cls += ' done';
        if (key === S.dayKey()) cls += ' today';
        html += '<div class="' + cls + '">' + i + '</div>';
      }
      $('calGrid').innerHTML = html;

      var wk = '', min = 0, labels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
      var last7 = S.last7();
      for (i = 0; i < last7.length; i++) {
        var e = last7[i].entry;
        var dur = e ? (e.dur || 290) : 0;
        min += dur / 60;
        var h = e ? Math.max(14, Math.round((dur / 320) * 72)) : 6;
        wk += '<div class="week-col"><div class="week-bar' + (e ? ' on' : '') +
          (last7[i].date === S.dayKey() ? ' today' : '') + '" style="height:' + h + 'px"></div>' +
          '<span class="week-dow">' + labels[last7[i].dow] + '</span></div>';
      }
      $('weekChart').innerHTML = wk;
      $('weekTotal').textContent = Math.round(min) + ' ' + CF.t('unit.min');

      $('pTotal').textContent = S.history.length;
      $('pMin').textContent = S.totalMinutes();
      $('pCons').textContent = S.consistency(30) + '%';

      // weekly goal strip — last 7 days as filled cells
      var gb = '';
      for (i = 0; i < last7.length; i++) {
        gb += '<div class="goal-cell"><i class="' + (last7[i].entry ? 'on' : '') + '"></i>' +
          '<span>' + labels[last7[i].dow] + '</span></div>';
      }
      $('goalBars').innerHTML = gb;
      $('goalHint2').textContent = S.weekCount() + '/' + C.WEEKLY_GOAL + ' ' + CF.t('label.goal').toLowerCase();
    },

    /* ---------------- library ---------------- */
    renderLibrary: function () {
      UI.syncLibMode();
      var html = '';
      for (var i = 0; i < CF.EXERCISES.length; i++) {
        var ex = CF.EXERCISES[i], c = S.clipFor(ex);
        var tag = (ex.mode === 'reps' && ex.reps) ? '<span class="lib-tag">' + ex.reps + ' ' + CF.t('label.reps') + '</span>' : '';
        var hasVideo = !!ex.videoId;
        var mm = CF.Media.get(ex.id);
        var m = CF.Media.get(ex.id);
        var thumb = (m && m.poster) ? m.poster : (m && m.type === 'image' ? m.src : ex.demo);
        html += '<button class="lib-card" data-id="' + ex.id + '">' +
          '<span class="lib-thumb">' +
            '<img src="' + (thumb || '') + '" alt="" loading="lazy" decoding="async">' +
            (hasVideo ? '<span class="lib-play"><svg class="ic"><use href="#i-play"/></svg></span>' : '') +
            '<span class="lib-badge">' + ((mm && mm.type === 'video') ? 'LOOP'
              : hasVideo && S.get('videoSource') === 'youtube' ? fmtSec(c.start) + '–' + fmtSec(c.end)
              : mm ? CF.t('demo.figures') : CF.t('demo.figures')) + '</span>' +
          '</span>' +
          '<span class="lib-body"><b>' + exName(ex) + tag + '</b>' +
          '<small>' + CF.t('clip.start') + ' ' + fmtSec(c.start) + ' → ' + fmtSec(c.end) + '<br>' +
          (S.profile.flags && S.profile.flags.length ? CF.pick(ex.regression) : CF.pick(ex.progression)) + '</small></span>' +
          '<span class="lib-go"><svg class="ic" style="width:16px;height:16px"><use href="#i-play"/></svg></span>' +
        '</button>';
      }
      $('libList').innerHTML = html;
      $('libCount').textContent = CF.EXERCISES.length + ' ' + CF.t('label.moves');
    },

    syncLibMode: function () {
      var mode = S.get('videoMode') || 'auto';
      document.querySelectorAll('#libMode button').forEach(function (b) {
        b.setAttribute('aria-pressed', b.dataset.vmode === mode ? 'true' : 'false');
      });
      var h = $('libModeHint');
      if (h) h.textContent = mode === 'off'
        ? 'Animated figures — no connection needed.'
        : (navigator.onLine === false ? 'Offline: showing figures.' : 'Clips, with figures as the fallback.');
    },

    renderExtras: function () {
      var html = '';
      var list = CF.EXTRA_MOVES || [];
      for (var i = 0; i < list.length; i++) {
        var ex = list[i];
        var m = CF.Media.get(ex.id);
        var thumb = (m && m.poster) ? m.poster : (m && m.type === 'image' ? m.src : ex.demo);
        html += '<div class="lib-card static">' +
          '<span class="lib-thumb">' +
            '<img src="' + thumb + '" alt="" loading="lazy" decoding="async">' +
          '</span>' +
          '<span class="lib-body"><b>' + CF.pick(ex.name) + '</b>' +
          '<small>' + CF.pick(ex.tag) + ' · ' + CF.pick(ex.cue) + '</small></span>' +
        '</div>';
      }
      $('extraList').innerHTML = html;
    },

    renderCredits: function () {
      var html = '', i;
      var all = CF.EXERCISES.concat(CF.EXTRA_MOVES || []);
      for (i = 0; i < all.length; i++) {
        var ex = all[i];
        if (!ex.credit) continue;
        var mm = CF.Media.get(ex.id);
        html += '<div class="credit">' +
          '<img src="' + (mm && mm.type === 'image' ? mm.src : ex.demo) + '" alt="">' +
          '<div><b>' + CF.pick(ex.name) + '</b>' +
          '<small>' + ex.credit.title + '<br>' + ex.credit.author + ' · ' +
          '<a href="' + ex.credit.url + '" target="_blank" rel="noopener">YouTube ↗</a>' +
          (mm ? '<br>Still: generated for CoreFit MD' : '') + '</small></div>' +
        '</div>';
      }
      html += '<div class="credit"><img src="assets/demo/warmup.svg" alt="">' +
        '<div><b>' + CF.t('phase.warmup') + ' / ' + CF.t('phase.cooldown') + '</b>' +
        '<small>Stills and animated figures drawn or generated for CoreFit MD</small></div></div>';
      $('creditsList').innerHTML = html;
    },

    renderAll: function () {
      UI.renderToday();
      if (UI.currentView === 'progress') UI.renderProgress();
      if (UI.currentView === 'library') { UI.renderLibrary(); UI.renderExtras(); }
    },

    /* ---------------- settings ---------------- */
    renderSettings: function () {
      var html = '';
      for (var i = 0; i < TOGGLES.length; i++) {
        var t = TOGGLES[i];
        html += '<div class="set-row"><div><span>' + CF.t(t.label) + '</span><small>' + CF.t(t.desc) + '</small></div>' +
          '<button class="switch" role="switch" data-key="' + t.key + '" aria-checked="' +
          (S.get(t.key) ? 'true' : 'false') + '"></button></div>';
      }
      $('settingsList').innerHTML = html;
      var sp = S.get('speed');
      document.querySelectorAll('#speedSwitch button').forEach(function (b) {
        b.setAttribute('aria-pressed', parseFloat(b.dataset.speed) === sp ? 'true' : 'false');
      });
      var volEl = document.getElementById('volRange');
      if (volEl) volEl.value = Math.round((S.get('volume') === undefined ? 0.7 : S.get('volume')) * 100);
      document.querySelectorAll('#videoSourceSwitch button').forEach(function (b) {
        b.setAttribute('aria-pressed', b.dataset.vsrc === (S.get('videoSource') || 'local') ? 'true' : 'false');
      });
      document.querySelectorAll('#videoModeSwitch button, #libMode button').forEach(function (b) {
        b.setAttribute('aria-pressed', b.dataset.vmode === (S.get('videoMode') || 'auto') ? 'true' : 'false');
      });
      var lmh = $('libModeHint');
      if (lmh) lmh.textContent = (S.get('videoMode') === 'off')
        ? 'Animated figures — no connection needed.'
        : (navigator.onLine === false ? 'Offline: showing figures.' : 'Clips, with figures as the fallback.');
      document.querySelectorAll('#themeSwitch button').forEach(function (b) {
        b.setAttribute('aria-pressed', b.dataset.theme === (S.get('theme') || 'auto') ? 'true' : 'false');
      });
      document.querySelectorAll('#langSwitch button').forEach(function (b) {
        b.setAttribute('aria-pressed', b.dataset.lang === S.get('lang') ? 'true' : 'false');
      });
      $('reminderTime').value = S.get('reminderTime') || '07:00';
      $('reminderState').textContent = S.get('reminders')
        ? (('Notification' in window && Notification.permission === 'granted') ? 'Allowed' : 'Permission needed')
        : 'Off';
      $('settingsNote').textContent = 'Clips, history and streaks are stored on this device only. Export a backup from the Progress tab.';
    },

    /* ---------------- screening ---------------- */
    renderScreening: function () {
      var html = '';
      for (var i = 0; i < C.SCREENING.length; i++) {
        var it = C.SCREENING[i];
        var checked = (S.profile.flags || []).indexOf(it.id) >= 0;
        html += '<label><input type="checkbox" value="' + it.id + '"' + (checked ? ' checked' : '') + '><span>' + it.en + '</span></label>';
      }
      $('screenList').innerHTML = html;
    },

    /* ---------------- sheets ---------------- */
    open: function (id) {
      var el = $(id);
      if (!el) return;
      el.classList.add('on');
      if (id === 'settingsSheet') UI.renderSettings();
      if (id === 'postSheet') UI.renderRpe();
    },
    close: function (id) { var el = $(id); if (el) el.classList.remove('on'); },
    closeAll: function () {
      document.querySelectorAll('.sheet.on,.modal.on').forEach(function (e) { e.classList.remove('on'); });
    },

    rpeValue: null,
    renderRpe: function () {
      var html = '';
      for (var i = 1; i <= 10; i++) {
        html += '<button data-rpe="' + i + '" aria-pressed="' + (UI.rpeValue === i) + '">' + i + '</button>';
      }
      $('rpeChips').innerHTML = html;
      var lab = document.getElementById('rpeLabel');
      if (lab) lab.textContent = UI.rpeValue ? C.RPE_LABELS[UI.rpeValue] : '';
    },

    /* ---------------- toast ---------------- */
    toast: function (msg) {
      var t = $('toast');
      t.textContent = msg;
      t.classList.add('on');
      clearTimeout(UI._tt);
      UI._tt = setTimeout(function () { t.classList.remove('on'); }, 2200);
    },

    switchView: function (name) {
      UI.currentView = name;
      try { history.replaceState(null, '', '#' + name); } catch (e) {}
      document.querySelectorAll('.segmented button').forEach(function (b) {
        b.setAttribute('aria-selected', b.dataset.view === name ? 'true' : 'false');
      });
      document.querySelectorAll('.view').forEach(function (v) {
        v.classList.toggle('active', v.id === 'view-' + name);
      });
      if (name === 'progress') UI.renderProgress();
      if (name === 'library') { UI.renderLibrary(); UI.renderExtras(); }
    },

    /* ---------------- share card ---------------- */
    drawShareCard: function () {
      var cv = $('shareCanvas'), g = cv.getContext('2d');
      var W = cv.width, H = cv.height;
      var grad = g.createLinearGradient(0, 0, W, H);
      grad.addColorStop(0, '#0d6b55'); grad.addColorStop(.55, '#0a4f3e'); grad.addColorStop(1, '#06382b');
      g.fillStyle = grad; g.fillRect(0, 0, W, H);
      g.fillStyle = 'rgba(255,255,255,.06)';
      for (var y = 0; y < H; y += 48) g.fillRect(0, y, W, 1);

      g.fillStyle = 'rgba(255,255,255,.7)';
      g.font = '600 34px "Azeret Mono", monospace';
      g.fillText('COREFIT MD', 80, 130);

      g.fillStyle = '#f4fffb';
      g.font = '800 220px "Bricolage Grotesque", sans-serif';
      g.fillText(String(S.streak()), 80, 360);
      g.font = '700 46px "Bricolage Grotesque", sans-serif';
      g.fillText('day streak', 84, 424);

      var d = new Date(), y2 = d.getFullYear(), m = d.getMonth();
      var set = {}; S.history.forEach(function (h) { set[h.d] = 1; });
      var first = new Date(y2, m, 1).getDay();
      var days = new Date(y2, m + 1, 0).getDate();
      var cell = 108, gap = 12, x0 = 84, y0 = 520;
      g.font = '600 24px "Azeret Mono", monospace';
      g.fillStyle = 'rgba(255,255,255,.6)';
      g.fillText(d.toLocaleDateString(CF.I18n.locale(), { month: 'long', year: 'numeric' }).toUpperCase(), 84, y0 - 34);
      var idx = first;
      for (var i = 1; i <= days; i++) {
        var col = idx % 7, row = Math.floor(idx / 7);
        var key = y2 + '-' + String(m + 1).padStart(2, '0') + '-' + String(i).padStart(2, '0');
        var x = x0 + col * (cell + gap), yb = y0 + row * (cell + gap);
        g.fillStyle = set[key] ? 'rgba(255,255,255,.92)' : 'rgba(255,255,255,.13)';
        g.beginPath();
        if (g.roundRect) g.roundRect(x, yb, cell, cell, 18); else g.rect(x, yb, cell, cell);
        g.fill();
        idx++;
      }
      g.fillStyle = 'rgba(255,255,255,.65)';
      g.font = '500 30px "Azeret Mono", monospace';
      g.fillText(S.history.length + ' sessions · ' + S.totalMinutes() + ' minutes', 84, H - 90);
      return cv;
    },

    /* ---------------- print summary ---------------- */
    printSummary: function () {
      var rows = S.history.slice().sort(function (a, b) { return a.d < b.d ? 1 : -1; }).map(function (h) {
        return '<tr><td>' + h.d + '</td><td>' + fmtDur(h.dur || 0) + '</td><td>' + (h.moves || 0) + '</td><td>' +
          (h.rpe || '—') + '</td><td>' + (h.pain ? 'Yes' : '—') + '</td><td>' + (h.note || '') + '</td></tr>';
      }).join('');
      var html = '<!doctype html><html><head><meta charset="utf-8"><title>CoreFit MD — session summary</title>' +
        '<style>body{font-family:-apple-system,Segoe UI,Roboto,sans-serif;color:#16211d;padding:32px;max-width:760px;margin:0 auto}' +
        'h1{font-size:20px;margin:0 0 4px}p.meta{color:#6b7770;font-size:12px;margin:0 0 22px}' +
        'table{width:100%;border-collapse:collapse;font-size:12px}th,td{text-align:left;padding:7px 8px;border-bottom:1px solid #e3e7e2}' +
        'th{font-size:10px;letter-spacing:.08em;text-transform:uppercase;color:#6b7770}' +
        '.k{display:flex;gap:26px;margin:0 0 20px}.k div{font-size:12px;color:#6b7770}.k b{display:block;font-size:22px;color:#0b5d4a}' +
        '@media print{@page{margin:16mm}}</style></head><body>' +
        '<h1>CoreFit MD — session summary</h1>' +
        '<p class="meta">Generated ' + new Date().toLocaleString() + ' · ' + S.history.length + ' sessions</p>' +
        '<div class="k"><div><b>' + S.streak() + '</b>day streak</div><div><b>' + S.bestStreak() + '</b>best streak</div>' +
        '<div><b>' + S.totalMinutes() + '</b>minutes</div><div><b>' + S.consistency(30) + '%</b>30-day consistency</div></div>' +
        '<table><thead><tr><th>Date</th><th>Duration</th><th>Moves</th><th>RPE</th><th>Pain</th><th>Note</th></tr></thead>' +
        '<tbody>' + (rows || '<tr><td colspan="6">No sessions logged.</td></tr>') + '</tbody></table>' +
        '<p class="meta" style="margin-top:22px">Training log only. Not a medical record.</p>' +
        '<script>window.onload=function(){setTimeout(function(){window.print()},250)}<\/script></body></html>';
      var w = window.open('', '_blank');
      if (!w) { UI.toast('Allow pop-ups to print'); return; }
      w.document.open(); w.document.write(html); w.document.close();
    },

    download: function (name, text, mime) {
      var blob = new Blob([text], { type: mime || 'text/plain;charset=utf-8' });
      var a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(function () { URL.revokeObjectURL(a.href); }, 2000);
    }
  };

  function lastPain() {
    for (var i = S.history.length - 1; i >= 0; i--) {
      if (S.history[i].pain) {
        var days = (Date.now() - S.parseKey(S.history[i].d).getTime()) / 86400000;
        if (days <= 3) return true;
        return false;
      }
    }
    return false;
  }

  CF.UI = UI;
})(window.CF = window.CF || {});
