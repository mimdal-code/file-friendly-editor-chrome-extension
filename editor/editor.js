// editor/editor.js
// Called by boot.js after Monaco's AMD modules have loaded.
// Monaco is available as the global `monaco`.
// Globals from vendor scripts (loaded before loader.js):
//   window.js_beautify, window.css_beautify, window.html_beautify
//   window.Terser

window.startEditor = async function () {

  // -----------------------------------------------------------------
  // 1. Format registry
  // -----------------------------------------------------------------
  const formatRegistry = {};  // { ".json": { id, language, completion, ... } }

  async function loadFormats() {
    const ids = ["json", "yaml", "toml", "conf", "md", "css", "js", "sh"];
    await Promise.all(ids.map(async (id) => {
      try {
        const res = await fetch(chrome.runtime.getURL(`formats/${id}.json`));
        if (!res.ok) return;
        const fmt = await res.json();
        for (const ext of fmt.extensions || []) {
          formatRegistry[ext.toLowerCase()] = fmt;
        }
      } catch (e) {
        console.warn("format load failed:", id, e);
      }
    }));
  }

  function detectFormat(filename) {
    const dot = filename.lastIndexOf(".");
    if (dot < 0) return null;
    return formatRegistry[filename.slice(dot).toLowerCase()] || null;
  }

  await loadFormats();

  // -----------------------------------------------------------------
  // 2. Editor
  // -----------------------------------------------------------------
  const editor = monaco.editor.create(document.getElementById("container"), {
    value: "",
    language: "plaintext",
    theme: "vs-dark",
    automaticLayout: true,
    fontSize: 13,
    minimap: { enabled: false },
    wordWrap: "on",
    scrollBeyondLastLine: false,
  });
  window.__editor = editor;  // console convenience

  // -----------------------------------------------------------------
  // 3. State + toolbar refs
  // -----------------------------------------------------------------
  let fileHandle = null;
  let savedVersionId = editor.getModel().getAlternativeVersionId();

  const elName   = document.getElementById("file-name");
  const elPath   = document.getElementById("file-path");
  const elStatus = document.getElementById("status");
  const btnOpen  = document.getElementById("btn-open");
  const btnSave  = document.getElementById("btn-save");
  const btnBeaut = document.getElementById("btn-beautify");
  const btnCompr = document.getElementById("btn-compress");

  // Both actions supported for these languages.
  const FORMATTABLE = new Set(["json", "javascript", "css", "html"]);

  function currentLanguage() {
    return editor.getModel().getLanguageId();
  }

  function flashStatus(msg, ms) {
    elStatus.textContent = msg;
    if (ms) setTimeout(() => { if (elStatus.textContent === msg) elStatus.textContent = ""; }, ms);
  }

  function updateStatus() {
    const dirty = editor.getModel().getAlternativeVersionId() !== savedVersionId;
    elName.textContent = fileHandle ? fileHandle.name : "(no file)";
    elName.classList.toggle("dirty", dirty);
    elPath.textContent = fileHandle
      ? `${currentLanguage()} · ${dirty ? "modified" : "saved"}`
      : "";
    btnSave.disabled  = !fileHandle;
    const canFmt = FORMATTABLE.has(currentLanguage());
    btnBeaut.disabled = !canFmt;
    btnCompr.disabled = !canFmt;
  }

  editor.onDidChangeModelContent(() => updateStatus());
  editor.onDidChangeModelLanguage(() => updateStatus());
  updateStatus();

  // -----------------------------------------------------------------
  // 4. Open
  // -----------------------------------------------------------------
  async function openFile() {
    try {
      const [handle] = await window.showOpenFilePicker({
        types: [{
          description: "Config & source files",
          accept: { "text/plain": [
            ".json", ".yaml", ".yml", ".toml", ".conf", ".ini", ".cfg",
            ".md", ".markdown", ".css", ".js", ".mjs", ".sh", ".bash",
          ]},
        }],
        multiple: false,
      });
      const file = await handle.getFile();
      const text = await file.text();

      fileHandle = handle;
      const fmt = detectFormat(handle.name);
      const lang = fmt ? fmt.language : "plaintext";

      if (editor.getModel().getLanguageId() !== lang) {
        const model = monaco.editor.createModel(text, lang);
        editor.setModel(model);
      } else {
        editor.setValue(text);
      }

      savedVersionId = editor.getModel().getAlternativeVersionId();
      flashStatus("");
      updateStatus();
    } catch (e) {
      if (e.name === "AbortError") return;
      console.error(e);
      flashStatus("open failed: " + e.message);
    }
  }

  // -----------------------------------------------------------------
  // 5. Save
  // -----------------------------------------------------------------
  async function saveFile() {
    if (!fileHandle) return;
    try {
      const writable = await fileHandle.createWritable();
      await writable.write(editor.getValue());
      await writable.close();
      savedVersionId = editor.getModel().getAlternativeVersionId();
      updateStatus();
      flashStatus("saved", 1200);
    } catch (e) {
      console.error(e);
      flashStatus("save failed: " + e.message);
    }
  }

  // -----------------------------------------------------------------
  // 6. Beautify / Compress  (both async)
  // -----------------------------------------------------------------
  async function beautify(text, language) {
    const opts = { indent_size: 2, preserve_newlines: true, max_preserve_newlines: 1 };
    if (language === "json")       return JSON.stringify(JSON.parse(text), null, 2);
    if (language === "javascript") return window.js_beautify(text, opts);
    if (language === "css")        return window.css_beautify(text, opts);
    if (language === "html")       return window.html_beautify(text, opts);
    return text;
  }

  async function compress(text, language) {
    if (language === "json") {
      return JSON.stringify(JSON.parse(text));
    }
    if (language === "css") {
      return window.css_beautify(text, { indent_size: 0, preserve_newlines: false })
        .replace(/\n/g, "").replace(/\s*([{};:,])\s*/g, "$1");
    }
    if (language === "javascript") {
      // Terser's browser bundle exposes window.Terser.minify (async).
      if (!window.Terser || !window.Terser.minify) {
        throw new Error("Terser not loaded");
      }
      const result = await window.Terser.minify(text);
      if (result.error) throw result.error;
      return result.code;
    }
    if (language === "html") {
      return window.html_beautify(text, { indent_size: 0, preserve_newlines: false })
        .replace(/\n\s*/g, "").trim();
    }
    return text;
  }

  async function applyTransform(fn, label) {
    try {
      const lang = currentLanguage();
      const next = await fn(editor.getValue(), lang);
      editor.setValue(next);
      flashStatus(label, 1200);
    } catch (e) {
      console.error(e);
      flashStatus(label + " failed: " + (e.message || e));
    }
  }

  // -----------------------------------------------------------------
  // 7. Wire buttons
  // -----------------------------------------------------------------
  btnOpen .addEventListener("click", openFile);
  btnSave .addEventListener("click", saveFile);
  btnBeaut.addEventListener("click", () => applyTransform(beautify, "beautified"));
  btnCompr.addEventListener("click", () => applyTransform(compress, "compressed"));

  // -----------------------------------------------------------------
  // 8. Ctrl+S / Cmd+S
  // -----------------------------------------------------------------
  editor.addCommand(
    monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS,
    () => saveFile()
  );

  document.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
      e.preventDefault();
      saveFile();
    }
  }, true);
};