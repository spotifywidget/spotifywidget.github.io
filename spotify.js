const clientId = '92b44cefd3ab4a018c6820f66f1cdfe7';
const redirectUri = 'http://localhost/SpotifyWidget/index.html';
const responseType = 'token';
const scope = 'user-read-currently-playing';

function login() {
    const authUrl = 'https://accounts.spotify.com/authorize' +
        '?client_id=' + encodeURIComponent(clientId) +
        '&redirect_uri=' + encodeURIComponent(redirectUri) +
        '&response_type=' + encodeURIComponent(responseType) +
        '&scope=' + encodeURIComponent(scope);
    window.location.href = authUrl;
}

function getAccessToken() {
    const hash = window.location.hash.substr(1);
    const accessTokenObj = hash.split('&').reduce((acc, keyValue) => {
        const [key, value] = keyValue.split('=');
        acc[key] = value;
        return acc;
    }, {});
    return accessTokenObj.access_token;
}

function getCurrentPlayingTrack(accessToken) {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', 'https://api.spotify.com/v1/me/player/currently-playing', true);
        xhr.setRequestHeader('Authorization', 'Bearer ' + accessToken);
        xhr.onreadystatechange = function() {
            if (xhr.readyState === XMLHttpRequest.DONE) {
                if (xhr.status === 200) {
                    resolve(JSON.parse(xhr.responseText));
                } else {
                    reject(new Error('Erreur lors de la récupération de la musique en cours: ' + xhr.statusText));
                }
            }
        };
        xhr.send();
    });
}

async function displayCurrentPlayingTrack() {
    try {
        const accessToken = getAccessToken();
        if (accessToken) {
            const data = await getCurrentPlayingTrack(accessToken);
            const currentTrack = data.item;
            if (currentTrack) {
                const imageUrl = currentTrack.album.images.reduce((smallestImage, image) => {
                    if (!smallestImage || image.width < smallestImage.width) {
                        return image;
                    }
                    return smallestImage;
                }, null).url;

                const mainArtist = currentTrack.artists[0].name;
                const durationMs = currentTrack.duration_ms;
                const durationMinSec = new Date(durationMs).toISOString().substr(14, 5);
                const progressMs = data.progress_ms;
                const progressMinSec = new Date(progressMs).toISOString().substr(14, 5);

                document.getElementById('spotify-song-name').innerHTML = currentTrack.name;
                document.getElementById('spotify-song-author').innerHTML = mainArtist;
                document.getElementById('spotify-progress-lbl-current').innerHTML = progressMinSec;
                document.getElementById('spotify-progress-lbl-max').innerHTML = durationMinSec;
                document.getElementById('spotify-song-cover').style.backgroundImage = 'url(\'' + imageUrl + '\')';
            
                min_width = 200;
                document.getElementById('spotify-progress-bar-current').style.width = ((progressMs/durationMs) * 100) + '%';
                
                widget_width = document.getElementById('spotify-container').offsetWidth;
                window.electron.ipcRenderer.send('resizeWindow', widget_width);
            } else {
                console.log('Aucune musique en cours de lecture.');
            }
        } else {
            console.error('Erreur: access_token non disponible.');
            login();
        }
    } catch (error) {
        console.error('Erreur:', error.message);
    }
}

setInterval(displayCurrentPlayingTrack, 1000);