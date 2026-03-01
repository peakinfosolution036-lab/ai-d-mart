const fs = require('fs');
const path = require('path');
const https = require('https');

const services = {
    "photography": "wedding+photography",
    "videography": "wedding+videography",
    "catering": "wedding+catering+food",
    "decoration": "wedding+stage+decoration",
    "djmusic": "wedding+dj+setup",
    "venuebooking": "wedding+venue",
    "makeupstyling": "bridal+makeup",
    "invitationcards": "wedding+invitation+cards",
    "transportation": "wedding+vintage+car",
    "accommodation": "luxury+hotel+room"
};

const BASE_DIR = path.join(__dirname, '..', 'public', 'services');

function downloadImage(url, filepath) {
    return new Promise((resolve, reject) => {
        https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
            if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                return downloadImage(res.headers.location, filepath).then(resolve).catch(reject);
            }
            if (res.statusCode !== 200) {
                reject(new Error(`Status: ${res.statusCode}`));
                return;
            }
            const file = fs.createWriteStream(filepath);
            res.pipe(file);
            file.on('finish', () => { file.close(); resolve(); });
            file.on('error', (err) => { fs.unlink(filepath, () => { }); reject(err); });
        }).on('error', reject);
    });
}

function searchPexels(query) {
    return new Promise((resolve) => {
        https.get(`https://www.pexels.com/search/${query}/`, {
            headers: {
                'User-Agent': "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5'
            }
        }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                const regex = /https:\/\/images\.pexels\.com\/photos\/\d+\/pexels-photo-\d+\.jpeg\?auto=compress&cs=tinysrgb&w=\d+/g;
                let matches = [...new Set(data.match(regex) || [])];
                resolve(matches);
            });
        }).on('error', () => resolve([]));
    });
}

function searchPixabay(query) {
    return new Promise((resolve) => {
        https.get(`https://pixabay.com/images/search/${query}/`, {
            headers: {
                'User-Agent': "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
            }
        }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                const regex = /https:\/\/cdn\.pixabay\.com\/photo\/\d{4}\/\d{2}\/\d{2}\/\d{2}\/\d{2}\/[a-z0-9\-]+_\d+\.jpg/g;
                let matches = [...new Set(data.match(regex) || [])];
                resolve(matches);
            });
        }).on('error', () => resolve([]));
    });
}

async function main() {
    if (!fs.existsSync(BASE_DIR)) fs.mkdirSync(BASE_DIR, { recursive: true });

    for (const [service, query] of Object.entries(services)) {
        const serviceDir = path.join(BASE_DIR, service);
        if (!fs.existsSync(serviceDir)) fs.mkdirSync(serviceDir, { recursive: true });

        console.log(`Getting images for ${service}...`);

        // Try Pexels first
        let images = await searchPexels(query);

        // If not enough, try Pixabay
        if (images.length < 3) {
            console.log(" Falling back to Pixabay...");
            let pixabayImgs = await searchPixabay(query);
            images = [...images, ...pixabayImgs];
        }

        // Add some fallbacks just in case
        let fallbacks = [
            `https://source.unsplash.com/800x600/?${query},event`,
            `https://source.unsplash.com/800x600/?${query},wedding`,
            `https://source.unsplash.com/800x600/?${query},celebration`,
            `https://source.unsplash.com/800x600/?${query},party`,
            `https://source.unsplash.com/800x600/?${query},luxury`
        ];

        let count = 0;
        let attempt = 0;

        // Use realistic high quality sources
        let allSources = [...new Set([...images.map(u => u.replace(/w=\d+/, 'w=800')), ...fallbacks])];

        while (count < 3 && attempt < allSources.length) {
            const filepath = path.join(serviceDir, `${count + 1}.jpg`);
            if (fs.existsSync(filepath)) {
                count++;
                attempt++;
                continue;
            }

            try {
                console.log(`  Downloading image ${count + 1}...`);
                await downloadImage(allSources[attempt], filepath);
                count++;
            } catch (e) {
                console.log(`  Failed: ${e.message}`);
            }
            attempt++;
        }

        // If still missing images, use dicebear initials as absolute fallback so UI doesn't break
        while (count < 3) {
            const filepath = path.join(serviceDir, `${count + 1}.jpg`);
            console.log(`  Using placeholder for image ${count + 1}`);
            await downloadImage(`https://api.dicebear.com/7.x/initials/svg?seed=${service}${count}&backgroundColor=00703C&textColor=ffffff`, filepath.replace('.jpg', '.svg'));
            // Just copy it as jpg so frontend doesn't need to change file extension
            fs.copyFileSync(filepath.replace('.jpg', '.svg'), filepath);
            count++;
        }
    }
    console.log("Done generating folder images!");
}

main();
