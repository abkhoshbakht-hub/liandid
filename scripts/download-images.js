const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

const DIR = path.join(__dirname, '..', 'public', 'news-images');

const IMAGES = {
  refinery: 'photo-1585771724684-38269d6639fd',
  petrochemical: 'photo-1518709766631-a6a7f45921c3',
  cargo: 'photo-1578575437130-527eed3abbec',
  building: 'photo-1486406146926-c627a92ad1ab',
  ship: 'photo-1605745341112-85968b19335b',
  meeting: 'photo-1552664730-d307ca884978',
  handshake: 'photo-1521791136064-7986c2920216',
  parliament: 'photo-1541872703-74c5e44368f9',
  food_festival: 'photo-1555939594-58d7cb561ad1',
  hospital: 'photo-1519494026892-80bbd2d6fd0d',
  volunteer: 'photo-1559027615-cd4628902d4a',
  social: 'photo-1517048676732-d65bc937f952',
  walking: 'photo-1571019613454-1cb2f99b2d8b',
  coding: 'photo-1461749280684-dccba630e2f6',
  network: 'photo-1558494949-ef010cbdcc31',
  app: 'photo-1512941937669-90a1b58e7e9c',
  football: 'photo-1431324155629-1a6deb1dec8d',
  sailing: 'photo-1534224039826-c7a0eda0e6b3',
  wrestling: 'photo-1549719386-74dfcbf7dbed',
  stadium: 'photo-1431324155629-1a6deb1dec8d',
  market_old: 'photo-1555396273-367ea4eb4db5',
  music: 'photo-1511379938547-c1f69419868d',
  museum: 'photo-1554907984-15263bfd63bd',
  book: 'photo-1524995997946-a1c2e315a42f',
  marine: 'photo-1544551763-46a013bb70d5',
  lab: 'photo-1532187863486-abf9dbad1b69',
  fish: 'photo-1544551763-7793216df788',
  highway: 'photo-1545579133-99bb5ab189bd',
  water: 'photo-1470071459604-3b5ec3a7fe05',
  energy_solar: 'photo-1509391366360-2e959784a276',
  urban: 'photo-1449824913935-59a10b8d2000',
};

function download(key, id) {
  return new Promise((resolve, reject) => {
    const url = `https://images.unsplash.com/${id}?w=800&q=80&auto=format`;
    const filePath = path.join(DIR, `${key}.jpg`);
    if (fs.existsSync(filePath)) { resolve(); return; }
    
    const file = fs.createWriteStream(filePath);
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        http.get(res.headers.location, (res2) => {
          res2.pipe(file);
          file.on('finish', () => { file.close(); console.log(`✅ ${key}`); resolve(); });
        }).on('error', reject);
      } else {
        res.pipe(file);
        file.on('finish', () => { file.close(); console.log(`✅ ${key}`); resolve(); });
      }
    }).on('error', (e) => { 
      fs.unlink(filePath, () => {});
      console.log(`❌ ${key}: ${e.message}`); 
      resolve();
    });
  });
}

async function main() {
  if (!fs.existsSync(DIR)) fs.mkdirSync(DIR, { recursive: true });
  
  const entries = Object.entries(IMAGES);
  console.log(`Downloading ${entries.length} images...`);
  
  // Download 3 at a time
  for (let i = 0; i < entries.length; i += 3) {
    const batch = entries.slice(i, i + 3);
    await Promise.all(batch.map(([k, v]) => download(k, v)));
  }
  
  console.log('Done!');
}

main();
