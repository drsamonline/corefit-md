/* CoreFit MD — controller.
   Owns the session lifecycle, the video, sound, haptics and every user gesture. */
(function (CF) {
  'use strict';
  var S = CF.Store, C = CF.CONFIG, UI = CF.UI;
  var $ = function (id) { return document.getElementById(id); };

  var session = null;
  var player = null;
  var currentVideoId = null;
  var wakeLock = null;
  var audioCtx = null;
  var lastBeepSec = -1;
  var lastCueIdx = -1;
  var snapTimer = null;
  var reminderTimer = null;

  /* ================= settings side-effects ================= */
  function applyTheme() {
    var t = S.get('theme') || 'auto';
    var dark = t === 'dark' || (t === 'auto' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
    var metas = document.querySelectorAll('meta[name="theme-color"]');
    if (metas.length) {
      metas[0].setAttribute('content', dark ? '#0d1412' : '#f5f1e8');
      if (metas[1]) metas[1].setAttribute('content', dark ? '#0d1412' : '#f5f1e8');
    }
    var b = $('btnTheme');
    if (b) b.innerHTML = '<svg class="ic"><use href="#' + (dark ? 'i-sun' : 'i-theme') + '"/></svg>';
  }

  function applySettings() {
    applyTheme();
    document.documentElement.classList.toggle('big-text', !!S.get('bigText'));
    $('stage').classList.toggle('audio-only', !!S.get('audioOnly'));
    $('btnSound').innerHTML = '<svg class="ic"><use href="#' + (S.get('videoSound') ? 'i-sound' : 'i-mute') + '"/></svg>';
    if (player) {
      S.get('videoSound') ? player.unmute() : player.mute();
      player.setSpeed(S.get('speed'));
    }
  }

  /* ================= sound ================= */
  function beep(freq, dur, gain) {
    if (!S.get('sound')) return;
    try {
      if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      if (audioCtx.state === 'suspended') audioCtx.resume();
      var o = audioCtx.createOscillator(), g = audioCtx.createGain();
      o.type = 'sine'; o.frequency.value = freq;
      g.gain.setValueAtTime(gain || 0.11, audioCtx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.0008, audioCtx.currentTime + dur);
      o.connect(g); g.connect(audioCtx.destination);
      o.start(); o.stop(audioCtx.currentTime + dur);
    } catch (e) {}
  }
  function buzz(ms) { if (!S.get('haptics')) return; try { navigator.vibrate && navigator.vibrate(ms); } catch (e) {} }
  function speak(text) {
    if (!S.get('voice') || !window.speechSynthesis) return;
    try {
      window.speechSynthesis.cancel();
      var u = new SpeechSynthesisUtterance(text);
      u.rate = 1.02; u.volume = 0.9;
      window.speechSynthesis.speak(u);
    } catch (e) {}
  }

  /* ================= wake lock ================= */
  function keepAwake() {
    if (!S.get('wake') || !navigator.wakeLock) return;
    navigator.wakeLock.request('screen').then(function (l) { wakeLock = l; }).catch(function () {});
  }
  function releaseWake() { try { if (wakeLock) { wakeLock.release(); wakeLock = null; } } catch (e) {} }

  /* ================= video ================= */
  function ensurePlayer(ex) {
    var clip = S.clipFor(ex);
    if (!player) {
      player = CF.Video.create($('videoHost'), {
        videoId: ex.videoId,
        backupIds: ex.backupIds || [],
        start: clip.start, end: clip.end,
        speed: S.get('speed'),
        muted: !S.get('videoSound'),
        onError: function () { showDemo(demoFor(ex)); },
        onReady: function (p) {
          if (player && player.failed) showDemo(demoFor(ex)); else hideDemo();
          if (S.get('videoSound')) p.unmute(); else p.mute();
        }
      });
      currentVideoId = ex.videoId;
      return;
    }
    if (currentVideoId !== ex.videoId) {
      player.load({ videoId: ex.videoId, backupIds: ex.backupIds || [], start: clip.start, end: clip.end });
      currentVideoId = ex.videoId;
    } else {
      player.start = clip.start; player.end = clip.end;
    }
  }

  // The offline layer: every move ships an animated SVG drawn for this app, so
  // a dead embed, a blocked network or airplane mode still shows the movement.
  function showDemo(opts) {
    opts = opts || {};
    var fb = $('videoFallback');
    var img = $('demoImg');
    if (!opts.src) { hideDemo(); return; }
    if (img.getAttribute('src') !== opts.src) img.setAttribute('src', opts.src);
    img.alt = opts.label || '';
    $('demoLabel').textContent = opts.label || CF.t('demo.offline');
    var credit = $('demoCredit');
    if (opts.creditUrl) {
      credit.href = opts.creditUrl;
      credit.textContent = (opts.creditLabel || 'Reference') + ' ↗';
      credit.hidden = false;
    } else {
      credit.hidden = true;
    }
    fb.classList.add('on');
    $('videoHost').style.opacity = '0';
    $('noClip').classList.remove('on');
  }
  function hideDemo() {
    $('videoFallback').classList.remove('on');
    $('videoHost').style.opacity = '1';
  }

  function demoFor(ex) {
    return {
      src: ex.demo,
      label: CF.pick(ex.name),
      creditUrl: ex.credit && ex.credit.url,
      creditLabel: ex.credit && ex.credit.author
    };
  }

  function videoWanted() {
    if (S.get('videoMode') === 'off') return false;
    if (navigator.onLine === false) return false;
    return true;
  }

  /* ================= stage ================= */
  function paintPhase(index, seg) {
    var stage = $('stage');
    stage.classList.toggle('working', seg.k === 'work');
    stage.classList.toggle('resting', seg.k === 'rest');

    var phase = $('phaseChip');
    phase.className = 'phase ' + (seg.k === 'work' ? 'work' : seg.k === 'rest' ? 'rest' : '');
    $('phaseText').textContent = CF.t('phase.' + seg.k);

    var ex = seg.ex >= 0 ? CF.EXERCISES[seg.ex] : null;
    var steps = '', cue = '';

    if (seg.k === 'warmup' || seg.k === 'cooldown') {
      var block = seg.k === 'warmup' ? CF.WARMUP : CF.COOLDOWN;
      $('exCount').textContent = CF.t('phase.' + seg.k);
      $('exName').textContent = seg.k === 'warmup' ? 'Prepare to move' : 'Wind down';
      $('exNext').textContent = '';
      cue = CF.pick(block.cues[0]);
      if (player) player.pause();
      showDemo({ src: block.demo, label: CF.t('phase.' + seg.k) });
      $('btnRepTap').hidden = true;
    } else if (seg.k === 'work') {
      $('exCount').textContent = (seg.ex + 1) + ' / ' + CF.EXERCISES.length + (seg.side ? ' · ' + CF.t(seg.side === 1 ? 'stage.sideL' : 'stage.sideR') : '');
      $('exName').textContent = CF.pick(ex.name);
      var nx = CF.EXERCISES[seg.ex + 1];
      $('exNext').textContent = nx ? CF.t('stage.upnext') + ' · ' + CF.pick(nx.name) : CF.t('stage.final');
      var modified = (S.profile.flags || []).length > 0;
      cue = CF.pick(ex.cue) + (modified ? '  ·  ' + CF.t('label.mod') + ': ' + CF.pick(ex.regression) : '');
      steps = ex.steps.map(function (s, i) { return '<li><b>' + (i + 1) + '</b><span>' + s + '</span></li>'; }).join('');
      var clip = S.clipFor(ex);
      $('videoBadgeText').textContent = ex.videoId ? UI.fmtSec(clip.start) : CF.t('demo.figures');
      if (ex.videoId && videoWanted()) {
        hideDemo();
        ensurePlayer(ex);
        player.seek(clip.start);
        player.play();
      } else {
        if (player) player.pause();
        showDemo(demoFor(ex));
      }
      var repMode = ex.mode === 'reps' && ex.reps > 0;
      $('btnRepTap').hidden = !repMode;
      if (repMode) $('repText').textContent = '0 / ' + ex.reps;
    } else {
      $('exCount').textContent = CF.t('phase.rest');
      $('exName').textContent = CF.t('stage.breathe');
      var up = CF.EXERCISES[seg.ex + 1];
      $('exNext').textContent = up ? CF.t('stage.upnext') + ' · ' + CF.pick(up.name) : '';
      cue = 'Roll down, breathe in through the nose, reset the brace.';
      $('btnRepTap').hidden = true;
      if (up) {
        showDemo({ src: up.demo, label: CF.t('stage.upnext') + ' · ' + CF.pick(up.name),
                   creditUrl: up.credit && up.credit.url, creditLabel: up.credit && up.credit.author });
      } else {
        showDemo({ src: CF.COOLDOWN.demo, label: CF.t('phase.cooldown') });
      }
      if (player) {
        player.pause();
        // preload the next clip while resting so the set opens instantly
        if (up && currentVideoId !== up.videoId) {
          var c2 = S.clipFor(up);
          player.load({ videoId: up.videoId, backupIds: up.backupIds || [], start: c2.start, end: c2.end, preload: true });
          currentVideoId = up.videoId;
        }
      }
    }

    $('cueLine').textContent = cue;
    $('stepsList').innerHTML = steps;
    $('segFill').style.width = '0%';
    $('timeLeft').textContent = Math.ceil(seg.dur);
    lastBeepSec = -1;
    lastCueIdx = -1;
    buildRail();
  }

  function buildRail() {
    var rail = $('rail');
    if (rail.children.length !== session.schedule.length) {
      var html = '';
      for (var i = 0; i < session.schedule.length; i++) html += '<div class="rail-seg ' + session.schedule[i].k + '"><i></i></div>';
      rail.innerHTML = html;
      for (i = 0; i < session.schedule.length; i++) rail.children[i].style.flexGrow = session.schedule[i].dur;
    }
    for (var j = 0; j < rail.children.length; j++) {
      rail.children[j].classList.toggle('now', j === session.si);
      rail.children[j].firstChild.style.width = (j < session.si ? 100 : 0) + '%';
    }
  }

  function onTick(st) {
    var disp = Math.ceil(st.remaining);
    if ($('timeLeft').textContent !== String(disp)) $('timeLeft').textContent = disp;

    $('segFill').style.width = (st.segProgress * 100).toFixed(1) + '%';
    var rail = $('rail').children[st.index];
    if (rail) rail.firstChild.style.width = (st.segProgress * 100).toFixed(1) + '%';

    var left = UI.fmtDur(st.totalLeft) + ' ' + CF.t('label.left');
    if ($('sessionLeft').textContent !== left) $('sessionLeft').textContent = left;

    // warm-up / cool-down cue rotation
    var seg = st.seg;
    if (seg && (seg.k === 'warmup' || seg.k === 'cooldown')) {
      var block = seg.k === 'warmup' ? CF.WARMUP : CF.COOLDOWN;
      var elapsed = seg.dur - st.remaining;
      var idx = 0;
      for (var i = 0; i < block.cues.length; i++) if (elapsed >= block.cues[i].at) idx = i;
      if (idx !== lastCueIdx) {
        lastCueIdx = idx;
        var txt = CF.pick(block.cues[idx]);
        $('cueLine').textContent = txt;
        $('noClipCue').textContent = txt;
      }
    }

    // countdown beeps
    if (seg && seg.k !== 'warmup' && seg.k !== 'cooldown' && disp <= 3 && disp > 0 && disp !== lastBeepSec) {
      lastBeepSec = disp;
      beep(420, 0.06, 0.07);
      if (disp === 3) buzz(35);
    }

    if (player && seg && seg.k === 'work') player.enforceWindow();

    // rep counter display
    if (seg && seg.k === 'work' && !$('btnRepTap').hidden) {
      var ex = CF.EXERCISES[seg.ex];
      if (ex && ex.reps) $('repText').textContent = st.reps + ' / ' + ex.reps;
    }
  }

  function onPhase(index, seg) {
    paintPhase(index, seg);
    if (seg.k === 'work') {
      beep(660, 0.16, 0.13); buzz(150);
      var ex = CF.EXERCISES[seg.ex];
      if (ex) speak(CF.pick(ex.name) + (seg.side ? '. ' + CF.t(seg.side === 1 ? 'stage.sideL' : 'stage.sideR') : ''));
    } else if (seg.k === 'rest') {
      beep(520, 0.12, 0.09); buzz(100);
    } else {
      beep(560, 0.1, 0.08);
    }
  }

  function onDone(sum) {
    releaseWake();
    stopSnapshot();
    if (player) player.pause();
    beep(700, 0.18, 0.15);
    setTimeout(function () { beep(900, 0.22, 0.15); }, 170);
    buzz([110, 60, 190]);

    S.addSession({ dur: sum.duration, moves: sum.movesDone, skipped: sum.skipped });
    S.clearSnap();
    UI.rpeValue = null;
    $('workoutBody').style.display = 'none';
    $('doneView').classList.add('on');
    $('doneStreak').textContent = S.streak();
    $('doneTime').textContent = UI.fmtDur(sum.duration);
    $('doneMoves').textContent = sum.movesDone;
    $('doneLine').textContent = 'Logged. Same time tomorrow keeps the streak alive.';
    speak('Session complete. Well done.');
    UI.renderAll();
  }

  /* ================= start / resume / stop ================= */
  function buildSchedule() {
    var p = S.programWeek();
    return CF.buildSchedule({
      exercises: CF.EXERCISES, work: p.work, rest: p.rest,
      warmup: S.get('warmup'), cooldown: S.get('cooldown')
    });
  }

  function startSession(restore) {
    var schedule = buildSchedule();
    session = new CF.Session(schedule, {
      onPhase: onPhase,
      onTick: onTick,
      onDone: onDone,
      onAdvance: function () {},
      exFor: function (i) { return CF.EXERCISES[i]; }
    });

    $('stage').classList.add('on');
    $('workoutBody').style.display = 'flex';
    $('doneView').classList.remove('on');
    $('stepsBox').open = false;
    $('sessionLeft').textContent = UI.fmtDur(CF.scheduleTotal(schedule)) + ' ' + CF.t('label.left');
    $('rail').innerHTML = '';
    applySettings();
    keepAwake();

    if (restore && S.snap) {
      if (!session.restore(S.snap)) session.start();
      UI.toast(CF.t('toast.resumed'));
    } else {
      session.start();
    }
    startSnapshot();
  }

  function startSnapshot() {
    stopSnapshot();
    snapTimer = setInterval(function () {
      if (session && session.running) S.saveSnap(session.snapshot());
    }, 2000);
  }
  function stopSnapshot() { if (snapTimer) { clearInterval(snapTimer); snapTimer = null; } }

  function endSession(quiet) {
    if (session) session.stop();
    releaseWake();
    stopSnapshot();
    if (player) { player.destroy(); player = null; }
    currentVideoId = null;
    $('stage').classList.remove('on');
    $('doneView').classList.remove('on');
    $('workoutBody').style.display = 'flex';
    $('rail').innerHTML = '';
    hideDemo();
    if (!quiet) UI.renderAll();
  }

  function quit() {
    var running = session && session.running;
    if (running && !confirm('End this session? Nothing will be logged.')) return;
    if (running) S.clearSnap();
    endSession();
    UI.toast(CF.t('toast.ended'));
  }

  /* ================= clip sheet ================= */
  var clipEx = null, clipPlayer = null, clipMode = 'time';

  function openClip(ex) {
    clipEx = ex;
    var c = S.clipFor(ex);
    $('clipName').textContent = UI.exName(ex);
    $('clipMeta').textContent = CF.t('clip.start') + ' ' + UI.fmtSec(c.start) + ' → ' + UI.fmtSec(c.end);
    $('trimStart').value = Math.round(c.start);
    $('trimEnd').value = Math.round(c.end);
    $('repTarget').value = ex.reps || 12;
    $('backupId').value = (ex.backupIds && ex.backupIds[0]) || '';
    $('clipBadge').textContent = UI.fmtSec(c.start);
    $('modEasier').textContent = CF.pick(ex.regression);
    $('modHarder').textContent = CF.pick(ex.progression);
    clipMode = ex.mode || 'time';
    setMode(clipMode);
    UI.open('clipSheet');
    mountClip(ex, c);
  }

  function setMode(m) {
    clipMode = m;
    document.querySelectorAll('#modeSwitch button').forEach(function (b) {
      b.setAttribute('aria-pressed', b.dataset.mode === m ? 'true' : 'false');
    });
    $('repTarget').closest('.field').style.opacity = m === 'reps' ? '1' : '.45';
    $('repTarget').disabled = m !== 'reps';
  }

  function mountClip(ex, c) {
    if (clipPlayer) { clipPlayer.destroy(); clipPlayer = null; }
    clipPlayer = CF.Video.create($('clipHost'), {
      videoId: ex.videoId, backupIds: ex.backupIds || [],
      start: c.start, end: c.end, muted: !S.get('videoSound'),
      onError: function () { UI.toast('Preview blocked here'); }
    });
    clipPlayer.play();
  }

  function saveClip() {
    if (!clipEx) return;
    var s = Math.max(0, parseInt($('trimStart').value, 10) || 0);
    var e = Math.max(s + 5, parseInt($('trimEnd').value, 10) || (s + C.DEMO_WINDOW));
    S.setClip(clipEx.id, s, e);
    clipEx.mode = clipMode;
    clipEx.reps = Math.max(1, parseInt($('repTarget').value, 10) || 12);
    var bk = ($('backupId').value || '').trim();
    clipEx.backupIds = bk ? [bk] : [];
    try { localStorage.setItem('corefit.exmods.v2', JSON.stringify(exerciseOverrides())); } catch (err) {}
    $('clipBadge').textContent = UI.fmtSec(s);
    $('clipMeta').textContent = CF.t('clip.start') + ' ' + UI.fmtSec(s) + ' → ' + UI.fmtSec(e);
    mountClip(clipEx, { start: s, end: e });
    UI.renderAll();
    UI.toast(CF.t('toast.clip'));
  }

  function exerciseOverrides() {
    return CF.EXERCISES.map(function (ex) { return { id: ex.id, mode: ex.mode, reps: ex.reps, backupIds: ex.backupIds }; });
  }
  function loadOverrides() {
    try {
      var raw = JSON.parse(localStorage.getItem('corefit.exmods.v2') || 'null');
      if (!Array.isArray(raw)) return;
      raw.forEach(function (o) {
        var ex = CF.EXERCISES.filter(function (e) { return e.id === o.id; })[0];
        if (ex) { ex.mode = o.mode || 'time'; ex.reps = o.reps || ex.reps; ex.backupIds = o.backupIds || []; }
      });
    } catch (e) {}
  }

  /* ================= export / import ================= */
  function exportCsv() {
    if (!S.history.length) { UI.toast('No sessions yet'); return; }
    var rows = [['date', 'duration_seconds', 'duration_display', 'moves', 'rpe', 'pain', 'note']];
    S.history.forEach(function (h) {
      rows.push([h.d, h.dur || 0, UI.fmtDur(h.dur || 0), h.moves || 0, h.rpe || '', h.pain ? 'yes' : '', '"' + (h.note || '').replace(/"/g, '""') + '"']);
    });
    UI.download('corefit-sessions.csv', rows.map(function (r) { return r.join(','); }).join('\n'), 'text/csv;charset=utf-8');
    UI.toast(CF.t('toast.exported'));
  }

  /* ================= reminders ================= */
  function checkReminder() {
    if (!S.get('reminders')) return;
    var now = new Date();
    var want = (S.get('reminderTime') || '07:00').split(':');
    var key = S.dayKey();
    if (localStorage.getItem('corefit.notified') === key) return;
    if (now.getHours() === parseInt(want[0], 10) && now.getMinutes() === parseInt(want[1], 10)) {
      localStorage.setItem('corefit.notified', key);
      var title = 'CoreFit MD';
      var body = S.doneToday() ? 'Session already logged today.' : 'Five minutes of core — your streak is waiting.';
      try {
        if ('Notification' in window && Notification.permission === 'granted') new Notification(title, { body: body, icon: 'icons/icon-192.png' });
        else UI.toast(body);
      } catch (e) { UI.toast(body); }
    }
  }

  /* ================= boot ================= */
  function boot() {
    S.load();
    loadOverrides();
    try {
      var q = new URLSearchParams(location.search).get('lang');
      if (q && CF.STRINGS[q]) S.set('lang', q);
    } catch (e) {}
    CF.I18n.init(S.get('lang'));
    CF.I18n.apply(document);
    applySettings();
    UI.renderAll();
    var deep = (location.hash || '').replace('#', '');
    UI.switchView(['today', 'progress', 'library'].indexOf(deep) >= 0 ? deep : 'today');
    var stamp = $('buildStamp');
    if (stamp) stamp.textContent = 'v' + C.VERSION + ' · build ' + C.BUILD;

    // first-run screening
    if (!S.profile.screened) {
      UI.renderScreening();
      UI.open('screenModal');
    }
    // resume prompt is part of the hero; nothing to do here

    // service worker (http/https only — file:// has no SW)
    if ('serviceWorker' in navigator && location.protocol.indexOf('http') === 0) {
      navigator.serviceWorker.register('sw.js').catch(function () {});
    }

    reminderTimer = setInterval(checkReminder, 30000);
    checkReminder();

    document.addEventListener('visibilitychange', function () {
      if (document.visibilityState === 'visible' && session && session.running && !session.paused) {
        session.endsAt = Date.now() + session.remaining * 1000;
      }
    });
  }

  /* ================= events ================= */
  document.addEventListener('DOMContentLoaded', function () {
    boot();

    /* nav */
    document.querySelectorAll('.segmented button').forEach(function (b) {
      b.addEventListener('click', function () { UI.switchView(b.dataset.view); });
    });
    $('streakPill').addEventListener('click', function () { UI.switchView('progress'); });
    $('btnSettingsTop').addEventListener('click', function () { UI.open('settingsSheet'); });
    $('btnSettings').addEventListener('click', function () { UI.open('settingsSheet'); });
    $('btnLang').addEventListener('click', function () {
      var order = ['en', 'hi', 'gu'];
      var next = order[(order.indexOf(S.get('lang')) + 1) % order.length];
      setLang(next);
    });

    function setLang(l) {
      S.set('lang', l);
      CF.I18n.set(l);
      CF.I18n.apply(document);
      UI.renderAll();
      UI.renderSettings();
      UI.toast(CF.STRINGS[l]['lang.name']);
    }

    /* session */
    $('btnStart').addEventListener('click', function () {
      if ((S.profile.flags || []).length && !sessionStorage.getItem('corefit.painok')) {
        var ok = confirm('Modified plan is active. Stop immediately if any move causes pain.\n\nContinue?');
        if (!ok) return;
        sessionStorage.setItem('corefit.painok', '1');
      }
      CF.Video.warm();
      startSession(false);
    });
    $('btnResume').addEventListener('click', function () { CF.Video.warm(); startSession(true); });
    $('btnDiscard').addEventListener('click', function () { S.clearSnap(); UI.renderAll(); UI.toast('Session discarded'); });
    $('btnQuit').addEventListener('click', quit);
    $('btnPause').addEventListener('click', function () {
      if (!session) return;
      session.toggle();
      $('btnPause').innerHTML = '<svg class="ic"><use href="#' + (session.paused ? 'i-play' : 'i-pause') + '"/></svg>';
      if (player) session.paused ? player.pause() : player.play();
    });
    $('btnSkip').addEventListener('click', function () { if (session) { beep(380, 0.07, 0.07); session.skip(); } });
    $('btnRestart').addEventListener('click', function () {
      if (!session) return;
      session.restartSeg();
      var seg = session.schedule[session.si];
      if (seg.k === 'work' && player) { var c = S.clipFor(CF.EXERCISES[seg.ex]); player.seek(c.start); player.play(); }
      UI.toast('Restarted');
    });
    $('btnPlus').addEventListener('click', function () { if (session) session.adjust(10); });
    $('btnMinus').addEventListener('click', function () { if (session) session.adjust(-10); });
    $('btnRepTap').addEventListener('click', function () {
      if (!session) return;
      var n = session.addRep();
      beep(760, 0.05, 0.07); buzz(25);
      var seg = session.schedule[session.si];
      var ex = seg ? CF.EXERCISES[seg.ex] : null;
      if (ex && ex.reps) $('repText').textContent = Math.min(n, ex.reps) + ' / ' + ex.reps;
    });
    $('btnSound').addEventListener('click', function () {
      var v = !S.get('videoSound');
      S.set('videoSound', v);
      applySettings();
      UI.toast(v ? 'Video sound on' : 'Video muted');
    });

    /* done + post */
    $('btnDone').addEventListener('click', function () {
      endSession();
      UI.open('postSheet');
    });
    $('rpeChips').addEventListener('click', function (e) {
      var b = e.target.closest('button[data-rpe]');
      if (!b) return;
      UI.rpeValue = parseInt(b.dataset.rpe, 10);
      UI.renderRpe();
      var lab = $('rpeLabel');
      if (lab) lab.textContent = C.RPE_LABELS[UI.rpeValue];
    });
    $('painSwitch').addEventListener('click', function () {
      var on = $('painSwitch').getAttribute('aria-checked') !== 'true';
      $('painSwitch').setAttribute('aria-checked', on ? 'true' : 'false');
      $('painHint').textContent = on ? 'Recorded — try the easier variation next time' : '';
    });
    $('btnPostSave').addEventListener('click', function () {
      S.patchToday({
        rpe: UI.rpeValue,
        pain: $('painSwitch').getAttribute('aria-checked') === 'true',
        note: $('postNote').value.trim()
      });
      UI.close('postSheet');
      UI.toast(CF.t('toast.saved'));
      UI.renderAll();
      UI.switchView('progress');
    });

    /* library */
    $('libList').addEventListener('click', function (e) {
      var card = e.target.closest('.lib-card');
      if (!card) return;
      var ex = CF.EXERCISES.filter(function (x) { return x.id === card.dataset.id; })[0];
      if (ex) openClip(ex);
    });
    $('modeSwitch').addEventListener('click', function (e) {
      var b = e.target.closest('button[data-mode]');
      if (b) setMode(b.dataset.mode);
    });
    $('btnClipSave').addEventListener('click', saveClip);
    $('btnClipReset').addEventListener('click', function () {
      if (!clipEx) return;
      S.resetClip(clipEx.id);
      $('trimStart').value = C.DEMO_START;
      $('trimEnd').value = C.DEMO_START + C.DEMO_WINDOW;
      saveClip();
    });
    $('capStart').addEventListener('click', function () {
      if (clipPlayer && clipPlayer.ready) $('trimStart').value = Math.floor(clipPlayer.time());
    });
    $('capEnd').addEventListener('click', function () {
      if (clipPlayer && clipPlayer.ready) $('trimEnd').value = Math.floor(clipPlayer.time());
    });

    /* settings */
    $('settingsList').addEventListener('click', function (e) {
      var sw = e.target.closest('.switch');
      if (!sw) return;
      var key = sw.dataset.key;
      var val = !S.get(key);
      if (key === 'reminders' && val) {
        if ('Notification' in window && Notification.permission === 'default') {
          Notification.requestPermission().then(function (p) {
            S.set('reminders', p === 'granted');
            UI.renderSettings();
            UI.toast(p === 'granted' ? CF.t('toast.reminder') : 'Notifications blocked');
          });
          return;
        }
        if ('Notification' in window && Notification.permission === 'denied') {
          UI.toast('Notifications blocked in the browser');
          return;
        }
      }
      S.set(key, val);
      applySettings();
      UI.renderSettings();
    });
    $('btnTheme').addEventListener('click', function () {
      var order = ['auto', 'light', 'dark'];
      var next = order[(order.indexOf(S.get('theme') || 'auto') + 1) % order.length];
      S.set('theme', next);
      applyTheme();
      UI.renderSettings();
      UI.toast('Theme: ' + next);
    });
    $('themeSwitch').addEventListener('click', function (e) {
      var b = e.target.closest('button[data-theme]');
      if (!b) return;
      S.set('theme', b.dataset.theme);
      applyTheme();
      UI.renderSettings();
    });
    $('videoModeSwitch').addEventListener('click', function (e) {
      var b = e.target.closest('button[data-vmode]');
      if (!b) return;
      S.set('videoMode', b.dataset.vmode);
      UI.renderSettings();
      UI.toast(b.dataset.vmode === 'off' ? 'Figures only' : 'Clips when online');
    });
    $('btnCredits').addEventListener('click', function () {
      UI.renderCredits();
      UI.open('creditsSheet');
    });
    $('speedSwitch').addEventListener('click', function (e) {
      var b = e.target.closest('button[data-speed]');
      if (!b) return;
      S.set('speed', parseFloat(b.dataset.speed));
      applySettings();
      UI.renderSettings();
    });
    $('langSwitch').addEventListener('click', function (e) {
      var b = e.target.closest('button[data-lang]');
      if (b) setLang(b.dataset.lang);
    });
    $('reminderTime').addEventListener('change', function () {
      S.set('reminderTime', this.value || '07:00');
      UI.renderSettings();
    });

    /* screening */
    $('btnScreenSave').addEventListener('click', function () {
      var flags = [];
      document.querySelectorAll('#screenList input:checked').forEach(function (i) { flags.push(i.value); });
      S.saveProfile({ screened: true, flags: flags });
      UI.close('screenModal');
      UI.renderAll();
      if (flags.length) UI.toast('Modified plan active');
    });

    /* export / import */
    $('btnCsv').addEventListener('click', exportCsv);
    $('btnJson').addEventListener('click', function () {
      UI.download('corefit-backup.json', S.exportJSON(), 'application/json');
      UI.toast(CF.t('toast.exported'));
    });
    $('btnImport').addEventListener('click', function () { $('fileImport').click(); });
    $('fileImport').addEventListener('change', function () {
      var f = this.files && this.files[0];
      if (!f) return;
      var fr = new FileReader();
      fr.onload = function () {
        try {
          var r = S.importJSON(String(fr.result));
          CF.I18n.apply(document);
          UI.renderAll();
          UI.toast(CF.t('toast.imported') + ' · ' + r.sessions);
        } catch (e) { UI.toast(CF.t('toast.importfail')); }
      };
      fr.readAsText(f);
      this.value = '';
    });
    $('btnPrint').addEventListener('click', function () { UI.printSummary(); });
    $('btnShareCard').addEventListener('click', function () {
      UI.drawShareCard();
      UI.open('shareModal');
    });
    $('btnShareSave').addEventListener('click', function () {
      var cv = $('shareCanvas');
      try {
        var url = cv.toDataURL('image/png');
        var a = document.createElement('a');
        a.href = url; a.download = 'corefit-streak.png';
        document.body.appendChild(a); a.click(); document.body.removeChild(a);
        UI.toast(CF.t('toast.exported'));
      } catch (e) { UI.toast('Could not render the card'); }
    });

    /* generic close buttons */
    document.addEventListener('click', function (e) {
      var c = e.target.closest('[data-close]');
      if (c) {
        var id = c.dataset.close;
        if (id === 'clipSheet' && clipPlayer) { clipPlayer.destroy(); clipPlayer = null; }
        UI.close(id);
      }
    });
    document.querySelectorAll('.sheet,.modal').forEach(function (sh) {
      sh.addEventListener('click', function (e) { if (e.target === sh && sh.id !== 'screenModal') sh.classList.remove('on'); });
    });

    /* keyboard */
    document.addEventListener('keydown', function (e) {
      var tag = (e.target.tagName || '').toLowerCase();
      if (tag === 'input' || tag === 'textarea') return;
      var open = $('stage').classList.contains('on');
      if (e.key === 'Escape') {
        if ($('clipSheet').classList.contains('on')) return UI.close('clipSheet');
        if ($('settingsSheet').classList.contains('on')) return UI.close('settingsSheet');
        if ($('postSheet').classList.contains('on')) return UI.close('postSheet');
        if (open) return quit();
      }
      if (!open) return;
      if (e.key === ' ') { e.preventDefault(); $('btnPause').click(); }
      if (e.key === 'ArrowRight') { e.preventDefault(); $('btnSkip').click(); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); $('btnRestart').click(); }
    });
  });

  CF.App = { start: startSession, end: endSession };
})(window.CF = window.CF || {});
