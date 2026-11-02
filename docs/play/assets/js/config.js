/* CoreFit MD — configuration constants
   Loaded first. Everything else reads from CF.CONFIG. */
(function (CF) {
  'use strict';

  CF.CONFIG = {
    VERSION: '2.1.0',
    BUILD: '2026-11-02',
    KEYS: {
      history:  'corefit.history.v2',
      clips:    'corefit.clips.v2',
      settings: 'corefit.settings.v2',
      profile:  'corefit.profile.v2',
      session:  'corefit.session.v2',
      seen:     'corefit.seen.v2'
    },
    DEMO_START: 30,          // default clip in-point, seconds
    DEMO_WINDOW: 25,         // default clip length, seconds
    WARMUP: 45,
    COOLDOWN: 45,
    WEEKLY_GOAL: 3,          // sessions per week
    RESUME_WINDOW_MS: 2 * 60 * 60 * 1000,

    // Six-week progression. Week is derived from total logged sessions.
    PROGRAM: [
      { week: 1, work: 45, rest: 15, label: 'Foundation' },
      { week: 2, work: 50, rest: 12, label: 'Build' },
      { week: 3, work: 55, rest: 10, label: 'Build' },
      { week: 4, work: 40, rest: 20, label: 'Deload', deload: true },
      { week: 5, work: 60, rest: 10, label: 'Peak' },
      { week: 6, work: 60, rest: 8,  label: 'Peak' }
    ],

    DEFAULT_SETTINGS: {
      sound: true,
      voice: false,
      haptics: true,
      wake: true,
      videoSound: false,
      warmup: true,
      cooldown: true,
      speed: 1,
      lang: 'en',
      theme: 'auto',
      bigText: false,
      audioOnly: false,
      reminders: false,
      reminderTime: '07:00'
    },

    RPE_LABELS: {
      1: 'Very easy', 2: 'Easy', 3: 'Easy', 4: 'Moderate', 5: 'Moderate',
      6: 'Somewhat hard', 7: 'Hard', 8: 'Hard', 9: 'Very hard', 10: 'Maximal'
    },

    SCREENING: [
      { id: 'lowback',  en: 'Low-back pain or a diagnosed disc problem' },
      { id: 'surgery',  en: 'Abdominal or spinal surgery in the last 6 months' },
      { id: 'pregnancy',en: 'Pregnant, or postpartum within 12 weeks' },
      { id: 'hernia',   en: 'Abdominal hernia or diastasis recti' },
      { id: 'neck',     en: 'Neck pain that worsens with chin tucks' },
      { id: 'bp',       en: 'Uncontrolled high blood pressure' }
    ]
  };
})(window.CF = window.CF || {});
