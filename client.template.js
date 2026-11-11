/**
 * Theme background — Client half.
 *
 * Lets the user pick a photo as the Web GUI backdrop, extracts the dominant
 * color with Google's Material Color Utilities (the same Monet pipeline that
 * powers Material You), and stacks a light/dark alias-token palette over the
 * active theme. The original image and its extracted seed live in this
 * browser's IndexedDB; the Host half owns no state.
 *
 * Material Color Utilities is vendored below (Apache-2.0); see
 * LICENSE-MATERIAL-COLOR-UTILITIES. The marked line near the top is replaced
 * with the library bundle by build.mjs.
 */
window.__ModuleLoader__.load({
  id: '@local/theme-background',
  factory(require) {
    const React = require('react');
    const h = React.createElement;

    /* __MCU_INLINE__ */
    /* __STATIC_SPECS__ */

    const SOURCE = '@local/theme-background';
    const LEGACY_STORAGE_KEY = 'dsh.theme-background.v1';
    const WALLPAPER_DB = 'dsh.theme-background';
    const STORAGE_VERSION = 3;
    const NS = 'theme-background';
    // Target brightness distance from the active theme's end of the scale,
    // with limits so the choices still feel distinct on very light or dark photos.
    const APPEARANCES = {
      reading: { target: 0.23, min: 0.66, max: 0.88 },
      balanced: { target: 0.38, min: 0.42, max: 0.72 },
      photo: { target: 0.57, min: 0.19, max: 0.50 },
    };
    const DEFAULT_BRIGHTNESS = { low: 0.15, high: 0.85 };
    const DEFAULT_STATE = Object.freeze({
      image: null,
      name: '',
      seed: null,
      width: 0,
      height: 0,
      appearance: 'balanced',
      brightness: null,
    });

    const EN = {
      'section.title': 'Background',
      'page.title': 'Background',
      'page.intro': 'Use your own image behind the interface. Material You extracts a color from it and recolors the app.',
      'empty.title': 'No background image',
      'empty.hint': 'Choose a photo below, or drop one here.',
      'action.choose': 'Choose image',
      'action.replace': 'Replace image',
      'action.remove': 'Remove',
      'palette.title': 'Material You palette',
      'palette.seed': 'Seed color',
      'palette.primary': 'Primary',
      'palette.secondary': 'Secondary',
      'palette.tertiary': 'Tertiary',
      'palette.surface': 'Container',
      'palette.onSurface': 'Text',
      'appearance.title': 'Display mode',
      'appearance.reading': 'Readability first',
      'appearance.readingHint': 'Make interface text clearer',
      'appearance.balanced': 'Balanced',
      'appearance.balancedHint': 'Keep the photo and text visible',
      'appearance.photo': 'Wallpaper first',
      'appearance.photoHint': 'Show more of the photo',
      'preview.label': 'Live wallpaper preview',
      'preview.title': 'New chat',
      'preview.subtitle': 'Describe what you want to build',
      'status.busy': 'Extracting colors…',
      'error.type': 'Choose a PNG, JPEG, WebP, GIF, or AVIF image.',
      'error.size': 'The image must be 25 MB or smaller.',
      'error.read': 'The image could not be read.',
      'error.palette': 'The image is applied, but its colors could not be extracted; the default palette is used.',
      'error.save': 'The image could not be saved in this browser; it stays applied until you reload.',
      'error.remove': 'The saved image could not be removed; it may reappear when you reload.',
    };

    const ZH = {
      'section.title': '背景',
      'page.title': '背景',
      'page.intro': '使用你自己的图片作为界面背景，Material You 会从图片中取色并重新为界面着色。',
      'empty.title': '还没有背景图片',
      'empty.hint': '在下方选择一张照片，或把图片拖到这里。',
      'action.choose': '选择图片',
      'action.replace': '更换图片',
      'action.remove': '移除',
      'palette.title': 'Material You 色盘',
      'palette.seed': '种子色',
      'palette.primary': '主色',
      'palette.secondary': '辅助色',
      'palette.tertiary': '第三色',
      'palette.surface': '容器色',
      'palette.onSurface': '文字色',
      'appearance.title': '显示模式',
      'appearance.reading': '阅读优先',
      'appearance.readingHint': '界面文字更清楚',
      'appearance.balanced': '均衡',
      'appearance.balancedHint': '兼顾图片与文字',
      'appearance.photo': '壁纸优先',
      'appearance.photoHint': '展现更多原图细节',
      'preview.label': '壁纸实时预览',
      'preview.title': '新会话',
      'preview.subtitle': '描述你想要构建的内容',
      'status.busy': '正在提取颜色…',
      'error.type': '请选择 PNG、JPEG、WebP、GIF 或 AVIF 图片。',
      'error.size': '图片不能超过 25 MB。',
      'error.read': '无法读取这张图片。',
      'error.palette': '图片已应用，但无法从中提取颜色，已改用默认色盘。',
      'error.save': '这张图片无法保存在当前浏览器；重新加载页面前仍会生效。',
      'error.remove': '无法删除已保存的图片，重新加载后可能再次出现。',
    };

    const CSS = String.raw`
.tbx-section{box-sizing:border-box;display:flex;flex-direction:column;gap:12px;max-width:720px;color:var(--dsw-alias-label-primary)}
.tbx-title{margin:0;font-size:16px;font-weight:500;line-height:24px;color:var(--dsw-alias-label-primary)}
.tbx-intro{margin:0;font-size:14px;line-height:22px;color:var(--dsw-alias-label-secondary)}
.tbx-card{box-sizing:border-box;display:flex;flex-direction:column;gap:12px;padding:14px;border:.5px solid var(--dsw-alias-settings-card-stroke,var(--dsw-alias-border-l1));border-radius:var(--dsw-radius-xl,16px);background:var(--dsw-alias-settings-card-fill,var(--dsw-alias-bg-layer-1))}
.tbx-imageCard{container-type:inline-size}
.tbx-preview{position:relative;box-sizing:border-box;display:flex;align-items:center;justify-content:center;height:200px;overflow:hidden;border:.5px dashed var(--dsw-alias-border-l2);border-radius:var(--dsw-radius-lg,12px);background-color:var(--dsw-alias-bg-layer-1);background-position:center;background-size:cover;background-repeat:no-repeat}
.tbx-preview[data-filled=true]{border-style:solid;border-color:var(--dsw-alias-border-l1)}
.tbx-preview[data-drag=true]{border-color:var(--dsw-alias-brand-primary);border-style:solid;box-shadow:0 0 0 2px color-mix(in srgb,var(--dsw-alias-brand-primary) 22%,transparent)}
.tbx-previewImg{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.tbx-previewCopy{position:absolute;inset:auto 16px 16px;z-index:1;display:grid;gap:3px}
.tbx-previewCopy strong{font-size:18px;font-weight:600;line-height:24px}
.tbx-previewCopy span{font-size:12px;line-height:18px;color:var(--dsw-alias-label-secondary)}
.tbx-empty{position:relative;display:flex;flex-direction:column;align-items:center;gap:6px;padding:16px;text-align:center;color:var(--dsw-alias-label-tertiary)}
.tbx-emptyTitle{font-size:14px;line-height:22px;color:var(--dsw-alias-label-primary)}
.tbx-emptyHint{font-size:12px;line-height:18px;color:var(--dsw-alias-label-secondary)}
.tbx-actions{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.tbx-button{box-sizing:border-box;display:inline-flex;align-items:center;justify-content:center;height:36px;padding:0 14px;border-radius:var(--dsw-radius-md,8px);border:.5px solid transparent;font:inherit;font-size:14px;font-weight:500;line-height:22px;cursor:pointer}
.tbx-button:disabled{opacity:.55;cursor:default}
.tbx-primary{border:.5px solid color-mix(in srgb,var(--dsw-alias-brand-primary) 34%,transparent);background:color-mix(in srgb,var(--dsw-alias-brand-primary) 14%,transparent);color:var(--dsw-alias-brand-primary)}
.tbx-secondary{border-color:var(--dsw-alias-border-l2);background:transparent;color:var(--dsw-alias-label-primary)}
.tbx-pick{position:relative;display:inline-flex;border-radius:var(--dsw-radius-md,8px)}
.tbx-pick[data-disabled=true]{opacity:.55;cursor:default}
.tbx-fileInput{position:absolute;inset:0;width:100%;height:100%;opacity:0;cursor:pointer;font-size:0;border-radius:inherit}
.tbx-fileInput:disabled{cursor:default}
@media (hover:hover){.tbx-primary:hover:not(:disabled){filter:brightness(1.05)}.tbx-secondary:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover)}.tbx-pick:hover .tbx-primary{filter:brightness(1.08)}}
.tbx-pick:focus-within .tbx-primary{outline:2px solid var(--dsw-focus-ring-color,var(--dsw-alias-brand-primary));outline-offset:2px}
.tbx-meta{display:flex;flex-direction:column;align-items:flex-end;gap:0;min-width:0;margin-left:auto;font-size:11px;line-height:16px;color:var(--dsw-alias-label-secondary)}
.tbx-metaName{max-width:220px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.tbx-cardHead{display:flex;align-items:baseline;justify-content:space-between;gap:8px;flex-wrap:wrap}
.tbx-cardTitle{font-size:14px;font-weight:500;line-height:22px;color:var(--dsw-alias-label-primary)}
.tbx-seed{font-family:var(--ds-font-family-code,monospace);font-size:11px;line-height:16px;color:var(--dsw-alias-label-secondary)}
.tbx-palette{display:flex;align-items:flex-start;gap:14px;flex-wrap:wrap}
.tbx-swatch{display:flex;flex-direction:column;align-items:center;gap:5px;min-width:56px}
.tbx-chip{box-sizing:border-box;width:44px;height:44px;border-radius:50%;box-shadow:inset 0 0 0 .5px var(--dsw-alias-border-l2)}
.tbx-chipLabel{font-size:11px;line-height:16px;color:var(--dsw-alias-label-secondary);text-align:center}
.tbx-chipHex{font-family:var(--ds-font-family-code,monospace);font-size:10px;line-height:14px;color:var(--dsw-alias-label-secondary)}
.tbx-modeField{min-width:0;margin:2px 0 0;padding:0;border:0}
.tbx-modeField legend{margin:0 0 7px;padding:0;font-size:13px;font-weight:600}
.tbx-modes{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}
.tbx-mode{position:relative;display:grid;grid-template-columns:14px minmax(0,1fr);align-content:start;align-items:center;gap:4px 8px;padding:10px;border:1px solid var(--dsw-alias-border-l3);border-radius:var(--dsw-radius-md,8px);cursor:pointer}
.tbx-mode:has(:checked){border-color:color-mix(in srgb,var(--dsw-alias-brand-primary) 64%,transparent);background:color-mix(in srgb,var(--dsw-alias-brand-primary) 12%,transparent)}
.tbx-mode:has(:focus-visible){outline:2px solid var(--dsw-focus-ring-color,var(--dsw-alias-brand-primary));outline-offset:2px}
.tbx-mode input{width:14px;height:14px;margin:0;accent-color:var(--dsw-alias-brand-primary);cursor:inherit}
.tbx-modeName{font-size:13px;font-weight:600;line-height:18px}
.tbx-modeHint{grid-column:2;font-size:11px;line-height:16px;color:var(--dsw-alias-label-secondary)}
@media (hover:hover){.tbx-mode:hover:not(:has(:checked)){background:var(--dsw-alias-interactive-bg-hover)}}
@container (width<392px){.tbx-modes{grid-template-columns:1fr}}
.tbx-note{margin:0;font-size:12px;line-height:18px;color:var(--dsw-alias-label-secondary)}
.tbx-error{margin:0;font-size:12px;line-height:18px;color:var(--dsw-alias-state-error-primary)}
@media (width<=767px){.tbx-preview{height:150px}.tbx-meta{flex-basis:100%;align-items:flex-start;margin-left:0}.tbx-metaName{max-width:100%}}

.tbx-image-surface{--tbx-wash:var(--tbx-wash-light)}
body[data-ds-dark-theme] .tbx-image-surface{--tbx-wash:var(--tbx-wash-dark)}
.tbx-image-surface::after{content:"";position:absolute;inset:0;pointer-events:none;
  background-color:color-mix(in srgb,var(--dsw-alias-bg-base) var(--tbx-wash),transparent)}
.tbx-backdrop{position:fixed;inset:0;z-index:-1;pointer-events:none;overflow:hidden;background:var(--dsw-alias-bg-base)}
.tbx-backdrop img{display:block;width:100%;height:100%;object-fit:cover;object-position:center}

/* Shell surfaces share the backdrop. Cards, popovers, and the sidebar drawer
   keep their own fills. Match layout data attributes and CSS module names
   without depending on the hash generated by this DSH release. */
body:has(> .tbx-backdrop){isolation:isolate;background:transparent!important}
body:has(> .tbx-backdrop) #root,
body:has(> .tbx-backdrop) [class$="_frame"]:has(> [data-shell-overlay]),
body:has(> .tbx-backdrop) [class$="_frame"]:has(> [data-shell-overlay])::before,
body:has(> .tbx-backdrop) [class$="_frame"]:has(> [data-shell-overlay]) > :is([class$="_centerCol"],[data-rightbar-col],[data-shell-bottom]),
body:has(> .tbx-backdrop) [class$="_frame"]:not([data-sidebar-drawer]):has(> [data-shell-overlay]) > [class$="_sidebarCol"],
body:has(> .tbx-backdrop) [class$="_mainPanel"] [data-phase]:has(> [data-conversation-content]),
body:has(> .tbx-backdrop) [class$="_mainPanel"] [data-conversation-content] [data-composer-seat],
body:has(> .tbx-backdrop) [data-global-panel] [data-testid="task-manager-page"]{
  background:transparent!important
}
body:has(> .tbx-backdrop) [class$="_frame"][data-sidebar-drawer]:has(> [data-shell-overlay]) > [class$="_sidebarCol"]{
  background:var(--dsw-alias-bg-layer-1)
}
body:has(> .tbx-backdrop) [data-global-panel]{
  --dsw-specific-sidebar-fill:var(--dsw-alias-bg-layer-1)
}
/* The plugin list's sticky header paints its background in this pseudo-element. */
body:has(> .tbx-backdrop) [data-global-panel] [data-plugin-bar]::before{
  content:none
}
/* The stock composer hardcodes white for these primary buttons. */
body:has(> .tbx-backdrop) [data-composer-card] button[class$="_primary"]{
  color:var(--dsw-alias-label-primary-foreground)
}
`;

    let cachedSeed = null;
    let cachedSchemes = null;
    function schemesForSeed(seed) {
      if (seed !== cachedSeed) {
        const source = MCU.Hct.fromInt(seed);
        cachedSchemes = {
          light: new MCU.SchemeTonalSpot(source, false, 0),
          dark: new MCU.SchemeTonalSpot(source, true, 0),
        };
        cachedSeed = seed;
      }
      return cachedSchemes;
    }

    function hexToRgba(hex, alpha) {
      const r = Number.parseInt(hex.slice(1, 3), 16);
      const g = Number.parseInt(hex.slice(3, 5), 16);
      const b = Number.parseInt(hex.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }

    let cachedBaseSeed = null;
    let cachedBaseTokens = null;

    function buildBaseTokens(seed) {
      if (seed === cachedBaseSeed) return cachedBaseTokens;
      const { light, dark } = schemesForSeed(seed);
      const hex = MCU.hexFromArgb;
      const tokens = {};

      // Retain the platform's tonal scales for components that consume static
      // colors. Use paired semantic roles wherever DSH exposes an alias.
      const palettes = {
        neutral: light.neutralPalette,
        primary: light.primaryPalette,
        tertiary: light.tertiaryPalette,
        error: light.errorPalette,
        green: MCU.TonalPalette.fromHueAndChroma(150, 45),
        amber: MCU.TonalPalette.fromHueAndChroma(80, 60),
      };
      for (const [name, family, tone, alpha] of STATIC_SPECS) {
        const color = hex(palettes[family].tone(tone));
        const value = alpha >= 0.999 ? color : hexToRgba(color, alpha);
        tokens[`--dsw-static-${name}`] = { light: value, dark: value };
      }

      const roles = {
        'alias-bg-base': 'surface',
        'alias-bg-document-preview': 'surfaceContainerLow',
        'alias-bg-layer-1': 'surfaceContainerLow',
        'alias-bg-layer-2': 'surfaceContainer',
        'alias-bg-layer-3': 'surfaceContainerHigh',
        'alias-bg-module-platform': 'surfaceContainer',
        'alias-bg-multi-select': 'secondaryContainer',
        'alias-bg-overlay': 'surfaceContainerHighest',
        'specific-input-major': 'surfaceContainerHigh',
        'specific-selector': 'surfaceContainerHighest',
        'specific-menu': 'surfaceContainerHigh',
        'specific-tip': 'surfaceContainerHigh',
        'specific-login-input': 'surfaceContainer',
        'specific-bubble': 'secondaryContainer',
        'specific-bubble-highlight': 'primaryContainer',
        'specific-sidebar-nav-item-active': 'secondaryContainer',
        'specific-sidebar-nav-item-active-accent': 'primaryContainer',
        'alias-menu-group-header-fill': 'surfaceContainerHighest',
        'alias-menu-icon': 'onSurfaceVariant',
        'alias-label-primary': 'onSurface',
        'alias-label-secondary': 'onSurfaceVariant',
        'alias-label-tertiary': 'onSurfaceVariant',
        'alias-label-primary-bluish': 'onSurface',
        'alias-label-primary-dimmed': 'onSurfaceVariant',
        'alias-label-document-preview': 'onSurfaceVariant',
        'alias-label-primary-foreground': 'onPrimary',
        'alias-label-primary-inverted': 'inverseOnSurface',
        'alias-brand-primary': 'primary',
        'alias-brand-primary-invert': 'onPrimary',
        'alias-brand-primary-new-colorprimary-new-color': 'primary',
        'alias-brand-text': 'onSurface',
        'alias-link': 'primary',
        'alias-state-business-primary': 'primary',
        'alias-state-business-tertiary': 'primaryContainer',
        'alias-state-done-primary': 'tertiary',
        'alias-state-error-primary': 'error',
        'alias-state-error-secondary': 'error',
        'alias-button-primary-fill': 'primary',
        'alias-button-primary-dimmed': 'surfaceContainerHighest',
        'alias-button-info-fill': 'primary',
        'alias-button-elevated-fill': 'surfaceContainerHigh',
        'alias-button-floating-fill': 'surfaceContainerHigh',
        'alias-button-floating-hover': 'surfaceContainerHighest',
        'alias-button-ghost-active-border': 'outline',
        'alias-button-ghost-active-fill': 'secondaryContainer',
        'alias-button-ghost-active-hover': 'surfaceContainerHighest',
        'alias-interactive-bg-hover-solid': 'surfaceContainerHighest',
        'alias-tooltip-bg': 'surfaceContainerHighest',
        'alias-tooltip-label': 'onSurface',
        'alias-toast-bg': 'surfaceContainerHighest',
        'alias-toast-label': 'onSurface',
        'alias-markdown-citation': 'surfaceContainerHighest',
        'alias-markdown-code-block': 'surfaceContainerLow',
        'alias-markdown-code-block-banner': 'surfaceContainer',
        'alias-markdown-code-segment-selected': 'surfaceContainerHighest',
        'alias-markdown-code-segment-unselected': 'surfaceContainer',
        'alias-markdown-inline-code': 'surfaceContainerHigh',
        'alias-markdown-placeholder': 'surfaceContainer',
        'alias-markdown-tag': 'surfaceContainerHigh',
      };
      for (const [name, role] of Object.entries(roles)) {
        tokens[`--dsw-${name}`] = { light: hex(light[role]), dark: hex(dark[role]) };
      }

      const stateLayer = (role, alphaLight, alphaDark) => ({
        light: hexToRgba(hex(light[role]), alphaLight),
        dark: hexToRgba(hex(dark[role]), alphaDark),
      });
      tokens['--dsw-alias-border-l1'] = stateLayer('outline', 0.16, 0.16);
      tokens['--dsw-alias-border-l2'] = stateLayer('outline', 0.25, 0.24);
      tokens['--dsw-alias-border-l2-darkmode-thin'] = stateLayer('outline', 0.25, 0.16);
      tokens['--dsw-alias-border-l3'] = stateLayer('outline', 0.34, 0.33);
      tokens['--dsw-alias-border-l4'] = stateLayer('outline', 0.44, 0.44);
      tokens['--dsw-alias-border-inverted'] = stateLayer('outline', 0, 0.18);
      tokens['--dsw-alias-border-inverted2'] = stateLayer('outline', 0, 0.24);
      tokens['--dsw-alias-interactive-bg-hover'] = stateLayer('onSurface', 0.08, 0.08);
      tokens['--dsw-alias-interactive-bg-active'] = stateLayer('onSurface', 0.12, 0.12);
      tokens['--dsw-alias-interactive-bg-hover-accent'] = stateLayer('primary', 0.16, 0.16);
      tokens['--dsw-alias-interactive-bg-hover-danger'] = stateLayer('error', 0.12, 0.12);
      tokens['--dsw-alias-bg-document-selection'] = stateLayer('primary', 0.28, 0.32);
      tokens['--dsw-alias-bg-mask-drop'] = stateLayer('surface', 0.72, 0.72);
      tokens['--dsw-alias-bg-skeleton'] = stateLayer('onSurface', 0.08, 0.08);

      const primaryHover = {
        light: hex(light.primaryPalette.tone(33)),
        dark: hex(dark.primaryPalette.tone(86)),
      };
      tokens['--dsw-alias-button-primary-hover'] = primaryHover;
      tokens['--dsw-alias-button-info-hover'] = primaryHover;
      tokens['--dsw-alias-button-tool-bar-fill'] = stateLayer('surfaceContainerHighest', 0.88, 0.88);
      tokens['--dsw-alias-button-tool-bar-fill-invisible'] = stateLayer('surfaceContainerHighest', 0.64, 0.64);
      tokens['--dsw-alias-button-tool-bar-hover'] = stateLayer('surfaceContainerHighest', 1, 1);
      // Windows also reads this token for the native caption buttons' fill.
      tokens['--dsw-specific-sidebar-fill'] = { light: 'transparent', dark: 'transparent' };

      cachedBaseSeed = seed;
      cachedBaseTokens = tokens;
      return tokens;
    }

    function paletteSwatches(seed, colorScheme) {
      const scheme = schemesForSeed(seed)[colorScheme];
      return [
        ['palette.primary', scheme.primary],
        ['palette.secondary', scheme.secondary],
        ['palette.tertiary', scheme.tertiary],
        ['palette.surface', scheme.surfaceContainer],
        ['palette.onSurface', scheme.onSurface],
      ].map(([label, color]) => [label, MCU.hexFromArgb(color)]);
    }

    function imageBrightness(pixels) {
      const histogram = new Uint32Array(256);
      let count = 0;
      for (let i = 0; i < pixels.length; i += 4) {
        if (pixels[i + 3] < 128) continue;
        const brightness = Math.round(0.2126 * pixels[i] + 0.7152 * pixels[i + 1] + 0.0722 * pixels[i + 2]);
        histogram[brightness] += 1;
        count += 1;
      }
      if (count === 0) return DEFAULT_BRIGHTNESS;

      function percentile(fraction) {
        const rank = Math.ceil(count * fraction);
        let seen = 0;
        for (let i = 0; i < histogram.length; i += 1) {
          seen += histogram[i];
          if (seen >= rank) return i / 255;
        }
        return 1;
      }

      return { low: percentile(0.1), high: percentile(0.9) };
    }

    function appearanceStyle(appearance, brightness = DEFAULT_BRIGHTNESS) {
      const { min, max, target } = APPEARANCES[appearance];
      // Match the approximate sRGB brightness of the neutral surface tokens.
      function wash(distance, surfaceDistance) {
        const amount = distance > target ? (distance - target) / (distance - surfaceDistance) : 0;
        return `${Math.round(Math.max(min, Math.min(max, amount)) * 100)}%`;
      }
      return {
        '--tbx-wash-light': wash(1 - brightness.low, 0.03),
        '--tbx-wash-dark': wash(brightness.high, 0.07),
      };
    }

    function normalizeStored(data) {
      if (data === null || typeof data !== 'object') return null;
      if (data.v !== 1 && data.v !== 2 && data.v !== STORAGE_VERSION) return null;
      const validImage = data.image instanceof Blob ? data.image.size > 0
        : typeof data.image === 'string' && data.image.startsWith('data:image/');
      if (!validImage) return null;
      if (typeof data.seed !== 'number' || !Number.isFinite(data.seed)) return null;
      const appearance = data.v === STORAGE_VERSION && typeof data.appearance === 'string' &&
        Object.hasOwn(APPEARANCES, data.appearance) ? data.appearance : DEFAULT_STATE.appearance;
      const { low, high } = data.brightness ?? {};
      const brightness = data.v === STORAGE_VERSION && Number.isFinite(low) && Number.isFinite(high) &&
        low >= 0 && high <= 1 && low <= high ? { low, high } : null;
      return {
        image: data.image,
        name: typeof data.name === 'string' ? data.name : '',
        seed: data.seed,
        width: Number.isFinite(data.width) ? Math.max(0, Math.round(data.width)) : 0,
        height: Number.isFinite(data.height) ? Math.max(0, Math.round(data.height)) : 0,
        appearance,
        brightness,
      };
    }

    function sampleImage(image, maxEdge) {
      const scale = Math.min(1, maxEdge / Math.max(image.naturalWidth, image.naturalHeight));
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
      canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
      const context = canvas.getContext('2d', { alpha: false, willReadFrequently: true });
      if (context === null) throw new Error('Canvas is unavailable');
      context.fillStyle = '#ffffff';
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      return context.getImageData(0, 0, canvas.width, canvas.height).data;
    }

    let storageQueue = Promise.resolve();

    function accessWallpaper(mode, operation) {
      // Preserve the order of writes, removal, and restore during plugin reloads.
      const result = storageQueue.then(async () => {
        const db = await new Promise((resolve, reject) => {
          const request = indexedDB.open(WALLPAPER_DB, 1);
          request.onupgradeneeded = () => request.result.createObjectStore('wallpaper');
          request.onsuccess = () => resolve(request.result);
          request.onerror = () => reject(request.error);
        });
        try {
          return await new Promise((resolve, reject) => {
            const transaction = db.transaction('wallpaper', mode);
            const request = operation(transaction.objectStore('wallpaper'));
            transaction.oncomplete = () => resolve(request.result);
            transaction.onabort = () => reject(transaction.error ?? new Error('Wallpaper storage was aborted'));
          });
        } finally {
          db.close();
        }
      });
      storageQueue = result.catch(() => {});
      return result;
    }

    return {
      inject: ['slots', 'theme', 'locale'],
      apply(ctx) {
        if (typeof document === 'undefined' || typeof window === 'undefined') return;
        const translate = ctx.locale.bind(NS);
        const tr = (key) => translate(key);

        ctx.effect(() => {
          const en = ctx.locale.register(NS, 'en', EN);
          const zh = ctx.locale.register(NS, 'zh', ZH);
          return () => {
            zh();
            en();
          };
        }, 'theme-background: locale');

        ctx.effect(() => {
          const style = document.createElement('style');
          style.setAttribute('data-plugin', SOURCE);
          style.textContent = CSS;
          document.head.appendChild(style);
          return () => style.remove();
        }, 'theme-background: styles');

        let tokenDispose = null;
        let imageBlob = null;
        let disposed = false;
        let restored = Promise.resolve();
        const store = {
          ...DEFAULT_STATE,
          busy: false,
          error: '',
        };
        const listeners = new Set();
        let revision = 0;

        function publish(patch) {
          Object.assign(store, patch);
          revision += 1;
          for (const listener of [...listeners]) listener(revision);
        }

        function useStore() {
          const [, bump] = React.useReducer((value) => value + 1, 0);
          React.useEffect(() => {
            listeners.add(bump);
            return () => listeners.delete(bump);
          }, []);
          return store;
        }

        const backdrop = document.createElement('div');
        backdrop.className = 'tbx-backdrop tbx-image-surface';
        backdrop.setAttribute('aria-hidden', 'true');
        const wallpaper = document.createElement('img');
        wallpaper.alt = '';
        backdrop.append(wallpaper);

        function setBackdrop(state) {
          if (!state?.image) {
            backdrop.remove();
            wallpaper.removeAttribute('src');
            return;
          }
          if (wallpaper.getAttribute('src') !== state.image) wallpaper.src = state.image;
          for (const [name, value] of Object.entries(appearanceStyle(state.appearance, state.brightness ?? undefined))) {
            backdrop.style.setProperty(name, value);
          }
          if (!backdrop.isConnected) document.body.prepend(backdrop);
        }

        function applyBackground() {
          try {
            setBackdrop(store);
          } catch (error) {
            console.error(error);
            publish({ error: tr('error.read') });
          }
        }

        function applyTokens(state) {
          if (tokenDispose !== null) {
            tokenDispose();
            tokenDispose = null;
          }
          if (state === null || typeof state.seed !== 'number') return;
          try {
            tokenDispose = ctx.theme.overrideTokens(SOURCE, buildBaseTokens(state.seed));
          } catch (error) {
            console.error(error);
            publish({ error: tr('error.read') });
          }
        }

        function snapshot() {
          return {
            v: STORAGE_VERSION,
            image: imageBlob ?? store.image,
            name: store.name,
            seed: store.seed,
            width: store.width,
            height: store.height,
            appearance: store.appearance,
            brightness: store.brightness,
          };
        }

        async function persistNow() {
          const url = store.image;
          if (url === null) return;
          const data = snapshot();
          try {
            if (imageBlob === null) {
              localStorage.setItem(LEGACY_STORAGE_KEY, JSON.stringify(data));
              return;
            }
            await accessWallpaper('readwrite', (records) => records.put(data, 'current'));
          } catch (error) {
            console.error(error);
            if (!disposed && store.image === url) publish({ error: tr('error.save') });
            return;
          }
          // The previous version's copy is redundant once the new one has committed.
          try {
            localStorage.removeItem(LEGACY_STORAGE_KEY);
          } catch (error) {
            console.error(error);
          }
        }

        function measureLoadedWallpaper() {
          if (store.brightness !== null || wallpaper.naturalWidth === 0 ||
            !wallpaper.complete || wallpaper.getAttribute('src') !== store.image) return;
          try {
            const brightness = imageBrightness(sampleImage(wallpaper, 64));
            publish({ brightness });
            applyBackground();
            void persistNow();
          } catch (error) {
            console.error(error);
          }
        }

        async function readStored() {
          try {
            const data = await accessWallpaper('readonly', (records) => records.get('current'));
            const normalized = normalizeStored(data);
            if (normalized !== null) return normalized;
          } catch (error) {
            console.error(error);
          }
          try {
            const raw = localStorage.getItem(LEGACY_STORAGE_KEY);
            return raw === null ? null : normalizeStored(JSON.parse(raw));
          } catch (error) {
            console.error(error);
            return null;
          }
        }

        function applyState(state, url) {
          const previousUrl = imageBlob === null ? null : store.image;
          imageBlob = state.image instanceof Blob ? state.image : null;
          publish({ ...state, image: imageBlob === null ? state.image : url ?? URL.createObjectURL(imageBlob) });
          applyBackground();
          applyTokens(store);
          if (previousUrl !== null) URL.revokeObjectURL(previousUrl);
        }

        function isImageFile(file) {
          if (file.type.startsWith('image/')) return true;
          return /\.(png|jpe?g|webp|gif|avif|bmp)$/i.test(file.name || '');
        }

        let uploadSequence = 0;
        async function handleFile(file) {
          if (!file) return;
          if (!isImageFile(file)) {
            publish({ error: tr('error.type') });
            return;
          }
          if (file.size > 25 * 1024 * 1024) {
            publish({ error: tr('error.size') });
            return;
          }
          const sequence = ++uploadSequence;
          publish({ busy: true, error: '' });

          let url = null;
          try {
            // Snapshot the bytes so the active wallpaper also survives moving the source file.
            const blob = new Blob([await file.arrayBuffer()], { type: file.type });
            if (sequence !== uploadSequence) return;
            url = URL.createObjectURL(blob);
            const image = new Image();
            image.src = url;
            await image.decode();
            await restored;
            if (sequence !== uploadSequence) return;

            let seed = 0xff7fc8b6;
            let brightness = null;
            let paletteFailed = false;
            try {
              const pixels = sampleImage(image, 160);
              brightness = imageBrightness(pixels);
              const extracted = MCU.sourceColorFromImageBytes(pixels);
              if (Number.isFinite(extracted)) seed = extracted;
              else paletteFailed = true;
            } catch (error) {
              console.error(error);
              paletteFailed = true;
            }
            applyState({
              image: blob,
              name: file.name,
              seed,
              width: image.naturalWidth,
              height: image.naturalHeight,
              brightness,
              error: paletteFailed ? tr('error.palette') : '',
            }, url);
            url = null; // The active wallpaper now owns this object URL.
            await persistNow();
            if (sequence === uploadSequence) publish({ busy: false });
          } catch (error) {
            console.error(error);
            if (sequence === uploadSequence) publish({ busy: false, error: tr('error.read') });
          } finally {
            if (url !== null) URL.revokeObjectURL(url);
          }
        }

        function updateAppearance(appearance) {
          publish({ appearance });
          applyBackground();
          void persistNow();
        }

        async function removeImage() {
          const sequence = ++uploadSequence;
          const wasBlob = imageBlob !== null;
          applyState({ ...DEFAULT_STATE, busy: false, error: '' });
          try {
            localStorage.removeItem(LEGACY_STORAGE_KEY);
          } catch (error) {
            console.error(error);
            publish({ error: tr('error.remove') });
          }
          try {
            await accessWallpaper('readwrite', (records) => records.delete('current'));
          } catch (error) {
            console.error(error);
            if (wasBlob && sequence === uploadSequence) publish({ error: tr('error.remove') });
          }
        }

        function BackgroundSection() {
          const state = useStore();
          const appearanceGroup = React.useId();
          const [dragOver, setDragOver] = React.useState(false);
          const [, localeBump] = React.useReducer((value) => value + 1, 0);
          const [, themeBump] = React.useReducer((value) => value + 1, 0);

          React.useEffect(() => {
            const offLocale = ctx.locale.subscribe(localeBump);
            const offTheme = ctx.on('theme/change', themeBump);
            return () => {
              offLocale();
              offTheme();
            };
          }, []);

          const t = ctx.locale.bind(NS);
          const hasImage = typeof state.image === 'string' && state.image.length > 0;
          const hasSeed = Number.isFinite(state.seed);
          const colorScheme = ctx.theme.getTheme().active.colorScheme === 'dark' ? 'dark' : 'light';
          const swatches = hasSeed ? paletteSwatches(state.seed, colorScheme) : [];

          const onPicked = (event) => {
            const file = event.target.files && event.target.files[0];
            event.target.value = '';
            void handleFile(file);
          };

          const onDrop = (event) => {
            event.preventDefault();
            setDragOver(false);
            const file = event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files[0];
            if (file) void handleFile(file);
          };

          const onDragOver = (event) => {
            event.preventDefault();
            if (event.dataTransfer) event.dataTransfer.dropEffect = 'copy';
            if (!dragOver) setDragOver(true);
          };

          const onDragLeave = (event) => {
            if (!event.currentTarget.contains(event.relatedTarget)) setDragOver(false);
          };

          return h(
            'section',
            { className: 'tbx-section' },
            h('h2', { className: 'tbx-title' }, t('page.title')),
            h('p', { className: 'tbx-intro' }, t('page.intro')),
            h(
              'div',
              { className: 'tbx-card tbx-imageCard' },
              h(
                'div',
                {
                  className: hasImage ? 'tbx-preview tbx-image-surface' : 'tbx-preview',
                  style: hasImage ? appearanceStyle(state.appearance, state.brightness ?? undefined) : undefined,
                  role: hasImage ? 'img' : undefined,
                  'aria-label': hasImage ? t('preview.label') : undefined,
                  'data-filled': hasImage ? 'true' : 'false',
                  'data-drag': dragOver ? 'true' : 'false',
                  onDragOver,
                  onDragLeave,
                  onDrop,
                },
                hasImage
                  ? h(
                    React.Fragment,
                    null,
                    h('img', {
                      className: 'tbx-previewImg',
                      src: state.image,
                      alt: '',
                      draggable: false,
                    }),
                    h(
                      'div',
                      { className: 'tbx-previewCopy', 'aria-hidden': true },
                      h('strong', null, t('preview.title')),
                      h('span', null, t('preview.subtitle')),
                    ),
                  )
                  : h(
                    'div',
                    { className: 'tbx-empty' },
                    h(
                      'svg',
                      {
                        width: 36,
                        height: 36,
                        viewBox: '0 0 36 36',
                        fill: 'none',
                        'aria-hidden': true,
                      },
                      h('rect', {
                        x: 4.5,
                        y: 7.5,
                        width: 27,
                        height: 21,
                        rx: 3.5,
                        stroke: 'currentColor',
                        strokeWidth: 1.4,
                      }),
                      h('circle', {
                        cx: 12.5,
                        cy: 14.5,
                        r: 2.6,
                        stroke: 'currentColor',
                        strokeWidth: 1.4,
                      }),
                      h('path', {
                        d: 'M6 25.5l7.5-7 5.5 5 3.5-3 7 7',
                        stroke: 'currentColor',
                        strokeWidth: 1.4,
                        strokeLinecap: 'round',
                        strokeLinejoin: 'round',
                      }),
                    ),
                    h('div', { className: 'tbx-emptyTitle' }, t('empty.title')),
                    h('div', { className: 'tbx-emptyHint' }, t('empty.hint')),
                  ),
              ),
              state.busy ? h('p', { className: 'tbx-note' }, t('status.busy')) : null,
              state.error ? h('p', { className: 'tbx-error', role: 'alert' }, state.error) : null,
              h(
                'div',
                { className: 'tbx-actions' },
                h(
                  'label',
                  {
                    className: 'tbx-pick',
                    'data-disabled': state.busy ? 'true' : 'false',
                    'aria-disabled': state.busy ? 'true' : 'false',
                  },
                  h(
                    'span',
                    { className: 'tbx-button tbx-primary' },
                    hasImage ? t('action.replace') : t('action.choose'),
                  ),
                  h('input', {
                    className: 'tbx-fileInput',
                    type: 'file',
                    accept: 'image/*',
                    disabled: state.busy,
                    onChange: onPicked,
                  }),
                ),
                hasImage
                  ? h(
                    'button',
                    {
                      type: 'button',
                      className: 'tbx-button tbx-secondary',
                      disabled: state.busy,
                      onClick: removeImage,
                    },
                    t('action.remove'),
                  )
                  : null,
                hasImage
                  ? h(
                    'div',
                    { className: 'tbx-meta' },
                    h('span', { className: 'tbx-metaName', title: state.name }, state.name),
                    h(
                      'span',
                      null,
                      state.width > 0 ? `${state.width} × ${state.height} px` : '',
                    ),
                  )
                  : null,
              ),
              hasImage
                ? h(
                  'fieldset',
                  { className: 'tbx-modeField' },
                  h('legend', null, t('appearance.title')),
                  h(
                    'div',
                    { className: 'tbx-modes' },
                    Object.keys(APPEARANCES).map((appearance) => {
                      const hint = `${appearanceGroup}-${appearance}`;
                      return h(
                        'label',
                        { className: 'tbx-mode', key: appearance },
                        h('input', {
                          type: 'radio',
                          name: appearanceGroup,
                          value: appearance,
                          checked: state.appearance === appearance,
                          'aria-label': t(`appearance.${appearance}`),
                          'aria-describedby': hint,
                          onChange: () => updateAppearance(appearance),
                        }),
                        h('span', { className: 'tbx-modeName' }, t(`appearance.${appearance}`)),
                        h('span', { className: 'tbx-modeHint', id: hint }, t(`appearance.${appearance}Hint`)),
                      );
                    }),
                  ),
                )
                : null,
            ),
            hasImage
              ? h(
                'div',
                { className: 'tbx-card' },
                h(
                  'div',
                  { className: 'tbx-cardHead' },
                  h('div', { className: 'tbx-cardTitle' }, t('palette.title')),
                  h(
                    'div',
                    { className: 'tbx-seed' },
                    hasSeed ? `${t('palette.seed')} ${MCU.hexFromArgb(state.seed).toUpperCase()}` : '',
                  ),
                ),
                h(
                  'div',
                  { className: 'tbx-palette' },
                  swatches.map(([labelKey, color]) =>
                    h(
                      'div',
                      { className: 'tbx-swatch', key: labelKey },
                      h('div', {
                        className: 'tbx-chip',
                        style: { background: color },
                      }),
                      h('div', { className: 'tbx-chipLabel' }, t(labelKey)),
                      h('div', { className: 'tbx-chipHex' }, color.toUpperCase()),
                    ),
                  ),
                ),
              )
              : null,
          );
        }

        ctx.effect(() => {
          disposed = false;
          wallpaper.addEventListener('load', measureLoadedWallpaper);
          restored = readStored().then((stored) => {
            if (!disposed && stored !== null) applyState(stored);
          });
          return () => {
            disposed = true;
            wallpaper.removeEventListener('load', measureLoadedWallpaper);
            uploadSequence += 1;
            if (tokenDispose !== null) {
              tokenDispose();
              tokenDispose = null;
            }
            try {
              setBackdrop(null);
            } catch (error) {
              console.error(error);
            } finally {
              if (imageBlob !== null) URL.revokeObjectURL(store.image);
            }
          };
        }, 'theme-background: applied state');

        ctx.slots.inject('settings.section', () =>
          ctx.slots.register(
            {
              name: 'settings.section',
              id: 'theme-background',
              order: 5,
              label: () => translate('section.title'),
            },
            BackgroundSection,
          ));
      },
    };
  },
});
