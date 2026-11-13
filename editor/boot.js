// editor/boot.js
(async function () {
  require.config({
    paths: { vs: chrome.runtime.getURL('vendor/monaco/0.45.0/min/vs') }
  });

  require(['vs/editor/editor.main'], function () {
    window.startEditor();
  });
})();