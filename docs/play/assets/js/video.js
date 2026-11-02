/* CoreFit MD — clip player.
   Two engines behind one interface:
     • youtube  — a single YT.Player reused for the whole session (no iframe churn)
     • mp4      — a native <video>, driven by media fragments (#t=start,end)
   The whole point: playback begins at the clip's in-point and never leaves its
   demonstration window. */
(function (CF) {
  'use strict';

  var ytPromise = null;

  function ensureYT() {
    if (ytPromise) return ytPromise;
    ytPromise = new Promise(function (resolve, reject) {
      if (window.YT && window.YT.Player) return resolve(window.YT);
      var s = document.createElement('script');
      s.src = 'https://www.youtube.com/iframe_api';
      s.onerror = function () { reject(new Error('yt-blocked')); };
      document.head.appendChild(s);
      var t0 = Date.now();
      var iv = setInterval(function () {
        if (window.YT && window.YT.Player) { clearInterval(iv); resolve(window.YT); }
        else if (Date.now() - t0 > 9000) { clearInterval(iv); reject(new Error('yt-timeout')); }
      }, 120);
    });
    return ytPromise;
  }

  /* ------------------------------------------------------------------ */
  function Player(host, opts) {
    opts = opts || {};
    this.host = host;
    this.start = opts.start || 0;
    this.end = opts.end || (opts.start || 0) + 25;
    this.speed = opts.speed || 1;
    this.muted = opts.muted !== false;
    this.autoplay = opts.autoplay !== false;
    this.onError = opts.onError || function () {};
    this.onReady = opts.onReady || function () {};
    this.ready = false;
    this.kind = null;
    this.yt = null;
    this.video = null;
    this.failed = false;
    this.ids = (opts.backupIds || []).slice();
    this.mainId = opts.videoId;
    this.file = opts.file || null;
    this._tries = 0;
    this._mount(opts);
  }

  Player.prototype._mount = function (opts) {
    var self = this;
    if (this.file) return this._mountMp4();
    ensureYT().then(function (YT) {
      if (self.destroyed) return;
      self.kind = 'youtube';
      var frame = document.createElement('div');
      self.host.innerHTML = '';
      self.host.appendChild(frame);
      self.yt = new YT.Player(frame, {
        videoId: opts.videoId,
        host: 'https://www.youtube-nocookie.com',
        playerVars: {
          start: Math.floor(self.start), autoplay: 0, controls: 0, disablekb: 1, fs: 0,
          rel: 0, iv_load_policy: 3, modestbranding: 1, playsinline: 1, mute: 1,
          origin: location.protocol === 'file:' ? '' : location.origin
        },
        events: {
          onReady: function (ev) {
            self.ready = true;
            try {
              // A clip window longer than the video (or starting past its end)
              // must not leave the player stuck on a black frame.
              var dur = ev.target.getDuration() || 0;
              if (dur > 4 && self.start > dur - 4) {
                self.start = Math.max(0, Math.min(6, dur * 0.12));
                self.end = Math.min(dur, self.start + 25);
              } else if (dur > 0) {
                self.end = Math.min(self.end, dur);
              }
              ev.target.mute();
              ev.target.seekTo(self.start, true);
              if (self.speed !== 1) ev.target.setPlaybackRate(self.speed);
              if (self.autoplay) ev.target.playVideo();
            } catch (e) {}
            self.onReady(self);
          },
          onError: function () { self._fail(); },
          onStateChange: function (ev) {
            // 0 = ended: loop back into the window instead of showing the end card
            if (ev.data === 0) self.seek(self.start);
          }
        }
      });
    }).catch(function () { self._fail(); });
  };

  Player.prototype._mountMp4 = function () {
    var self = this;
    this.kind = 'mp4';
    this.host.innerHTML = '';
    var v = document.createElement('video');
    v.playsInline = true;
    v.setAttribute('playsinline', '');
    v.preload = 'auto';
    v.muted = this.muted;
    v.src = this.file + '#t=' + Math.floor(this.start) + ',' + Math.floor(this.end);
    v.addEventListener('loadedmetadata', function () {
      self.ready = true;
      try { v.currentTime = self.start; } catch (e) {}
      self.onReady(self);
    });
    v.addEventListener('error', function () { self._fail(); });
    v.addEventListener('timeupdate', function () {
      if (v.currentTime > self.end) { try { v.currentTime = self.start; } catch (e) {} }
    });
    this.host.appendChild(v);
    this.video = v;
  };

  Player.prototype._fail = function () {
    if (this.failed) return;
    // one automatic failover to a backup id before giving up
    if (this.kind === 'youtube' && this.ids.length && this._tries < 2) {
      this._tries++;
      var next = this.ids.shift();
      try { this.yt.loadVideoById({ videoId: next, startSeconds: this.start }); this.yt.mute(); return; } catch (e) {}
    }
    this.failed = true;
    this.onError(this);
  };

  /* load a different clip into the same player instance */
  Player.prototype.load = function (o) {
    this.start = o.start; this.end = o.end;
    if (o.videoId) this.mainId = o.videoId;
    if (o.backupIds) this.ids = o.backupIds.slice();
    this.failed = false;
    if (this.kind === 'mp4') {
      if (this.video) {
        this.video.src = this.file + '#t=' + Math.floor(this.start) + ',' + Math.floor(this.end);
        try { this.video.currentTime = this.start; } catch (e) {}
      }
      return;
    }
    if (!this.ready || !this.yt) return;
    try {
      // cueVideoById preloads without playing — used during the rest interval
      if (o.preload) this.yt.cueVideoById({ videoId: this.mainId, startSeconds: this.start });
      else this.yt.loadVideoById({ videoId: this.mainId, startSeconds: this.start });
    } catch (e) {}
  };

  Player.prototype.play = function () {
    if (this.kind === 'mp4' && this.video) { this.video.play().catch(function () {}); return; }
    try { this.yt.playVideo(); } catch (e) {}
  };
  Player.prototype.pause = function () {
    if (this.kind === 'mp4' && this.video) { this.video.pause(); return; }
    try { this.yt.pauseVideo(); } catch (e) {}
  };
  Player.prototype.seek = function (t) {
    if (this.kind === 'mp4' && this.video) { try { this.video.currentTime = t; } catch (e) {} return; }
    try { this.yt.seekTo(t, true); } catch (e) {}
  };
  Player.prototype.time = function () {
    if (this.kind === 'mp4' && this.video) return this.video.currentTime || 0;
    try { return this.yt.getCurrentTime() || 0; } catch (e) { return 0; }
  };
  Player.prototype.setSpeed = function (r) {
    this.speed = r;
    if (this.kind === 'mp4' && this.video) { this.video.playbackRate = r; return; }
    try { this.yt.setPlaybackRate(r); } catch (e) {}
  };
  Player.prototype.mute = function () {
    this.muted = true;
    if (this.video) { this.video.muted = true; return; }
    try { this.yt.mute(); } catch (e) {}
  };
  Player.prototype.unmute = function () {
    this.muted = false;
    if (this.video) { this.video.muted = false; this.video.volume = 0.7; return; }
    try { this.yt.unMute(); this.yt.setVolume(70); } catch (e) {}
  };
  Player.prototype.enforceWindow = function () {
    if (!this.ready) return;
    var t = this.time();
    if (t > this.end + 0.4) this.seek(this.start);
  };
  Player.prototype.destroy = function () {
    this.destroyed = true;
    try { if (this.yt && this.yt.destroy) this.yt.destroy(); } catch (e) {}
    try { if (this.video) { this.video.pause(); this.video.removeAttribute('src'); this.video.load(); } } catch (e) {}
    this.yt = null; this.video = null;
    this.host.innerHTML = '';
  };

  CF.Video = {
    create: function (host, opts) { return new Player(host, opts); },
    thumb: function (id, big) {
      return 'https://i.ytimg.com/vi/' + id + '/' + (big ? 'hqdefault' : 'mqdefault') + '.jpg';
    },
    warm: function () { ensureYT().catch(function () {}); }
  };
})(window.CF = window.CF || {});
