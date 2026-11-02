/* CoreFit MD — localisation.
   Strings live in assets/i18n/strings.js so the app works from file:// with no fetch. */
(function (CF) {
  'use strict';

  var I18n = {
    lang: 'en',
    dict: null,
    fallback: null,

    init: function (lang) {
      I18n.fallback = CF.STRINGS.en;
      I18n.set(lang || 'en', true);
      return I18n;
    },

    set: function (lang, silent) {
      I18n.lang = CF.STRINGS[lang] ? lang : 'en';
      I18n.dict = CF.STRINGS[I18n.lang];
      document.documentElement.lang = I18n.lang;
      if (!silent) I18n.apply(document);
      return I18n.lang;
    },

    t: function (key, vars) {
      var s = (I18n.dict && I18n.dict[key]) || I18n.fallback[key] || key;
      if (vars) {
        Object.keys(vars).forEach(function (k) {
          s = s.replace(new RegExp('\\{' + k + '\\}', 'g'), vars[k]);
        });
      }
      return s;
    },

    locale: function () {
      return I18n.lang === 'hi' ? 'hi-IN' : I18n.lang === 'gu' ? 'gu-IN' : 'en-IN';
    },

    // Localised value out of a {en, hi, gu} object, falling back to English.
    pick: function (obj) {
      if (!obj) return '';
      if (typeof obj === 'string') return obj;
      return obj[I18n.lang] || obj.en || '';
    },

    apply: function (root) {
      var nodes = (root || document).querySelectorAll('[data-i18n]');
      for (var i = 0; i < nodes.length; i++) nodes[i].textContent = I18n.t(nodes[i].getAttribute('data-i18n'));
      nodes = (root || document).querySelectorAll('[data-i18n-html]');
      for (i = 0; i < nodes.length; i++) nodes[i].innerHTML = I18n.t(nodes[i].getAttribute('data-i18n-html'));
      nodes = (root || document).querySelectorAll('[data-i18n-ph]');
      for (i = 0; i < nodes.length; i++) nodes[i].placeholder = I18n.t(nodes[i].getAttribute('data-i18n-ph'));
      nodes = (root || document).querySelectorAll('[data-i18n-aria]');
      for (i = 0; i < nodes.length; i++) nodes[i].setAttribute('aria-label', I18n.t(nodes[i].getAttribute('data-i18n-aria')));
    }
  };

  CF.I18n = I18n;
  CF.t = function (k, v) { return I18n.t(k, v); };
  CF.pick = function (o) { return I18n.pick(o); };
})(window.CF = window.CF || {});
