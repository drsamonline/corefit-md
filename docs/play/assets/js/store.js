/* CoreFit MD — persistence layer.
   Everything lives in localStorage. One object owns every read and write so the
   rest of the app never touches storage directly. */
(function (CF) {
  'use strict';
  var C = CF.CONFIG, K = C.KEYS;

  function read(key, fallback) {
    try {
      var raw = localStorage.getItem(key);
      if (raw === null) return fallback;
      var v = JSON.parse(raw);
      return (v === null || v === undefined) ? fallback : v;
    } catch (e) { return fallback; }
  }
  function write(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); return true; }
    catch (e) { return false; }
  }

  var Store = {
    history: [],
    clips: {},
    settings: {},
    profile: { screened: false, flags: [], lang: 'en', createdAt: null },
    snap: null,

    /* ---------- load / migrate ---------- */
    load: function () {
      var s = Object.assign({}, C.DEFAULT_SETTINGS, read(K.settings, {}));
      Store.settings = s;

      var p = Object.assign({}, Store.profile, read(K.profile, {}));
      Store.profile = p;
      if (p.lang && p.lang !== s.lang) s.lang = p.lang;

      Store.clips = read(K.clips, {}) || {};

      var h = read(K.history, null);
      if (!h) h = migrateV1();
      Store.history = normalizeHistory(h);

      var snap = read(K.session, null);
      if (snap && snap.at && (Date.now() - snap.at) < C.RESUME_WINDOW_MS) Store.snap = snap;
      return Store;
    },

    /* ---------- settings ---------- */
    get: function (key) { return Store.settings[key]; },
    set: function (key, value) {
      Store.settings[key] = value;
      if (key === 'lang') { Store.profile.lang = value; write(K.profile, Store.profile); }
      write(K.settings, Store.settings);
      return value;
    },

    /* ---------- profile ---------- */
    saveProfile: function (patch) {
      Object.assign(Store.profile, patch || {});
      write(K.profile, Store.profile);
    },

    /* ---------- clips ---------- */
    clipFor: function (ex) {
      var c = Store.clips[ex.id];
      var start = (c && typeof c.start === 'number') ? c.start : (ex.clip ? ex.clip.start : C.DEMO_START);
      var end = (c && typeof c.end === 'number') ? c.end : start + C.DEMO_WINDOW;
      if (end <= start) end = start + C.DEMO_WINDOW;
      return { start: start, end: end };
    },
    setClip: function (id, start, end) {
      Store.clips[id] = { start: Math.max(0, Math.round(start)), end: Math.max(1, Math.round(end)) };
      write(K.clips, Store.clips);
    },
    resetClip: function (id) { delete Store.clips[id]; write(K.clips, Store.clips); },

    /* ---------- history ---------- */
    addSession: function (entry) {
      var key = dayKey();
      var i = -1;
      for (var k = 0; k < Store.history.length; k++) if (Store.history[k].d === key) { i = k; break; }
      if (i >= 0) Store.history[i] = Object.assign({}, Store.history[i], entry, { d: key });
      else Store.history.push(Object.assign({ d: key }, entry));
      Store.history.sort(function (a, b) { return a.d < b.d ? -1 : 1; });
      write(K.history, Store.history);
      return Store.history;
    },
    patchToday: function (patch) {
      var key = dayKey();
      for (var i = 0; i < Store.history.length; i++) {
        if (Store.history[i].d === key) { Object.assign(Store.history[i], patch); write(K.history, Store.history); return true; }
      }
      return false;
    },
    doneToday: function () { return !!entryFor(dayKey()); },

    /* ---------- session snapshot ---------- */
    saveSnap: function (snap) { Store.snap = snap; write(K.session, snap); },
    clearSnap: function () { Store.snap = null; try { localStorage.removeItem(K.session); } catch (e) {} },

    /* ---------- derived stats ---------- */
    // One missed day is forgiven anywhere in the chain (a grace day), two in a
    // row end it. Today not being logged yet never breaks anything.
    streak: function () {
      var set = {}, i;
      for (i = 0; i < Store.history.length; i++) set[Store.history[i].d] = 1;
      var d = new Date(); d.setHours(0, 0, 0, 0);
      if (!set[dayKey(d)]) {
        d.setDate(d.getDate() - 1);
        if (!set[dayKey(d)]) return 0;
      }
      var n = 0, grace = 1, guard = 0;
      while (guard++ < 500) {
        if (set[dayKey(d)]) { n++; }
        else if (grace > 0) { grace--; }
        else break;
        d.setDate(d.getDate() - 1);
      }
      return n;
    },
    bestStreak: function () {
      if (!Store.history.length) return 0;
      var keys = Store.history.map(function (h) { return h.d; }).sort();
      var best = 1, cur = 1;
      for (var i = 1; i < keys.length; i++) {
        var diff = (parseKey(keys[i]) - parseKey(keys[i - 1])) / 86400000;
        if (diff === 1) cur++;
        else if (diff > 1) { best = Math.max(best, cur); cur = 1; }
      }
      return Math.max(best, cur);
    },
    monthCount: function () {
      var d = new Date(), pre = d.getFullYear() + '-' + pad(d.getMonth() + 1);
      return Store.history.filter(function (h) { return h.d.indexOf(pre) === 0; }).length;
    },
    totalMinutes: function () {
      var s = 0;
      for (var i = 0; i < Store.history.length; i++) s += (Store.history[i].dur || 0);
      return Math.round(s / 60);
    },
    weekCount: function () {
      var d = new Date(); d.setHours(0, 0, 0, 0);
      var dow = (d.getDay() + 6) % 7;           // Monday = 0
      d.setDate(d.getDate() - dow);
      var from = dayKey(d), n = 0;
      for (var i = 0; i < Store.history.length; i++) if (Store.history[i].d >= from) n++;
      return n;
    },
    consistency: function (days) {
      days = days || 30;
      if (!Store.history.length) return 0;
      var d = new Date(); d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() - (days - 1));
      var from = dayKey(d), n = 0;
      for (var i = 0; i < Store.history.length; i++) if (Store.history[i].d >= from) n++;
      return Math.min(100, Math.round(n / days * 100));
    },
    programWeek: function () {
      var w = Math.floor(Store.history.length / 7) + 1;
      if (w > C.PROGRAM.length) w = C.PROGRAM.length;
      return C.PROGRAM[w - 1];
    },
    last7: function () {
      var out = [];
      for (var i = 6; i >= 0; i--) {
        var d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - i);
        var e = entryFor(dayKey(d));
        out.push({ date: dayKey(d), dow: d.getDay(), entry: e });
      }
      return out;
    },

    /* ---------- import / export ---------- */
    exportJSON: function () {
      return JSON.stringify({
        app: 'CoreFit MD', version: C.VERSION, exportedAt: new Date().toISOString(),
        history: Store.history, clips: Store.clips, settings: Store.settings, profile: Store.profile
      }, null, 2);
    },
    importJSON: function (text) {
      var data = JSON.parse(text);
      if (!data || typeof data !== 'object') throw new Error('Not a CoreFit backup');
      if (Array.isArray(data.history)) {
        Store.history = normalizeHistory(data.history);
        write(K.history, Store.history);
      }
      if (data.clips && typeof data.clips === 'object') { Store.clips = data.clips; write(K.clips, Store.clips); }
      if (data.settings && typeof data.settings === 'object') {
        Object.assign(Store.settings, data.settings); write(K.settings, Store.settings);
      }
      if (data.profile && typeof data.profile === 'object') Store.saveProfile(data.profile);
      return { sessions: Store.history.length };
    }
  };

  /* ---------- helpers ---------- */
  function pad(n) { return String(n).padStart(2, '0'); }
  function dayKey(d) {
    d = d || new Date();
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  }
  function parseKey(k) { return new Date(k + 'T00:00:00'); }
  function entryFor(key) {
    for (var i = 0; i < Store.history.length; i++) if (Store.history[i].d === key) return Store.history[i];
    return null;
  }
  function normalizeHistory(list) {
    if (!Array.isArray(list)) return [];
    return list.map(function (h) {
      if (typeof h === 'string') return { d: h, dur: 290, moves: 5 };
      return {
        d: h.d || h.date,
        dur: h.dur || 290,
        moves: h.moves || 5,
        rpe: h.rpe || null,
        pain: !!h.pain,
        note: h.note || '',
        skipped: h.skipped || []
      };
    }).filter(function (h) { return !!h.d; }).sort(function (a, b) { return a.d < b.d ? -1 : 1; });
  }
  // Older single-file builds stored a plain array of ISO dates under this key.
  function migrateV1() {
    var old = read('corefit_md_history', null);
    if (!old) old = read('corefit_md_history_v2', null);
    return old || [];
  }

  Store.dayKey = dayKey;
  Store.parseKey = parseKey;
  Store.entryFor = entryFor;
  CF.Store = Store;
})(window.CF = window.CF || {});
