const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const services = {
    "photography": "indian wedding photography portfolio",
    "videography": "indian wedding videography cinematic",
    "catering": "indian wedding catering food display",
    "decoration": "indian wedding stage decoration design",
    "djmusic": "wedding dj setup lights",
    "venuebooking": "luxury event banquet hall",
    "makeupstyling": "indian bridal makeup look",
    "invitationcards": "indian wedding invitation cards design",
    "transportation": "luxury wedding vintage car decoration",
    "accommodation": "luxury hotel suite interior view"
};

const BASE_DIR = path.join(__dirname, '..', 'public', 'services');

async function downloadImage(url, filepath) {
    try {
        const response = await axios({
            url,
            method: 'GET',
            responseType: 'stream',
            headers: {
                'User-Agent': "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36"
            }
        });

        return new Promise((resolve, reject) => {
            const writer = fs.createWriteStream(filepath);
            response.data.pipe(writer);
            writer.on('finish', resolve);
            writer.on('error', reject);
        });
    } catch (error) {
        throw new Error(`Failed to download ${url}: ${error.message}`);
    }
}

async function searchGoogleImages(query) {
    try {
        // Search duckduckgo html since google blocks headless/api easily without auth
        const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query + ' high quality HD')}`;
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });

        // We scrape pixabay/pexels direct search as fallback since it's cleaner and free images
        const pexelsUrl = `https://www.pexels.com/search/${encodeURIComponent(query)}/`;
        const fallbackResponse = await axios.get(pexelsUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0'
            }
        });

        // Quick regex to find image urls
        const imgRegex = /https:\/\/images\.pexels\.com\/photos\/\d+\/pexels-photo-\d+\.jpeg\?auto=compress&cs=tinysrgb&w=\d+/g;
        const matches = fallbackResponse.data.match(imgRegex);

        if (matches && matches.length > 0) {
            return [...new Set(matches)].slice(0, 3).map(url => url.replace(/w=\d+/, 'w=800&h=600&fit=crop'));
        }

        return [];
    } catch (error) {
        console.error(`Search failed for ${query}`);
        return [];
    }
}

// Fallback search using unsplash API source (un-rate limited random endpoint)
async function getUnsplashRandom(query) {
    return [
        `https://source.unsplash.com/800x600/?${encodeURIComponent(query)},event`,
        `https://source.unsplash.com/800x600/?${encodeURIComponent(query)},wedding`,
        `https://source.unsplash.com/800x600/?${encodeURIComponent(query)},luxury`
    ]
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

        // Use an un-restricted Unsplash fallback since actual scraping can fail
        // We just download 3 random images for each category using a specific keyword
        const terms = query.split(' ');
        const mainTerm = terms[terms.length - 1]; // Use last term as it's usually the subject

        for (let i = 1; i <= 3; i++) {
            const filepath = path.join(serviceDir, `${i}.jpg`);
            const pexelsTerm = encodeURIComponent(`${mainTerm} wedding`);
            // Use a direct image downloading service (pollinations or placeimg) to guarantee images
            const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(query + ` realistic high quality photo variation ${i}`)}?width=800&height=600&seed=${Math.random() * 1000}&nologo=true`;

            try {
                console.log(`  Downloading image ${i}...`);
                await downloadImage(url, filepath);
            } catch (e) {
                console.error(`  Failed: ${e.message}`);
            }
        }
    }
    console.log("Done!");
}

main();
