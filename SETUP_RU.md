# 🖨 URL → PDF API — инструкция по запуску

Работающий форк брошенного проекта [`alvarcarto/url-to-pdf-api`](https://github.com/alvarcarto/url-to-pdf-api)
(MIT, 7.1k★). Исходник не обновлялся с 2024 года — здесь **обновлены зависимости
и починен код под современный Node и Puppeteer**.

Превращает любую веб-страницу (или свой HTML) в PDF / скриншот через простой HTTP API.

---

## 1. Требования

- **Node.js 18+** (проверено на Node 22)
- Интернет (для рендера внешних URL)
- ~300 МБ диска (Puppeteer скачает свой Chromium при установке)

## 2. Установка

```bash
git clone https://github.com/alvarcarto/url-to-pdf-api.git
cd url-to-pdf-api
npm install
```

`npm install` сам скачает совместимый Chromium (для Puppeteer 24).

## 3. Настройка

```bash
cp .env.sample .env
```

Минимально достаточно значений по умолчанию. Ключевые переменные в `.env`:

| Переменная | Значение по умолчанию | Зачем |
|------------|----------------------|-------|
| `PORT` | `9000` | порт HTTP-сервера |
| `ALLOW_HTTP` | `true` | разрешить HTTP (для локального теста нужен `true`) |
| `API_TOKENS` | пусто | если задать — API потребует ключ в заголовке `x-api-key` |
| `ALLOW_URLS` | пусто | whitelist URL: `host:example.com`, `regex:...` или точный URL |
| `DISABLE_HTML_INPUT` | `false` | запретить рендер HTML (оставить только `url=`) |
| `NODE_ENV` | `development` | `production` отключает debug-логи |

## 4. Запуск

```bash
npm start
```

Увидишь: `Express server listening on http://localhost:9000/`.

Проверка, что сервер живой:

```bash
curl http://localhost:9000/healthcheck
# → OK
```

## 5. Использование (примеры)

### Страница → PDF

```bash
curl "http://localhost:9000/api/render?url=https://example.com" -o example.pdf
```

### Свой HTML → PDF (POST)

```bash
curl -X POST http://localhost:9000/api/render \
  -H "Content-Type: application/json" \
  -d '{"html":"<h1>Привет</h1><p>Мой документ</p>"}' \
  -o doc.pdf
```

### Скриншот страницы (PNG)

```bash
curl "http://localhost:9000/api/render?url=https://example.com&output=screenshot" -o page.png
```

### Полезные параметры (в query или JSON body)

| Параметр | Что делает |
|----------|-----------|
| `pdf.format` | формат: `A4`, `Letter`, … |
| `pdf.landscape=true` | альбомная ориентация |
| `pdf.printBackground=true` | печатать фон |
| `pdf.fullPage=true` | вся страница одной высотой (без разбивки) |
| `pdf.displayHeaderFooter=true` + `pdf.headerTemplate` / `pdf.footerTemplate` | колонтитулы |
| `waitFor=3000` | подождать 3 сек перед рендером (для JS) |
| `waitFor=.selector` | подождать появления элемента |
| `scrollPage=true` | проскроллить страницу (ленивая загрузка) |
| `attachmentName=file.pdf` | отдать как вложение с именем |

## 6. Защита (обязательно, если открываете наружу)

API **по умолчанию без авторизации** — рендер чужого URL может использоваться
для SSRF. Для публичного запуска задайте в `.env`:

```
API_TOKENS=мой_секретный_ключ
ALLOW_URLS=host:example.com
```

Тогда клиенты передают ключ: `-H "x-api-key: мой_секретный_ключ"`,
а рендер разрешён только для указанных доменов.

## 7. Продакшн (фон как сервис)

### systemd (рекомендую)

`/etc/systemd/system/url-to-pdf.service`:

```ini
[Unit]
Description=URL to PDF API
After=network.target

[Service]
WorkingDirectory=/opt/url-to-pdf-api
ExecStart=/usr/bin/node src/index.js
Restart=always
EnvironmentFile=/opt/url-to-pdf-api/.env

[Install]
WantedBy=multi-user.target
```

```bash
systemctl daemon-reload
systemctl enable --now url-to-pdf
```

### или PM2

```bash
npm i -g pm2
pm2 start src/index.js --name url-to-pdf
pm2 save
```

За TLS можно спрятать за nginx (terminate HTTPS на прокси, `ALLOW_HTTP=true` внутри).

---

## Что исправлено в этом форке (относительно оригинала)

- `puppeteer` 2 → 24, `express` 4.15 → 4.21, `winston` 2 → 3, `joi` 11 → 17 и т.д.
- Убран заброшенный `express-validation` → лёгкий собственный валидатор (`src/util/validate.js`).
- Исправлены сломанные вызовы Puppeteer: `page.emulateMedia` → `emulateMediaType`,
  `page.target().createCDPSession()` → `page.createCDPSession()`, `page.waitFor` → `waitForTimeout`/`waitForSelector`.
- Исправлен ответ: Puppeteer 24 возвращает `Uint8Array`, Express 4 его не отправлял как бинарник —
  теперь конвертируется в `Buffer` (PDF/скриншоты корректны).
- Исправлен баг с `navigator` (не существует в Node) → `process.platform`.
- Добавлен `dotenv` для чтения `.env`, обновлён `engines` на Node 18+.

Лицензия — **MIT**, можно использовать и продавать.
