/* CoreFit MD — session engine.
   Builds the segment schedule and runs a drift-free clock over it.
   Emits: onPhase(index, seg) · onTick(state) · onDone(summary) */
(function (CF) {
  'use strict';
  var C = CF.CONFIG;

  function buildSchedule(cfg) {
    var list = [], exs = cfg.exercises, work = cfg.work, rest = cfg.rest;
    if (cfg.warmup) list.push({ k: 'warmup', dur: C.WARMUP, ex: -1, side: 0 });
    for (var i = 0; i < exs.length; i++) {
      var ex = exs[i];
      if (ex.unilateral) {
        var half = Math.round(work / 2);
        list.push({ k: 'work', dur: half, ex: i, side: 1 });
        list.push({ k: 'work', dur: half, ex: i, side: 2 });
      } else {
        list.push({ k: 'work', dur: work, ex: i, side: 0 });
      }
      if (i < exs.length - 1) list.push({ k: 'rest', dur: rest, ex: i, side: 0 });
    }
    if (cfg.cooldown) list.push({ k: 'cooldown', dur: C.COOLDOWN, ex: -1, side: 0 });
    return list;
  }

  function totalOf(list) {
    var t = 0;
    for (var i = 0; i < list.length; i++) t += list[i].dur;
    return t;
  }

  function Session(schedule, cb) {
    this.schedule = schedule;
    this.total = totalOf(schedule);
    this.cb = cb || {};
    this.si = 0;
    this.remaining = schedule[0] ? schedule[0].dur : 0;
    this.endsAt = 0;
    this.paused = false;
    this.running = false;
    this.reps = 0;
    this.movesDone = 0;
    this.startedAt = 0;
    this.skipped = [];
    this._iv = null;
  }

  Session.prototype.start = function () {
    this.running = true;
    this.startedAt = Date.now();
    this._enter(0, this.schedule[0] ? this.schedule[0].dur : 0);
    var self = this;
    if (this._iv) clearInterval(this._iv);
    this._iv = setInterval(function () { self._tick(); }, 200);
    return this;
  };

  Session.prototype._enter = function (i, remaining) {
    this.si = i;
    var seg = this.schedule[i];
    if (!seg) return;
    this.remaining = (remaining == null) ? seg.dur : remaining;
    this.endsAt = Date.now() + this.remaining * 1000;
    this.reps = 0;
    if (this.cb.onPhase) this.cb.onPhase(i, seg);
    this._emit();
  };

  Session.prototype._emit = function () {
    var seg = this.schedule[this.si];
    var before = 0;
    for (var i = 0; i < this.si; i++) before += this.schedule[i].dur;
    var elapsed = before + (seg ? (seg.dur - Math.max(0, this.remaining)) : 0);
    if (this.cb.onTick) this.cb.onTick({
      index: this.si,
      seg: seg,
      remaining: Math.max(0, this.remaining),
      segProgress: seg ? Math.min(1, Math.max(0, 1 - this.remaining / seg.dur)) : 0,
      totalLeft: Math.max(0, this.total - elapsed),
      progress: Math.min(1, elapsed / this.total),
      paused: this.paused,
      reps: this.reps,
      repTarget: (seg && seg.k === 'work') ? (this.cb.exFor ? (this.cb.exFor(seg.ex) || {}).reps || 0 : 0) : 0
    });
  };

  Session.prototype._tick = function () {
    if (!this.running || this.paused) return;
    this.remaining = (this.endsAt - Date.now()) / 1000;
    if (this.remaining <= 0) {
      this.remaining = 0;
      this._advance();
      return;
    }
    this._emit();
  };

  Session.prototype._advance = function (skipped) {
    var seg = this.schedule[this.si];
    if (seg && seg.k === 'work' && !skipped && seg.side !== 2) this.movesDone++;
    if (skipped && seg && seg.k === 'work') this.skipped.push(seg.ex);
    if (this.si + 1 >= this.schedule.length) return this.finish();
    this._enter(this.si + 1, null);
    if (this.cb.onAdvance) this.cb.onAdvance(seg, this.schedule[this.si]);
  };

  Session.prototype.skip = function () { if (this.running) this._advance(true); };

  Session.prototype.restartSeg = function () {
    var seg = this.schedule[this.si];
    if (!seg) return;
    this.remaining = seg.dur;
    this.endsAt = Date.now() + seg.dur * 1000;
    this.reps = 0;
    this.paused = false;
    this._emit();
  };

  Session.prototype.adjust = function (delta) {
    if (!this.running) return;
    var seg = this.schedule[this.si];
    if (!seg) return;
    this.remaining = Math.min(seg.dur * 2, Math.max(1, this.remaining + delta));
    this.endsAt = Date.now() + this.remaining * 1000;
    this._emit();
  };

  Session.prototype.pause = function () {
    if (!this.running || this.paused) return;
    this.paused = true;
    this.remaining = Math.max(0, (this.endsAt - Date.now()) / 1000);
    this._emit();
  };

  Session.prototype.resume = function () {
    if (!this.running || !this.paused) return;
    this.paused = false;
    this.endsAt = Date.now() + this.remaining * 1000;
    this._emit();
  };

  Session.prototype.toggle = function () { this.paused ? this.resume() : this.pause(); };

  Session.prototype.addRep = function () {
    var seg = this.schedule[this.si];
    if (!seg || seg.k !== 'work') return 0;
    var ex = this.cb.exFor ? this.cb.exFor(seg.ex) : null;
    if (!ex || ex.mode !== 'reps' || !ex.reps) return 0;
    this.reps++;
    if (this.reps >= ex.reps) { this._advance(); return ex.reps; }
    this._emit();
    return this.reps;
  };

  Session.prototype.finish = function () {
    if (!this.running) return;
    this.running = false;
    if (this._iv) { clearInterval(this._iv); this._iv = null; }
    if (this.cb.onDone) this.cb.onDone({
      duration: Math.round((Date.now() - this.startedAt) / 1000),
      movesDone: this.movesDone,
      skipped: this.skipped.slice()
    });
  };

  Session.prototype.stop = function () {
    this.running = false;
    if (this._iv) { clearInterval(this._iv); this._iv = null; }
  };

  Session.prototype.snapshot = function () {
    return {
      at: Date.now(),
      si: this.si,
      remaining: Math.max(0, (this.endsAt - Date.now()) / 1000),
      movesDone: this.movesDone,
      skipped: this.skipped,
      total: this.total
    };
  };

  Session.prototype.restore = function (snap) {
    if (!snap || snap.si >= this.schedule.length) return false;
    this.running = true;
    this.startedAt = Date.now() - (this.total - snap.total) * 1000;
    this.movesDone = snap.movesDone || 0;
    this.skipped = snap.skipped || [];
    this._enter(snap.si, snap.remaining);
    var self = this;
    if (this._iv) clearInterval(this._iv);
    this._iv = setInterval(function () { self._tick(); }, 200);
    return true;
  };

  Session.prototype.totalLeft = function () {
    var before = 0;
    for (var i = 0; i < this.si; i++) before += this.schedule[i].dur;
    return this.total - before - (this.schedule[this.si] ? this.schedule[this.si].dur - this.remaining : 0);
  };

  CF.Session = Session;
  CF.buildSchedule = buildSchedule;
  CF.scheduleTotal = totalOf;
})(window.CF = window.CF || {});
