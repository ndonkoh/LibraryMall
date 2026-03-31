(function () {
  var KEY = 'darkMode';

  function apply() {
    try {
      var on = localStorage.getItem(KEY) === 'true';
      document.documentElement.classList.toggle('dark-mode', on);
      if (document.body) document.body.classList.toggle('dark-mode', on);
    } catch (e) {}
  }

  apply();
  document.addEventListener('DOMContentLoaded', apply);
  window.addEventListener('storage', function (e) {
    if (e.key === KEY) apply();
  });

  window.setLibraryMallDarkMode = function (enabled) {
    try {
      localStorage.setItem(KEY, enabled ? 'true' : 'false');
      document.documentElement.classList.toggle('dark-mode', !!enabled);
      if (document.body) document.body.classList.toggle('dark-mode', !!enabled);
    } catch (e) {}
  };
})();
