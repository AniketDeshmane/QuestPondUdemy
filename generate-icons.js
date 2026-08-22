const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

function createSolidPNG(width, height) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  
  // IHDR chunk
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // color type (RGB)
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace
  
  const ihdrChunk = makeChunk('IHDR', ihdr);
  
  // IDAT chunk
  const rawData = [];
  for (let y = 0; y < height; y++) {
    rawData.push(0); // Filter byte (0 = None)
    for (let x = 0; x < width; x++) {
      const midY = height / 2;
      const midX = width / 2;
      const dist = Math.sqrt((x - midX) ** 2 + (y - midY) ** 2);
      if (dist < width * 0.38 && dist > width * 0.2) {
        rawData.push(255, 255, 255); // White inner accent ring
      } else if (dist <= width * 0.2) {
        rawData.push(164, 53, 240); // Inner center
      } else {
        rawData.push(164, 53, 240); // Udemy Purple #a435f0
      }
    }
  }
  
  const compressed = zlib.deflateSync(Buffer.from(rawData));
  const idatChunk = makeChunk('IDAT', compressed);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));
  
  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function crc32(buf) {
  let crc = -1;
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 0xff];
  }
  return (crc ^ (-1)) >>> 0;
}

const table = (() => {
  const t = [];
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = ((c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1));
    }
    t[n] = c;
  }
  return t;
})();

function makeChunk(type, data) {
  const len = data.length;
  const chunk = Buffer.alloc(4 + 4 + len + 4);
  chunk.writeUInt32BE(len, 0);
  chunk.write(type, 4);
  data.copy(chunk, 8);
  const typeAndData = chunk.subarray(4, 8 + len);
  const crc = crc32(typeAndData);
  chunk.writeUInt32BE(crc, 8 + len);
  return chunk;
}

const iconDir = path.join(__dirname, 'questpond-udemy-extension', 'icons');
if (!fs.existsSync(iconDir)) {
  fs.mkdirSync(iconDir, { recursive: true });
}

[16, 48, 128].forEach(size => {
  const png = createSolidPNG(size, size);
  fs.writeFileSync(path.join(iconDir, `icon-${size}.png`), png);
  console.log(`Generated icon-${size}.png (${size}x${size})`);
});
