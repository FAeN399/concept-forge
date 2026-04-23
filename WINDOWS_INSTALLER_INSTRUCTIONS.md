# Windows Transfer And Installer Instructions

This project is currently a Vite + React web app in `app-next/`. It is not a desktop app yet, so the Windows installer step requires a desktop shell. The lowest-friction path is Electron + electron-builder.

## 1. Transfer The Project To Windows

Create a source archive on the Linux machine and copy it to Windows.

```bash
cd /home/milomiles/Projects/Splice/ConceptForge
zip -r concept-forge-app-next-source.zip app-next \
  -x 'app-next/node_modules/*' \
  -x 'app-next/dist/*'
```

Copy that zip file to the Windows machine and extract it somewhere like `C:\Projects\ConceptForge\app-next`.

## 2. Install Prerequisites On Windows

Install these first:

1. Node.js `22.12+`
2. `pnpm`
3. Git for Windows, if you want to keep using git on the Windows side

Verify them:

```powershell
node --version
pnpm --version
```

## 3. Install Project Dependencies

From the extracted `app-next` folder:

```powershell
pnpm install
```

If you are only running the web app, that is enough.

## 4. Build The Web App

```powershell
pnpm build
```

This produces the production web assets in `dist/`.

## 5. Add A Desktop Shell

Install Electron and the packaging tools:

```powershell
pnpm add -D electron electron-builder concurrently wait-on
```

Create an Electron entry file such as `electron/main.cjs` that:

1. Opens a browser window.
2. Loads `http://localhost:5173` in development.
3. Loads `dist/index.html` after a production build.

Add package scripts like these to `package.json`:

```json
{
  "scripts": {
    "dev": "vite",
    "dev:electron": "concurrently -k \"vite\" \"wait-on http://127.0.0.1:5173 && electron electron/main.cjs\"",
    "build": "tsc --noEmit && vite build",
    "dist": "pnpm build && electron-builder --win nsis"
  }
}
```

## 6. Package The Installer

On Windows, run:

```powershell
pnpm run dist
```

That should produce a Windows installer, usually under `dist/` or `release/` depending on the builder config.

## 7. Recommended Electron Builder Config

Use NSIS for a standard Windows installer.

Typical `electron-builder` settings:

1. `appId`: a stable reverse-DNS id like `com.yourname.conceptforge`
2. `productName`: `Concept Forge`
3. `directories.output`: `release`
4. `files`: include `dist/**`, `electron/**`, and `package.json`
5. `win.target`: `nsis`

## 8. What Not To Bundle

Do not include these in the transfer archive or installer payload:

1. `node_modules`
2. `dist`
3. build caches
4. temporary screenshots or scratch exports

## 9. If You Only Want A Portable Build

If you do not need an installer yet, you can stop after `pnpm build` and transfer the `dist/` folder plus the small Electron shell later.

## 10. Current Project Location

Use `ConceptForge/app-next/` as the active build folder. The older `ConceptForge/app/` version should stay untouched unless you intentionally migrate it.
