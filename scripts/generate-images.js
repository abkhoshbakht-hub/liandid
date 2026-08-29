const fs = require('fs');
const path = require('path');

const DIR = path.join(__dirname, '..', 'public', 'news-images');
if (!fs.existsSync(DIR)) fs.mkdirSync(DIR, { recursive: true });

const categories = {
  refinery:      { label: 'نفت و انرژی',     icon: '⛽', colors: ['#0f2027','#203a43','#2c5364'] },
  petrochemical: { label: 'پتروشیمی',        icon: '🏭', colors: ['#1a2a6c','#b21f1f','#fdbb2d'] },
  cargo:         { label: 'بنادر و کشتیرانی', icon: '🚢', colors: ['#0f0c29','#302b63','#24243e'] },
  building:      { label: 'مسکن و ساختمان',   icon: '🏗️', colors: ['#2c3e50','#3498db'] },
  ship:          { label: 'دریا و کشتی',      icon: '⚓', colors: ['#134e5e','#71b280'] },
  meeting:       { label: 'جلسات',            icon: '🤝', colors: ['#1B365D','#2E5090'] },
  handshake:     { label: 'همکاری',           icon: '🤝', colors: ['#1B365D','#C9A96E'] },
  parliament:    { label: 'مجلس',            icon: '🏛️', colors: ['#1B365D','#0a1628'] },
  food_festival: { label: 'جشنواره غذا',     icon: '🍽️', colors: ['#e65c00','#f9d423'] },
  hospital:      { label: 'بیمارستان',        icon: '🏥', colors: ['#00b4db','#0083b0'] },
  volunteer:     { label: 'امداد',            icon: '🤲', colors: ['#e65c00','#f9d423'] },
  social:        { label: 'اجتماعی',          icon: '👥', colors: ['#e65c00','#f9d423'] },
  walking:       { label: 'ورزش همگانی',      icon: '🚶', colors: ['#11998e','#38ef7d'] },
  coding:        { label: 'برنامه‌نویسی',     icon: '💻', colors: ['#0f2027','#203a43','#2c5364'] },
  network:       { label: 'شبکه',             icon: '🌐', colors: ['#0f2027','#203a43','#2c5364'] },
  app:           { label: 'اپلیکیشن',        icon: '📱', colors: ['#0f2027','#203a43','#2c5364'] },
  football:      { label: 'فوتبال',           icon: '⚽', colors: ['#134e5e','#71b280'] },
  sailing:       { label: 'قایقرانی',         icon: '⛵', colors: ['#134e5e','#71b280'] },
  wrestling:     { label: 'کشتی',             icon: '🤼', colors: ['#134e5e','#71b280'] },
  stadium:       { label: 'ورزشگاه',          icon: '🏟️', colors: ['#134e5e','#71b280'] },
  market_old:    { label: 'بازار قدیم',       icon: '🏪', colors: ['#3e2723','#795548'] },
  music:         { label: 'موسیقی',           icon: '🎵', colors: ['#6a11cb','#2575fc'] },
  museum:        { label: 'موزه',             icon: '🏛️', colors: ['#3e2723','#795548'] },
  book:          { label: 'کتاب',             icon: '📚', colors: ['#3e2723','#795548'] },
  marine:        { label: 'علوم دریایی',      icon: '🐠', colors: ['#00b4db','#0083b0'] },
  lab:           { label: 'آزمایشگاه',        icon: '🔬', colors: ['#6a11cb','#2575fc'] },
  fish:          { label: 'شیلات',            icon: '🐟', colors: ['#00b4db','#0083b0'] },
  highway:       { label: 'بزرگراه',          icon: '🛣️', colors: ['#2c3e50','#3498db'] },
  water:         { label: 'آب',               icon: '💧', colors: ['#00b4db','#0083b0'] },
  energy_solar:  { label: 'انرژی خورشیدی',   icon: '☀️', colors: ['#f12711','#f5af19'] },
  urban:         { label: 'شهر',              icon: '🏙️', colors: ['#2c3e50','#3498db'] },
  default:       { label: 'لیان دید',         icon: '📰', colors: ['#1B365D','#0a1628'] },
};

Object.entries(categories).forEach(([key, { label, icon, colors }]) => {
  const gradientStops = colors.map((c, i) => {
    const offset = Math.round((i / (colors.length - 1)) * 100);
    return `<stop offset="${offset}%" stop-color="${c}"/>`;
  }).join('');

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500" viewBox="0 0 800 500">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      ${gradientStops}
    </linearGradient>
  </defs>
  <rect width="800" height="500" fill="url(#bg)"/>
  <text x="400" y="230" text-anchor="middle" font-size="80" fill="rgba(255,255,255,0.15)">${icon}</text>
  <text x="400" y="300" text-anchor="middle" font-family="Arial,sans-serif" font-size="28" font-weight="bold" fill="rgba(255,255,255,0.4)">${label}</text>
  <text x="400" y="340" text-anchor="middle" font-family="Arial,sans-serif" font-size="14" fill="rgba(255,255,255,0.2)">liandid.ir</text>
</svg>`;

  fs.writeFileSync(path.join(DIR, `${key}.svg`), svg);
  console.log(`✅ ${key}.svg`);
});

console.log(`\n${Object.keys(categories).length} images created!`);
