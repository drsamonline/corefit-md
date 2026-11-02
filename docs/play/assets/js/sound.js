/* CoreFit MD — timer cues.
   A timer you cannot hear over your own breathing is useless, so these are
   short pitched cues rather than one flat beep: every event has its own shape,
   and work-ending sounds different from rest-ending.

   Synthesis, not files — nothing to download, nothing to cache, and the tone
   stays crisp at any volume. */
(function (CF) {
  'use strict';

  var ctx = null, master = null, ready = false;

  /* [frequency, offsetSeconds, durationSeconds, gain, wave] — two partials per
     note (fundamental + octave) give a small bell rather than a raw sine, which
     cuts through a room far better at the same volume. */
  var CUES = {
    tick:     [[1180, 0, 0.075, 0.55]],
    tickLast: [[1180, 0, 0.110, 0.85]],
    prep:     [[1560, 0, 0.060, 0.45]],
    prepLast: [[1560, 0, 0.095, 0.75]],
    go:       [[660, 0, 0.100, 0.60], [990, 0.095, 0.170, 0.65]],
    rest:     [[520, 0, 0.170, 0.55], [392, 0.105, 0.230, 0.42]],
    ten:      [[880, 0, 0.060, 0.38], [880, 0.095, 0.060, 0.38]],
    half:     [[1320, 0, 0.045, 0.26], [1320, 0.085, 0.045, 0.26]],
    done:     [[784, 0, 0.110, 0.60], [988, 0.110, 0.110, 0.60], [1319, 0.225, 0.320, 0.65]],
    soft:     [[440, 0, 0.060, 0.35]]
  };

  function ensure() {
    if (!ctx) {
      var Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return null;
      try { ctx = new Ctx(); } catch (e) { return null; }
      master = ctx.createGain();
      master.connect(ctx.destination);
    }
    if (ctx.state === 'suspended') { try { ctx.resume(); } catch (e) {} }
    ready = true;
    return ctx;
  }

  function note(freq, at, dur, gain, wave) {
    var o = ctx.createOscillator(), g = ctx.createGain();
    o.type = wave || 'sine';
    o.frequency.setValueAtTime(freq, at);
    // short attack so the transient is audible, then a natural decay
    g.gain.setValueAtTime(0.0001, at);
    g.gain.exponentialRampToValueAtTime(Math.max(0.0002, gain), at + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
    o.connect(g); g.connect(master);
    o.start(at); o.stop(at + dur + 0.02);

    // octave partial, quieter — this is what makes it a cue rather than a blip
    var o2 = ctx.createOscillator(), g2 = ctx.createGain();
    o2.type = 'sine';
    o2.frequency.setValueAtTime(freq * 2, at);
    g2.gain.setValueAtTime(0.0001, at);
    g2.gain.exponentialRampToValueAtTime(Math.max(0.0002, gain * 0.22), at + 0.006);
    g2.gain.exponentialRampToValueAtTime(0.0001, at + dur * 0.75);
    o2.connect(g2); g2.connect(master);
    o2.start(at); o2.stop(at + dur);
  }

  var Sound = {
    /* Call from a real user gesture — iOS will not start audio otherwise. */
    unlock: function () { ensure(); },

    volume: function () {
      var v = CF.Store ? CF.Store.get('volume') : 0.7;
      return (typeof v === 'number') ? Math.max(0, Math.min(1, v)) : 0.7;
    },

    /* Play a named cue. Silently does nothing if sound is off. */
    play: function (name) {
      if (CF.Store && !CF.Store.get('sound')) return;
      var vol = Sound.volume();
      if (vol <= 0) return;
      if (!ensure()) return;
      var cue = CUES[name];
      if (!cue) return;
      var t0 = ctx.currentTime + 0.012;
      // louder cues get a gentle limiter so they never clip on phone speakers
      var scale = vol * (0.9 / Math.max(1, cue.length * 0.55));
      for (var i = 0; i < cue.length; i++) {
        note(cue[i][0], t0 + cue[i][1], cue[i][2], Math.min(0.85, cue[i][3] * scale), cue[i][4]);
      }
    },

    /* Preview in settings: tick-tick-tick-go, so you hear the real thing. */
    test: function () {
      Sound.unlock();
      var wasOn = CF.Store.get('sound');
      if (!wasOn) CF.Store.set('sound', true);
      Sound.play('tick');
      setTimeout(function () { Sound.play('tick'); }, 320);
      setTimeout(function () { Sound.play('tickLast'); }, 640);
      setTimeout(function () { Sound.play('go'); }, 960);
      if (!wasOn) setTimeout(function () { CF.Store.set('sound', false); }, 1400);
    },

    names: Object.keys(CUES)
  };

  CF.Sound = Sound;
})(window.CF = window.CF || {});
