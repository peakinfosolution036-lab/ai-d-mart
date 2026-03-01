const fs = require('fs');
const path = require('path');
const https = require('https');

const services = {
    "Photography": "wedding-photography",
    "Videography": "wedding-videographer",
    "Catering": "wedding-catering",
    "Decoration": "wedding-stage-decoration",
    "DJ & Music": "wedding-dj",
    "Venue Booking": "wedding-venue",
    "Makeup & Styling": "bridal-makeup",
    "Invitation Cards": "wedding-invitation",
    "Transportation": "wedding-car",
    "Accommodation": "luxury-hotel-room"
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

function fetchUnsplashSearch(query) {
    return new Promise((resolve, reject) => {
        https.get(`https://unsplash.com/s/photos/${query}`, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve(data));
        }).on('error', reject);
    });
}

async function main() {
    if (!fs.existsSync(BASE_DIR)) {
        fs.mkdirSync(BASE_DIR, { recursive: true });
    }

    for (const [service, query] of Object.entries(services)) {
        const serviceDir = Object.values(services).find(q => q === query) || service.replace(/[^a-zA-Z]/g, '').toLowerCase();
        // create service folder name using exact service name to make it easy to fetch
        const folderName = service.replace(/[^a-zA-Z]/g, '').toLowerCase();
        const dirPath = path.join(BASE_DIR, folderName);

        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
        }

        console.log(`Scraping Unsplash for ${service} (${query})...`);
        try {
            const html = await fetchUnsplashSearch(query);
            // Match unsplash photo URLs
            const regex = /https:\/\/images\.unsplash\.com\/photo-[a-zA-Z0-9\-]+/g;
            let matches = [...new Set(html.match(regex) || [])];

            // Filter out common profile/avatar images often mixed in
            matches = matches.filter(url => !url.includes('profile') && url.length > 50);

            if (matches.length > 0) {
                let count = 0;
                for (let i = 0; i < matches.length && count < 3; i++) {
                    const imgUrl = `${matches[i]}?w=600&h=400&fit=crop&q=80`;
                    const filepath = path.join(dirPath, `${count + 1}.jpg`);
                    if (!fs.existsSync(filepath)) {
                        console.log(`   Downloading image ${count + 1}...`);
                        try {
                            await downloadImage(imgUrl, filepath);
                            count++;
                        } catch (e) {
                            console.log(`   Failed ${imgUrl}, trying next...`);
                        }
                    } else {
                        console.log(`   Image ${count + 1} exists.`);
                        count++;
                    }
                }
            } else {
                console.log(`   No images found for ${service}.`);
            }
        } catch (e) {
            console.error(`   Error scraping ${service}:`, e.message);
        }
    }
    console.log("Finished generating real images!");
}

main();
