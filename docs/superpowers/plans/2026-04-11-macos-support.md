# macOS Support Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Добавить полноценную поддержку macOS в PriceFDM — меню с хоткеями, иконка .icns, конфиг сборки, обновление README.

**Architecture:** Приложение уже кроссплатформенное (Electron + React + MUI, нет Windows API). Нужны только: macOS-меню в main process для стандартных клавиатурных сочетаний, генерация .icns из существующего icon.png, секция `mac` в electron-builder, и обновление README.

**Tech Stack:** Electron 41 (Menu, app), electron-builder, macOS `iconutil` (системная утилита для .icns)

---

## File Structure

| File | Action | Responsibility |
|---|---|---|
| `electron/main.cjs` | Modify | Добавить macOS application menu |
| `public/icon.icns` | Create | macOS иконка приложения |
| `package.json` | Modify | Добавить секцию `mac` в electron-builder config |
| `README.md` | Modify | Обновить описание — поддержка Windows и macOS |

---

### Task 1: macOS Application Menu

**Почему это нужно:** На macOS Electron-приложение без явного меню не обрабатывает стандартные сочетания клавиш: Cmd+C (копировать), Cmd+V (вставить), Cmd+A (выделить всё), Cmd+X (вырезать), Cmd+Z (undo), Cmd+Q (выйти). Пользователь не сможет нормально работать с полями ввода. На Windows/Linux меню скрыто через `autoHideMenuBar: true` — это поведение сохраняется.

**Files:**
- Modify: `electron/main.cjs`

- [ ] **Step 1: Добавить импорт Menu в electron/main.cjs**

В начале файла добавить `Menu` к деструктуризации:

```javascript
const { app, BrowserWindow, Menu } = require('electron');
```

- [ ] **Step 2: Создать macOS-меню перед `createWindow`**

Добавить после строки `const isDev = !app.isPackaged;`:

```javascript
if (process.platform === 'darwin') {
  const template = [
    {
      label: app.name,
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideOthers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' },
      ],
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'selectAll' },
      ],
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { role: 'togglefullscreen' },
      ],
    },
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' },
        { role: 'zoom' },
        { role: 'close' },
      ],
    },
  ];
  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}
```

- [ ] **Step 3: Проверить вручную**

Запустить `npm run electron:dev` на macOS и проверить:
- В строке меню появилось меню приложения (PriceFDM, Edit, View, Window)
- Cmd+C / Cmd+V работают в текстовых полях
- Cmd+Q закрывает приложение
- Cmd+A выделяет текст в поле ввода
- Cmd+Z отменяет ввод

На Windows/Linux поведение не изменилось (блок обёрнут в `if (process.platform === 'darwin')`).

- [ ] **Step 4: Commit**

```bash
git add electron/main.cjs
git commit -m "[all] no-task: add macOS application menu for standard keyboard shortcuts"
```

---

### Task 2: Генерация иконки .icns для macOS

**Почему:** macOS использует формат `.icns` для иконок приложений. Существующий `icon.png` — 1024x1024 RGBA, идеально подходит как источник. Используем системную утилиту `iconutil` (есть на каждом маке).

**Files:**
- Create: `public/icon.icns`

- [ ] **Step 1: Сгенерировать .icns из icon.png**

Запустить в корне проекта:

```bash
mkdir -p /tmp/icon.iconset
sips -z 16 16     public/icon.png --out /tmp/icon.iconset/icon_16x16.png
sips -z 32 32     public/icon.png --out /tmp/icon.iconset/icon_16x16@2x.png
sips -z 32 32     public/icon.png --out /tmp/icon.iconset/icon_32x32.png
sips -z 64 64     public/icon.png --out /tmp/icon.iconset/icon_32x32@2x.png
sips -z 128 128   public/icon.png --out /tmp/icon.iconset/icon_128x128.png
sips -z 256 256   public/icon.png --out /tmp/icon.iconset/icon_128x128@2x.png
sips -z 256 256   public/icon.png --out /tmp/icon.iconset/icon_256x256.png
sips -z 512 512   public/icon.png --out /tmp/icon.iconset/icon_256x256@2x.png
sips -z 512 512   public/icon.png --out /tmp/icon.iconset/icon_512x512.png
sips -z 1024 1024 public/icon.png --out /tmp/icon.iconset/icon_512x512@2x.png
iconutil -c icns /tmp/icon.iconset -o public/icon.icns
rm -rf /tmp/icon.iconset
```

- [ ] **Step 2: Проверить результат**

```bash
file public/icon.icns
```

Ожидаемый вывод: `public/icon.icns: Mac OS X icon, ...`

- [ ] **Step 3: Commit**

```bash
git add public/icon.icns
git commit -m "[all] no-task: add macOS .icns icon generated from icon.png"
```

---

### Task 3: Конфигурация electron-builder для macOS

**Почему:** Текущий `package.json` содержит только секцию `win` для electron-builder. Нужно добавить `mac` для будущей сборки `.dmg`.

**Files:**
- Modify: `package.json:28-38`

- [ ] **Step 1: Добавить секцию `mac` в `build` конфиг**

В `package.json`, после закрывающей `}` секции `"win"` (строка 38), добавить запятую и секцию `mac`:

```json
    "win": {
      "target": [
        {
          "target": "portable",
          "arch": [
            "x64"
          ]
        }
      ],
      "icon": "public/icon.ico"
    },
    "mac": {
      "target": [
        {
          "target": "dmg",
          "arch": [
            "x64",
            "arm64"
          ]
        }
      ],
      "icon": "public/icon.icns",
      "category": "public.app-category.utilities"
    }
```

- [ ] **Step 2: Добавить npm script для сборки macOS**

В секцию `scripts` добавить:

```json
"electron:build:mac": "vite build && electron-builder --mac"
```

И переименовать существующий `electron:build` чтобы он собирал для текущей платформы (поведение по умолчанию), это уже так и работает — electron-builder без `--win`/`--mac` собирает для текущей ОС.

- [ ] **Step 3: Проверить валидность package.json**

```bash
node -e "JSON.parse(require('fs').readFileSync('package.json','utf8')); console.log('OK')"
```

Ожидаемый вывод: `OK`

- [ ] **Step 4: Commit**

```bash
git add package.json
git commit -m "[all] no-task: add macOS build target for electron-builder"
```

---

### Task 4: Обновить README.md

**Почему:** README сейчас говорит «Десктоп-приложение (для Windows)». Нужно обновить для обеих платформ.

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Обновить описание в заголовке**

Заменить строку 3:
```
Десктоп-приложение (для Windows) для расчёта себестоимости и продажной цены изделий, напечатанных на FDM-принтере.
```
На:
```
Десктоп-приложение (Windows / macOS) для расчёта себестоимости и продажной цены изделий, напечатанных на FDM-принтере.
```

- [ ] **Step 2: Обновить секцию «Сборка»**

Заменить строку 235 (заголовок «Сборка .exe для Windows»):
```markdown
### Сборка .exe для Windows
```
На:
```markdown
### Сборка десктоп-приложения
```

Заменить строки 237-239 (описание сборки):
```markdown
Собирает установщик NSIS в папку `dist-electron/`:

```bash
npm run electron:build
```

После сборки в `dist-electron/` появится файл `PriceFDM Setup 1.0.0.exe` — его можно установить на любой Windows без Node.js и браузера.
```
На:
```markdown
Собирает приложение для текущей ОС в папку `dist-electron/`:

```bash
npm run electron:build
```

- **Windows**: появится `PriceFDM Setup X.X.X.exe` — portable-версия, не требует установки
- **macOS**: появится `PriceFDM-X.X.X.dmg` — стандартный образ диска для установки
```

- [ ] **Step 3: Commit**

```bash
git add README.md
git commit -m "[all] no-task: update README for Windows + macOS support"
```

---

### Task 5: Финальная проверка на macOS

- [ ] **Step 1: Запустить dev-режим**

```bash
npm run electron:dev
```

Проверить:
1. Окно открывается, UI отображается корректно
2. Меню в строке меню macOS: PriceFDM, Edit, View, Window
3. Cmd+C / Cmd+V / Cmd+A / Cmd+X / Cmd+Z работают в текстовых полях
4. Cmd+Q закрывает приложение
5. Калькулятор считает (ввести вес, время — результат появляется)
6. Импорт G-code работает (загрузить .gcode файл)
7. Профили катушек/принтеров — CRUD работает
8. История — сохранение/загрузка расчётов
9. Настройки — переключение темы, экспорт/импорт бэкапа
10. Автосохранение черновика — закрыть и открыть приложение

- [ ] **Step 2: Проверить, что Windows-сборка не сломана**

```bash
npm run build
```

TypeScript + Vite build должен пройти без ошибок (как и до изменений).
