const fs = require('fs');
const https = require('https');

const urls = {
    photography: ['https://images.pexels.com/photos/1769279/pexels-photo-1769279.jpeg?auto=compress&cs=tinysrgb&w=800', 'https://images.pexels.com/photos/2253870/pexels-photo-2253870.jpeg?auto=compress&cs=tinysrgb&w=800', 'https://images.pexels.com/photos/3379966/pexels-photo-3379966.jpeg?auto=compress&cs=tinysrgb&w=800'],
    videography: ['https://images.pexels.com/photos/3052243/pexels-photo-3052243.jpeg?auto=compress&cs=tinysrgb&w=800', 'https://images.pexels.com/photos/3171837/pexels-photo-3171837.jpeg?auto=compress&cs=tinysrgb&w=800', 'https://images.pexels.com/photos/1308885/pexels-photo-1308885.jpeg?auto=compress&cs=tinysrgb&w=800'],
    catering: ['https://images.pexels.com/photos/331107/pexels-photo-331107.jpeg?auto=compress&cs=tinysrgb&w=800', 'https://images.pexels.com/photos/587741/pexels-photo-587741.jpeg?auto=compress&cs=tinysrgb&w=800', 'https://images.pexels.com/photos/103566/pexels-photo-103566.jpeg?auto=compress&cs=tinysrgb&w=800'],
    djmusic: ['https://images.pexels.com/photos/164745/pexels-photo-164745.jpeg?auto=compress&cs=tinysrgb&w=800', 'https://images.pexels.com/photos/3385732/pexels-photo-3385732.jpeg?auto=compress&cs=tinysrgb&w=800', 'https://images.pexels.com/photos/1047442/pexels-photo-1047442.jpeg?auto=compress&cs=tinysrgb&w=800'],
    venuebooking: ['https://images.pexels.com/photos/260689/pexels-photo-260689.jpeg?auto=compress&cs=tinysrgb&w=800', 'https://images.pexels.com/photos/8086034/pexels-photo-8086034.jpeg?auto=compress&cs=tinysrgb&w=800', 'https://images.pexels.com/photos/5638612/pexels-photo-5638612.jpeg?auto=compress&cs=tinysrgb&w=800'],
    makeupstyling: ['https://images.pexels.com/photos/3373739/pexels-photo-3373739.jpeg?auto=compress&cs=tinysrgb&w=800', 'https://images.pexels.com/photos/3993444/pexels-photo-3993444.jpeg?auto=compress&cs=tinysrgb&w=800', 'https://images.pexels.com/photos/457701/pexels-photo-457701.jpeg?auto=compress&cs=tinysrgb&w=800'],
    invitationcards: ['https://images.pexels.com/photos/1359307/pexels-photo-1359307.jpeg?auto=compress&cs=tinysrgb&w=800', 'https://images.pexels.com/photos/6393345/pexels-photo-6393345.jpeg?auto=compress&cs=tinysrgb&w=800', 'https://images.pexels.com/photos/3752516/pexels-photo-3752516.jpeg?auto=compress&cs=tinysrgb&w=800'],
    transportation: ['https://images.pexels.com/photos/1109002/pexels-photo-1109002.jpeg?auto=compress&cs=tinysrgb&w=800', 'https://images.pexels.com/photos/3785931/pexels-photo-3785931.jpeg?auto=compress&cs=tinysrgb&w=800', 'https://images.pexels.com/photos/250325/pexels-photo-250325.jpeg?auto=compress&cs=tinysrgb&w=800'],
    accommodation: ['https://images.pexels.com/photos/271618/pexels-photo-271618.jpeg?auto=compress&cs=tinysrgb&w=800', 'https://images.pexels.com/photos/164595/pexels-photo-164595.jpeg?auto=compress&cs=tinysrgb&w=800', 'https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg?auto=compress&cs=tinysrgb&w=800'],
    decoration: ['https://images.pexels.com/photos/2253870/pexels-photo-2253870.jpeg?auto=compress&cs=tinysrgb&w=800', 'https://images.pexels.com/photos/891823/pexels-photo-891823.jpeg?auto=compress&cs=tinysrgb&w=800', 'https://images.pexels.com/photos/4155554/pexels-photo-4155554.jpeg?auto=compress&cs=tinysrgb&w=800']
}

function processDownloads() {
    Object.entries(urls).forEach(([k, u]) => {
        const dir = 'public/services/' + k;
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

        u.forEach((l, i) => {
            const filepath = dir + '/' + (i + 1) + '.jpg';

            https.get(l, (res) => {
                if (res.statusCode === 200) {
                    res.pipe(fs.createWriteStream(filepath)).on('finish', () => console.log('Downloaded', k, i + 1));
                } else if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                    https.get(res.headers.location, (redirectRes) => {
                        redirectRes.pipe(fs.createWriteStream(filepath)).on('finish', () => console.log('Downloaded Redirect', k, i + 1));
                    });
                }
            }).on('error', (e) => console.log('Error', k, e.message));
        });
    });
}
processDownloads();
