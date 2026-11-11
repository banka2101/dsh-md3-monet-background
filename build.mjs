import fs from 'node:fs';

const here = new URL('.', import.meta.url);
const template = fs.readFileSync(new URL('client.template.js', here), 'utf8');
const mcu = fs.readFileSync(new URL('vendor/mcu.inline.js', here), 'utf8');
const specs = fs.readFileSync(new URL('vendor/static-specs.js', here), 'utf8');
const marker = '/* __MCU_INLINE__ */';
if (!template.includes(marker)) throw new Error('client.template.js lost its MCU marker');
const specsMarker = '/* __STATIC_SPECS__ */';
if (!template.includes(specsMarker)) throw new Error('client.template.js lost its static-specs marker');
const output = template
  .replace(marker, `const MCU = ${mcu};`)
  .replace(specsMarker, `const STATIC_SPECS = ${specs};`);
fs.writeFileSync(new URL('client.js', here), output);
console.log(`client.js: ${Buffer.byteLength(output)} bytes`);
