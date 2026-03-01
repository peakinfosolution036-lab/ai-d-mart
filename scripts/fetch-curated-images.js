const fs = require('fs');
const path = require('path');
const https = require('https');

const services = {
    "photography": [
        "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800",
        "https://images.unsplash.com/photo-1520854221256-17451cc331bf?w=800",
        "https://images.unsplash.com/photo-1519741497674-611481863552?w=800"
    ],
    "videography": [
        "https://images.unsplash.com/photo-1579704603912-78ba7e70ea2d?w=800",
        "https://images.unsplash.com/photo-1606555139556-32d7a22ae9d9?w=800",
        "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=800"
    ],
    "catering": [
        "https://images.unsplash.com/photo-1555244162-803834f70033?w=800",
        "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=800",
        "https://images.unsplash.com/photo-1563514973347-19e91b5a51c4?w=800"
    ],
    "decoration": [
        "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800",
        "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800",
        "https://images.unsplash.com/photo-1507504031003-b417244a2b25?w=800"
    ],
    "djmusic": [
        "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800",
        "https://images.unsplash.com/photo-1545128485-c400e7702796?w=800",
        "https://images.unsplash.com/photo-1572591696045-814ae3acfd23?w=800"
    ],
    "venuebooking": [
        "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800",
        "https://images.unsplash.com/photo-1505362973752-6aed3554e2b0?w=800",
        "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=800"
    ],
    "makeupstyling": [
        "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=800",
        "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800",
        "https://images.unsplash.com/photo-1516975080661-46bdf36f3086?w=800"
    ],
    "invitationcards": [
        "https://images.unsplash.com/photo-1561726055-77ee62886f77?w=800",
        "https://images.unsplash.com/photo-1607198179219-cd8b835fdda9?w=800",
        "https://images.unsplash.com/photo-1601633512396-857140e6c1e1?w=800"
    ],
    "transportation": [
        "https://images.unsplash.com/photo-1518779836904-749e79435f37?w=800",
        "https://images.unsplash.com/photo-1582238466657-fc7ac712aada?w=800",
        "https://images.unsplash.com/photo-1536250965749-d3bd29ebffeb?w=800"
    ],
    "accommodation": [
        "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800",
        "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800",
        "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800"
    ]
};

const BASE_DIR = path.join(__dirname, '..', 'public', 'services');

function downloadImage(url, filepath) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                return downloadImage(res.headers.location, filepath).then(resolve).catch(reject);
            }
            if (res.statusCode !== 200) {
                reject(new Error(`Failed to download, status code: ${res.statusCode}`));
                return;
            }
            const file = fs.createWriteStream(filepath);
            res.pipe(file);
            file.on('finish', () => {
                file.close();
                resolve();
            });
            file.on('error', (err) => {
                fs.unlink(filepath, () => { });
                reject(err);
            });
        }).on('error', reject);
    });
}

async function main() {
    // Delete existing folder to start fresh
    if (fs.existsSync(BASE_DIR)) {
        fs.rmSync(BASE_DIR, { recursive: true, force: true });
    }
    fs.mkdirSync(BASE_DIR, { recursive: true });

    for (const [service, images] of Object.entries(services)) {
        const dirPath = path.join(BASE_DIR, service);
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
        }

        console.log(`Downloading curated images for ${service}...`);
        for (let i = 0; i < images.length; i++) {
            const filepath = path.join(dirPath, `${i + 1}.jpg`);
            await downloadImage(images[i], filepath);
            console.log(`   Downloaded ${i + 1}.jpg`);
        }
    }
    console.log("All 30 images downloaded perfectly!");
}

main();
