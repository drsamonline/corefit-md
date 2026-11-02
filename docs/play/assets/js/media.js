/* CoreFit MD — generated media layer.
   If docs/play/assets/media/media.json lists an asset for an exercise, the app
   shows that instead of the SVG figure. Anything missing falls back, so a
   partial set of generated clips is fine and nothing ever breaks. */
(function (CF) {
  'use strict';

  var Media = {
    map: {},
    ready: false,

    load: function (done) {
      // The manifest is a plain script (assets/media/media.js) so it works from
      // file:// as well as over HTTP — no fetch, no CORS, no cache to bust.
      var raw = CF.MEDIA_MANIFEST;
      if (raw && typeof raw === 'object') {
        for (var k in raw) {
          if (k.charAt(0) === '_' || k === 'generated') continue;
          Media.map[k] = raw[k];
        }
      }
      Media.ready = true;
      if (done) done();
    },

    /** {src, type, poster} for an exercise id, or null. */
    get: function (id) {
      var m = Media.map[id];
      if (!m || !m.src) return null;
      return { src: m.src, type: m.type || 'image', poster: m.poster || null };
    },

    /** What to show for an exercise: generated media if present, else the figure. */
    sourceFor: function (ex) {
      var m = Media.get(ex.id);
      if (m) return m;
      return { src: ex.demo, type: 'image', poster: null };
    },

    /** Markup for the player card / sheet: a silent looping clip, or a still. */
    markup: function (src, type, alt, cls) {
      cls = cls || 'demo-media-el';
      var safeAlt = String(alt || '').replace(/"/g, '&quot;');
      if (type === 'video') {
        return '<video class="' + cls + '" src="' + src + '" autoplay muted loop playsinline ' +
               'preload="auto" aria-label="' + safeAlt + '"></video>';
      }
      return '<img class="' + cls + '" src="' + src + '" alt="' + safeAlt + '" decoding="async">';
    }
  };

  CF.Media = Media;
})(window.CF = window.CF || {});
