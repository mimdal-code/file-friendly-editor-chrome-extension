// core/worker-proxy.js
(function () {
  // Monaco's AMD worker loader resolves module ids like "vs/editor/..."
  // relative to MonacoEnvironment.baseUrl. That baseUrl must therefore point
  // to the directory *containing* `vs/`, not to `vs/` itself.
  // This file lives at:  chrome-extension://<id>/core/worker-proxy.js
  // Monaco lives at:     chrome-extension://<id>/vendor/monaco/0.45.0/min/vs/
  // So baseUrl =        chrome-extension://<id>/vendor/monaco/0.45.0/min/
  var baseUrl = new URL(
    '../vendor/monaco/0.45.0/min/',
    self.location.href
  ).href;

  self.MonacoEnvironment = {
    baseUrl: baseUrl
  };

  importScripts(baseUrl + 'vs/base/worker/workerMain.js');
})();