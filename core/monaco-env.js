// core/monaco-env.js
// Must run BEFORE loader.js.

self.MonacoEnvironment = {
  getWorkerUrl: function (moduleId, label) {
    // Every language worker uses the same proxy.
    // The proxy sets MonacoEnvironment.baseUrl inside the worker
    // and then loads base/worker/workerMain.js, which bootstraps
    // the actual language-specific worker module.
    return chrome.runtime.getURL('core/worker-proxy.js');
  }
};