const fs = require('fs');
const path = require('path');
const https = require('https');

const services = {
    "Photography": [
        "Professional indian wedding photography couple portrait hd",
        "Camera lens event photography candid high quality",
        "Pre wedding photoshoot romantic couple sunset"
    ],
    "Videography": [
        "Professional videographer filming an event cinematic camera",
        "Drone shot cinematic indian wedding video setup",
        "Professional film crew recording a live event"
    ],
    "Catering": [
        "Delicious indian wedding buffet food display",
        "Gourmet food catering setup fine dining events",
        "Waiters serving appetizers at a high-end corporate event"
    ],
    "Decoration": [
        "Beautiful floral stage decoration for indian wedding",
        "Elegant event table setup with centerpieces and lighting",
        "Luxury wedding reception decoration stage lights"
    ],
    "DJ & Music": [
        "Professional DJ setup playing music at an event party lights",
        "Live music band performing at a wedding reception",
        "Turntables mixing board club event music"
    ],
    "Venue Booking": [
        "Luxury banquet hall empty ready for event",
        "Outdoor garden wedding venue setup chairs trees",
        "Grand hotel ballroom empty ready for conference"
    ],
    "Makeup & Styling": [
        "Professional makeup artist applying makeup to indian bride",
        "Bridal makeup cosmetics kit spread on a table",
        "Elegant hairstyling salon beauty preparation event"
    ],
    "Invitation Cards": [
        "Elegant invitation card with floral patterns and gold foil on table",
        "Stack of premium wedding invitations with envelopes",
        "Person writing beautiful calligraphy on an invitation"
    ],
    "Transportation": [
        "Luxury vintage car decorated with flowers for wedding",
        "Fleet of black sedans for corporate event transportation",
        "White limousine parked outside event venue"
    ],
    "Accommodation": [
        "Luxury hotel resort room with beautiful view",
        "Premium hotel lobby checkin desk",
        "Comfortable suite bedroom elegant decor"
    ]
};

const BASE_DIR = path.join(__dirname, '..', 'public', 'services');

async function downloadImage(url, filepath) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            // Handle redirects if pollinations redirects
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
        }).on('error', (err) => {
            reject(err);
        });
    });
}

async function main() {
    if (!fs.existsSync(BASE_DIR)) {
        fs.mkdirSync(BASE_DIR, { recursive: true });
    }

    for (const [service, prompts] of Object.entries(services)) {
        const serviceDir = path.join(BASE_DIR, service.replace(/[^a-zA-Z]/g, '').toLowerCase());
        if (!fs.existsSync(serviceDir)) {
            fs.mkdirSync(serviceDir, { recursive: true });
        }

        console.log(`Generating images for ${service}...`);
        for (let i = 0; i < prompts.length; i++) {
            const filepath = path.join(serviceDir, `${i + 1}.jpg`);
            // If file exists, skip
            if (fs.existsSync(filepath)) {
                console.log(`- Image ${i + 1} already exists.`);
                continue;
            }

            const prompt = encodeURIComponent(prompts[i]);
            const url = `https://image.pollinations.ai/prompt/${prompt}?width=400&height=400&nologo=true&seed=${Math.floor(Math.random() * 1000)}`;

            try {
                await downloadImage(url, filepath);
                console.log(`- Downloaded image ${i + 1} for ${service}`);
            } catch (e) {
                console.error(`- Failed to download image ${i + 1} for ${service}:`, e.message);
                // Retry once
                try {
                    await downloadImage(url, filepath);
                } catch (fallbackErr) { }
            }
        }
    }
}

main().catch(console.error);
