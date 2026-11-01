# Иконите o-experts

Изходът на набора „o-experts“ (Настройки → Иконите на приложенията).

- `glyphs.mjs` — рисунките (мрежа 64×64, линия 3,5) и картата на приложенията
- `build.mjs` — сглобява:
  - `node build.mjs sprite ../../theme_mcp_works_backend/static/src/img/app_icons_oexperts.svg ../../theme_mcp_works_backend/static/src/webclient/app_icon/oxi_glyphs.js` — спрайта и списъка за темата
  - `node build.mjs sheet` — листа за преглед (`sheet.html`, по `sheet.tpl.html`)
  - `node build.mjs svgset <файл.svg>` — целия набор в един векторен файл, светъл и тъмен слой

Нова рисунка: добави я в `GLYPHS` под ключа на глифа от картата на темата
(`app_icon.js`), после пусни `sprite`. Генерираните файлове не се пипат на ръка.
