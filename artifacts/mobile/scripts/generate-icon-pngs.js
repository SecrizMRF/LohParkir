const fs = require("fs");
const path = require("path");
const sharp = require("sharp");
const feather = require("feather-icons");

const OUT_DIR = path.resolve(__dirname, "..", "assets", "icons");
fs.mkdirSync(OUT_DIR, { recursive: true });

const MCI_NAMES = [
  "alert", "camera", "car", "cash", "cash-multiple", "cellphone-arrow-down",
  "check-circle", "check-decagram", "information", "map-marker", "motorbike",
  "qrcode", "qrcode-scan", "radar", "receipt", "road-variant", "star", "wallet",
];

const FEATHER_NAMES = [
  "alert-circle", "arrow-left", "camera", "check", "chevron-right", "clock",
  "edit", "edit-3", "file", "file-text", "inbox", "info", "lock", "log-in",
  "log-out", "map", "map-pin", "message-square", "navigation", "play", "plus",
  "search", "send", "shield", "tag", "trash-2", "user", "user-plus", "users", "x",
];

const SIZES = [
  { suffix: "", scale: 1 },
  { suffix: "@2x", scale: 2 },
  { suffix: "@3x", scale: 3 },
];
const BASE = 64;

function mdiSvgPath(name) {
  return path.resolve(
    __dirname, "..", "node_modules", "@mdi", "svg", "svg", `${name}.svg`
  );
}

async function renderToPngs(svg, prefix, family) {
  for (const { suffix, scale } of SIZES) {
    const px = BASE * scale;
    const out = path.join(OUT_DIR, `${family}-${prefix}${suffix}.png`);
    await sharp(Buffer.from(svg))
      .resize(px, px, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toFile(out);
  }
}

(async () => {
  let count = 0;
  for (const name of MCI_NAMES) {
    const file = mdiSvgPath(name);
    if (!fs.existsSync(file)) {
      console.error("MDI missing:", name);
      continue;
    }
    let svg = fs.readFileSync(file, "utf8");
    svg = svg.replace(/fill="[^"]*"/g, 'fill="#000000"');
    if (!/fill=/.test(svg)) {
      svg = svg.replace(/<svg /, '<svg fill="#000000" ');
    }
    await renderToPngs(svg, name, "mci");
    count++;
  }
  for (const name of FEATHER_NAMES) {
    const icon = feather.icons[name];
    if (!icon) {
      console.error("Feather missing:", name);
      continue;
    }
    const svg = icon.toSvg({
      width: 64, height: 64, color: "#000000", "stroke-width": 2,
    });
    await renderToPngs(svg, name, "feather");
    count++;
  }
  console.log(`Generated PNGs for ${count} icons (3 sizes each) into ${OUT_DIR}`);
})();
