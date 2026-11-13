# File Friendly Editor

A Chrome/Edge extension that opens, highlights, beautifies, and compresses config and source files in a full-tab Monaco editor. Supports JSON, YAML, TOML, INI/CONF, Markdown, CSS, JavaScript, and Shell. Edit in place, save with `Ctrl+S`, no build step, no network calls.

Just a button, a file picker, and a real editor.

![Manifest V3](https://img.shields.io/badge/manifest-v3-blue)
![Chrome 114+](https://img.shields.io/badge/chrome-114%2B-blue)
![License: MIT](https://img.shields.io/badge/license-MIT-green)
![No dependencies](https://img.shields.io/badge/bundler-none-lightgrey)
![No tracking](https://img.shields.io/badge/tracking-none-lightgrey)
![No network](https://img.shields.io/badge/network-none-lightgrey)

📥 Download & Install • Features • Usage • Supported Formats • Settings • How it works • Development

---

## 📥 Download & Install

The Chrome Web Store version is not published yet. Until then, install directly from **GitHub Releases**. It's a 2-minute manual install, works exactly the same, and is 100% free.

### Step 1 — Download the latest release

**[Download the latest release](https://github.com/mimdal-code/file-friendly-editor-chrome-extension/releases/latest)** 👈

On that page, scroll to the **Assets** section and click:

```
file-friendly-editor-0.1.0.zip
```

(Or pick any version you want from the [Releases page](https://github.com/mimdal-code/file-friendly-editor-chrome-extension/releases).)

### Step 2 — Extract the zip

Unzip the downloaded file somewhere **permanent** — for example `~/Extensions/file-friendly-editor`. Do **not** unzip to a temp folder; the browser loads the folder, not the zip, and it needs to stay put. The folder contains a `vendor/` directory with Monaco and js-beautify — it's large, and moving it later will break the extension until you reload it.

### Step 3 — Load in Chrome or Edge

Open `chrome://extensions` (Chrome / Brave / Edge / Vivaldi — Edge also accepts `edge://extensions`).

1. Turn on **Developer mode** (top-right toggle).
2. Click **Load unpacked**.
3. Select the unzipped folder — the one that contains `manifest.json`.
4. The extension appears in your toolbar.

That's it. Click the toolbar icon → **Open editor** → pick a file.

### Updating

When a new release is out: delete the old folder, unzip the new one in the same place, then click the ↻ icon on the extension card in `chrome://extensions`. Chrome caches the manifest by folder path, so replacing the files in place + reload is enough. Close any open editor tabs — they hold file handles to the old session.

### Building from source

If you'd rather clone than download a zip:

```bash
git clone https://github.com/mimdal-code/file-friendly-editor-chrome-extension.git
cd file-friendly-editor-chrome-extension
```

Then in `chrome://extensions` → **Load unpacked** → select the folder. Reload the extension (↻ icon) after every code change, and hard-refresh any open editor tab (`Ctrl+Shift+R`).

The `vendor/` directory is checked in. You do **not** need `npm`, a bundler, or any build step. The three tarballs at the repo root (`monaco-editor-0.45.0.tgz`, `mdn-data-2.3.0.tgz`, `js-beautify` sources) are only there because `bootstrap.sh` reads them; if you're installing from a release zip, they're not needed.

---

## ✨ Features

- **Real editor, not a textarea.** Full Monaco (the engine behind VS Code) with syntax highlighting, bracket matching, multi-cursor, find/replace, and folding. Dark theme, 13px, word wrap on.
- **Open any file with the OS picker.** Uses the File System Access API (`showOpenFilePicker`). You pick a file; the extension reads it, detects the format, and switches Monaco's language mode. No drag-and-drop needed, no “Allow access to file URLs” toggle.
- **Edit in place, save in place.** `Ctrl+S` / `Cmd+S` writes back to the same file via `createWritable()`. The filename gets a **●** when there are unsaved changes; the dot clears on save.
- **Beautify.** One click, applied to JSON, JS, CSS, and HTML. JSON uses `JSON.parse`/`JSON.stringify`. JS/CSS/HTML use the bundled `js-beautify`, which is the same library VS Code extensions use. The output is exactly what you'd get from Prettier for these formats.
- **Compress.** JSON goes through `JSON.stringify` with no whitespace. CSS and HTML go through `js-beautify`'s compact mode. JS goes through **Terser** — real minification with variable renaming.
- **Zero network at runtime.** Everything is vendored under `vendor/<name>/<version>/`. No CDN, no telemetry, no remote code. The extension works offline.
- **Per-format manifests.** Each supported format has a small `formats/<id>.json` describing its extensions, Monaco language, and completion source. Adding a new format is one file, no code change.
- **Format-aware toolbar.** The Beautify and Compress buttons are disabled when the current file's language isn't one of the four supported. Save is disabled until a file is open.

---

## 🚀 Usage

Example: open a `sample.json` file, clean it up, save it.

1. Click the extension icon → **Open editor**.
2. Click **Open…** → pick `sample.json` from disk.
3. The file loads, the filename shows in the toolbar, JSON syntax highlighting is active.
4. If the file is minified or messy, click **Beautify** — it reformats with 2-space indent.
5. Edit anything.
6. Press `Ctrl+S` (or click **Save**). The filename's **●** clears.

### More examples

**Compress a CSS file for production**

- Open `styles.css`.
- Click **Compress** — whitespace collapses, selectors stay readable.
- `Ctrl+S`.

**Beautify a minified JS bundle you're debugging**

- Open `vendor.min.js`.
- Click **Beautify**.
- Read the formatted output. `Ctrl+Z` if you want the minified form back.
- Don't save unless you mean it.

**Edit a `docker-compose.yml`**

- Open the file.
- YAML highlighting is active. Basic editing, save, done.
- Note: YAML completion is not schema-driven yet (see Roadmap). You get highlighting and editing, not validation.

---

## 📂 Supported Formats

Eight formats, thirteen file extensions.

| Format | Extensions | Highlighting | Beautify | Compress | Completion |
|--------|------------|--------------|----------|----------|------------|
| **JSON** | `.json` | ✅ | ✅ `JSON.parse`/`stringify` | ✅ | Schema (stubbed) |
| **YAML** | `.yaml`, `.yml` | ✅ | — | — | Snippets (stubbed) |
| **TOML** | `.toml` | ✅ (via `ruby` grammar) | — | — | Inline keys (stubbed) |
| **INI / CONF** | `.conf`, `.ini`, `.cfg` | ✅ (`ini`) | — | — | Inline keys (stubbed) |
| **Markdown** | `.md`, `.markdown` | ✅ | — | — | Snippets (stubbed) |
| **CSS** | `.css` | ✅ | ✅ `css_beautify` | ✅ `css_beautify` compact | MDN data (stubbed) |
| **JavaScript** | `.js`, `.mjs` | ✅ | ✅ `js_beautify` | ✅ **Terser** | Monaco built-in ✅ |
| **Shell** | `.sh`, `.bash` | ✅ | — | — | Snippets (stubbed) |

“Highlighting” and “Beautify/Compress” work today. “Completion” is the current work-in-progress — the format manifests declare the intended source, but only JavaScript gets real completion (via Monaco's TypeScript worker). The rest are honest stubs.

### About TOML highlighting

Monaco 0.45.0 does not ship a TOML grammar. The extension maps `.toml` to the `ruby` grammar, which is visually close enough for `key = value` and `[section]` files. It is **not** a TOML parser, and it will not flag TOML-specific syntax errors.

---

## ⚙️ Settings

There is no options page — the editor *is* the interface. Everything you need is in the toolbar:

- **Open…** — file picker. Accepts the thirteen extensions listed above.
- **Save** — writes to the same file. Bound to `Ctrl+S` / `Cmd+S` (both when the editor has focus and when a toolbar button does).
- **Beautify** — enabled for JSON, JS, CSS, HTML.
- **Compress** — enabled for JSON, JS, CSS, HTML. (JS uses Terser.)
- **Filename** — the current file's name. A **●** appears when modified.
- **Format line** — `javascript · modified` or `javascript · saved`. This is the closest thing to a “path” the browser will give you; `showOpenFilePicker` deliberately does not expose the full filesystem path.

### Why there's no path

The File System Access API deliberately hides the directory structure. You get `handle.name` but not the absolute path. There is no workaround short of a native messaging host, which is a different project. The second toolbar span shows the language and dirty state instead.

### Data model

The extension writes nothing outside the file you opened. There is no `chrome.storage` usage, no config, no state. Close the tab and the extension forgets everything except the file's saved content.

---

## 🎨 Formatter notes

### Beautify

- **JSON** — `JSON.stringify(JSON.parse(text), null, 2)`. Lossless round-trip.
- **JavaScript** — `js_beautify` with `{ indent_size: 2, preserve_newlines: true, max_preserve_newlines: 1 }`. Handles template literals, regex literals, and multi-line object literals correctly. This is the same library used by many editor plugins.
- **CSS** — `css_beautify` with the same options. Breaks rules onto separate lines, indents declarations.
- **HTML** — `html_beautify` with the same options. Preserves inline elements, indents block elements.

### Compress

- **JSON** — `JSON.stringify(JSON.parse(text))`. Lossless, but reorders nothing.
- **CSS** — `css_beautify` with `{ indent_size: 0, preserve_newlines: false }`, then collapsed. Readable-enough minification; not a full CSS optimizer.
- **HTML** — same `html_beautify` approach with `indent_size: 0`. Removes inter-tag whitespace but keeps text content intact.
- **JavaScript** — **Terser**. Real minification: variable renaming, dead-code elimination, whitespace collapse, comment stripping. If you save the result, you have a minified file. `Ctrl+Z` undoes it in-session.

Terser is the only formatter that changes semantics (variable names). The other three are whitespace-only.

---

## 🔧 How it works

### Component summary

| File | Role |
|---|---|
| `manifest.json` | MV3 manifest. Permissions: `activeTab`, `scripting`. Popup: `popup/popup.html`. Background service worker: `background.js`. Web-accessible resources: `core/worker-proxy.js` and the whole `vendor/monaco/0.45.0/min/vs/**` tree. |
| `background.js` | Tiny service worker. The toolbar-icon action opens `editor/editor.html` in a new tab. That's its only job. |
| `popup/popup.html`, `popup/popup.js` | One button: **Open editor**. Opens the same tab and closes the popup. |
| `editor/editor.html` | Loads, in order: `core/monaco-env.js`, the three `js-beautify` scripts, `vendor/terser/.../bundle.min.js`, `vendor/monaco/.../loader.js`, `editor/editor.js`, `editor/boot.js`. Order matters — `js-beautify` and Terser must load **before** Monaco's AMD loader, or their `define()` calls collide with Monaco's. |
| `editor/boot.js` | Single entry point. Configures Monaco's AMD `require`, loads `vs/editor/editor.main`, then calls `window.startEditor()`. |
| `editor/editor.js` | The whole editor. Defines `window.startEditor`, which builds the Monaco editor, wires the toolbar, handles open/save, implements `beautify`/`compress`, and binds `Ctrl+S`. |
| `core/monaco-env.js` | Sets `self.MonacoEnvironment.getWorkerUrl` to return `core/worker-proxy.js` for every language. |
| `core/worker-proxy.js` | Runs inside the Monaco Web Worker. Sets `MonacoEnvironment.baseUrl` to `vendor/monaco/0.45.0/min/` (note: **above** `vs/`, not inside it) and `importScripts`s `vs/base/worker/workerMain.js`. This is what makes language workers boot correctly instead of throwing `define is not defined`. |
| `formats/*.json` | One per format. Each declares `id`, `extensions`, `language` (the Monaco language id), and `completion` (the intended source — currently stubbed for all but JS). |
| `schemas/*.json` | Placeholder JSON Schemas. Not used yet; reserved for the schema-driven completion work. |
| `vendor/monaco/0.45.0/` | Monaco editor, AMD `min/vs` build. Includes `loader.js`, `editor/`, `language/{json,css,html,typescript}/`, and `base/worker/`. |
| `vendor/js-beautify/1.15.1/` | `beautify.js`, `beautify-css.js`, `beautify-html.js`. Loaded as plain scripts (before Monaco's loader) so they attach `window.js_beautify` and friends. |
| `vendor/terser/5.36.0/` | `bundle.min.js`. Exposes `window.Terser.minify`. Used only for JS compress. |
| `vendor/mdn-data/2.3.0/` | CSS property/value/at-rule/pseudo data. Reserved for the CSS completion provider. |
| `bootstrap.sh` | Recreates the whole directory from scratch, extracts the three tarballs into `vendor/`, and writes every stub file. Useful for a clean rebuild; not needed to run the extension. |

### Why js-beautify must load before Monaco's loader

`js-beautify`'s distribution files are UMD modules. If Monaco's AMD loader (`loader.js`) has already run, `window.define` exists, and the UMD wrapper tries to register itself as an anonymous module — which Monaco rejects with `Can only have one anonymous define call per script file`. Loading them **before** `loader.js` means `define` is still `undefined`, the UMD wrapper takes the browser-global branch, and you get `window.js_beautify` without any conflict. Terser's bundle behaves the same way.

### Why workers go through a proxy

Monaco 0.45.0's language worker files (`tsWorker.js`, `cssWorker.js`, etc.) are AMD modules — they start with a `define(...)` call. Pointing `getWorkerUrl` directly at them makes them run in a fresh worker where `define` doesn't exist, and they throw. The fix is to return `core/worker-proxy.js` instead, which sets `MonacoEnvironment.baseUrl` and then `importScripts`s Monaco's `base/worker/workerMain.js`. `workerMain.js` is what defines `define` in the worker and loads the actual language worker. This is the officially documented AMD-worker pattern.

### Permissions

- `activeTab` — to open the editor tab from the popup and the toolbar icon.
- `scripting` — declared, but not currently used; reserved for a future “open the current page's source” feature.

No host permissions are requested. The file picker is user-initiated, so no `fileSystem` permission is needed — the File System Access API is gated by user gesture, not by manifest permissions.

No analytics, no network calls, no telemetry. Everything is local.

---

## 💻 Development

No build step. Pure MV3, no bundler, no npm. The `vendor/` directory is checked in.

```bash
git clone https://github.com/mimdal-code/file-friendly-editor-chrome-extension.git
cd file-friendly-editor-chrome-extension
```

Load unpacked in `chrome://extensions`. Edit files. Reload the extension card. Hard-refresh the editor tab.

### Directory layout

```
file-friendly-editor-chrome-extension/
├── manifest.json
├── background.js
├── popup/
│   ├── popup.html
│   └── popup.js
├── editor/
│   ├── editor.html
│   ├── editor.js
│   └── boot.js
├── core/
│   ├── monaco-env.js
│   └── worker-proxy.js
├── formats/             ← one JSON per format
├── schemas/             ← reserved for completion
├── vendor/
│   ├── monaco/0.45.0/
│   ├── js-beautify/1.15.1/
│   ├── terser/5.36.0/
│   └── mdn-data/2.3.0/
├── bootstrap.sh
└── README.md
```

### Useful console commands

In the **editor tab's console** (`Ctrl+Shift+J`):

```js
// The Monaco editor instance
window.__editor

// The format registry loaded from formats/*.json
Object.keys(window.__editor.getModel().getLanguageId())
```

In the **extension's service worker console** (`chrome://extensions` → card → “service worker” link):

```js
// Should be empty — this extension doesn't register content scripts
chrome.scripting.getRegisteredContentScripts().then(console.log)
```

### Adding a format

1. Create `formats/<id>.json`:

   ```json
   {
     "id": "xml",
     "extensions": [".xml"],
     "language": "xml",
     "completion": { "source": "snippets" }
   }
   ```

2. Add `"xml"` to the `ids` array in `editor/editor.js` (`loadFormats`).

3. Reload the extension. The new extension is recognized by the file picker's `accept` list (update it in `openFile` too) and by `detectFormat`.

4. If you want Beautify/Compress, add the Monaco language id to `FORMATTABLE` in `editor/editor.js` and wire the branch inside `beautify` / `compress`.

### Known limitations

- **Path is not shown.** `showOpenFilePicker` deliberately hides directory structure. The second toolbar span shows `language · state` instead.
- **YAML completion is basic.** `monaco-yaml` does not support AMD Monaco without a bundler, so YAML gets Monaco's built-in highlighting and nothing else for now. Schema-driven YAML completion would require either a bundler or a prebuilt UMD `monaco-yaml` — neither is in scope yet.
- **TOML highlighting is approximate.** It maps to the `ruby` grammar. `key = value` and `[section]` look fine; TOML-specific errors are not flagged.
- **`Ctrl+S` is bound twice on purpose.** Once via `editor.addCommand` (fires when the editor has focus), once via a capture-phase `keydown` listener (fires when a toolbar button has focus). Both call the same `saveFile()`. This prevents the browser's “Save page as” dialog on either focus state.
- **File handles don't survive tab close.** If you close the editor tab, the write permission for the file is gone. Reopen the file to save again.

---

## 🗺️ Roadmap

Not implemented, but the code is structured for them:

- **Completion providers.** `editor/completion/registry.js` will read `formats/*.json`, dispatch to `schema-provider` (JSON/YAML), `css-provider` (using vendored `mdn-data`), `inline-provider` (TOML, INI, from per-format manifests), and `snippet-provider` (Markdown, Shell). Each provider registers with Monaco's `registerCompletionItemProvider`.
- **JSON Schema completion.** Feed the `schemas/*.json` files into Monaco's built-in JSON worker. This is the easiest completion to get right first.
- **CSS completion from MDN data.** `vendor/mdn-data/2.3.0/css/properties.json` already has the complete property list, and `vendor/mdn-data/2.3.0/css/properties.schema.json` describes the value types. A custom `CompletionItemProvider` on the `css` language is about 80 lines.
- **TOML highlighting.** A proper Monarch tokenizer, replacing the `ruby` workaround.
- **Recent files.** `chrome.storage.local` for the last five opened handles. Requires `FileSystemFileHandle` serialization, which is supported.
- **Open the current page's source.** Uses `activeTab` + `chrome.scripting.executeScript({ world: "MAIN" })` to grab `document.documentElement.outerHTML` and open it in the editor. `activeTab` is already declared.

---

## 🐛 Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| Editor area is blank | Monaco's loader failed to find `loader.js`, or a worker path is wrong | Open DevTools on the editor tab. If you see `ERR_FILE_NOT_FOUND` for `vendor/monaco/.../loader.js`, check that `vendor/monaco/0.45.0/min/vs/loader.js` exists. If you see `define is not defined` in a worker, check `core/worker-proxy.js` — `baseUrl` should end at `min/`, not `min/vs/`. |
| `Can only have one anonymous define call per script file` | `js-beautify` or Terser loaded **after** Monaco's AMD loader | Move the `<script>` tags for those files above `loader.js` in `editor/editor.html`. |
| `window.startEditor is not a function` | `editor.js` loaded **after** `boot.js` | Move `editor.js` above `boot.js` in `editor/editor.html`. |
| `Failed trying to load default language strings` in the worker | `baseUrl` in `core/worker-proxy.js` points at `min/vs/` instead of `min/` | Change the URL so the trailing path ends at `min/`; `vs/` is added by `importScripts`. |
| Compress on JS does nothing, or throws `Terser not loaded` | `vendor/terser/5.36.0/bundle.min.js` is missing or loaded after `loader.js` | Verify the file exists and is ~500 KB. Confirm the `<script>` tag is above `loader.js`. |
| Beautify on JS mangles template literals | You're using an old version of `editor.js` with the regex-based formatter | Use the current version — it calls `js_beautify`, not regex. |
| `.toml` files have Ruby-flavored highlighting | Expected — Monaco has no TOML grammar, and the extension maps to `ruby` | Acceptable for `key = value` files. A proper tokenizer is on the roadmap. |
| Save button is greyed out | No file is open yet | Click **Open…** first. |
| `●` appears on the filename but Save does nothing | The tab was opened before the file handle was granted, or write permission expired | Close the tab, reopen the file. |
| Extension reload doesn't change behavior in an already-open editor tab | Monaco and the vendor scripts are cached per tab session | Hard-refresh the tab: `Ctrl+Shift+R`. |
| Editor is slow on large files | Monaco with a 10 MB file is not fast | There's no hard limit, but files over ~2 MB will feel sluggish. `minimap: { enabled: false }` and `wordWrap: "on"` are already set to help. |

---

## 🙏 Credits

- **Monaco Editor** — the editor engine, © Microsoft, MIT licensed. `vendor/monaco/0.45.0/`.
- **js-beautify** — JS/CSS/HTML formatter, MIT licensed. `vendor/js-beautify/1.15.1/`.
- **Terser** — JS minifier, BSD-2-Clause licensed. `vendor/terser/5.36.0/`.
- **mdn-data** — CSS property and value data, CC0. `vendor/mdn-data/2.3.0/` (reserved for completion).

No other third-party libraries. No fonts loaded. No network calls at runtime.

---

## 📄 License

MIT — see [LICENSE](LICENSE).

---

## 🔗 Links

- [Download latest release](https://github.com/mimdal-code/file-friendly-editor-chrome-extension/releases/latest)
- [All releases](https://github.com/mimdal-code/file-friendly-editor-chrome-extension/releases)
- [Issue tracker](https://github.com/mimdal-code/file-friendly-editor-chrome-extension/issues)
- [Monaco Editor docs](https://microsoft.github.io/monaco-editor/)
- [File System Access API docs](https://developer.chrome.com/docs/capabilities/web-apis/file-system-access)
- [Chrome Extensions MV3 docs](https://developer.chrome.com/docs/extensions/develop/migrate/what-is-mv3)
