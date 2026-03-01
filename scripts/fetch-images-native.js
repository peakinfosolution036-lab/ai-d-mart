const fs = require('fs');
const path = require('path');
const https = require('https');

const services = {
    "photography": "indian wedding photography portfolio realistic",
    "videography": "indian wedding videography cinematic realistic",
    "catering": "indian wedding catering food display realistic",
    "decoration": "indian wedding stage decoration design realistic",
    "djmusic": "wedding dj setup lights realistic",
    "venuebooking": "luxury event banquet hall realistic",
    "makeupstyling": "indian bridal makeup look realistic",
    "invitationcards": "indian wedding invitation cards design realistic",
    "transportation": "luxury wedding vintage car decoration realistic",
    "accommodation": "luxury hotel suite interior view realistic"
};

const BASE_DIR = path.join(__dirname, '..', 'public', 'services');

function downloadImage(url, filepath) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                return downloadImage(res.headers.location, filepath).then(resolve).catch(reject);
            }
            if (res.statusCode !== 200) {
                reject(new Error(`Failed to download, status: ${res.statusCode}`));
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
    if (!fs.existsSync(BASE_DIR)) {
        fs.mkdirSync(BASE_DIR, { recursive: true });
    }

    for (const [service, query] of Object.entries(services)) {
        const serviceDir = path.join(BASE_DIR, service);
        if (!fs.existsSync(serviceDir)) {
            fs.mkdirSync(serviceDir, { recursive: true });
        }

        console.log(`Getting images for ${service}...`);

        for (let i = 1; i <= 3; i++) {
            const filepath = path.join(serviceDir, `${i}.jpg`);
            // Pollinations generates random high quality realistic AI images
            const prompt = encodeURIComponent(`${query} high quality photo variation ${i}`);
            // Force pollinations to bypass rate limits by adding a random seed
            const url = `https://image.pollinations.ai/prompt/${prompt}?width=800&height=600&seed=${Math.floor(Math.random() * 100000)}&nologo=true`;

            try {
                console.log(`  Downloading image ${i}...`);
                await downloadImage(url, filepath);
            } catch (e) {
                console.error(`  Failed: ${e.message}`);
            }
        }
    }
    console.log("Done downloading all realistic category images!");
}

main();
