const CHANNEL_ID = "UCDq3VQueDylAXWcMd6WboDQ";

const ranks = [
  "Bronze",
  "Silver",
  "Gold",
  "Platinum",
  "Diamond",
  "Masters",
  "Grandmaster",
  "Champion"
];

const characters = [
  "Ana",
  "Anran",
  "Ashe",
  "Baptiste",
  "Bastion",
  "Brigitte",
  "Cassidy",
  "DVA",
  "Doomfist",
  "Echo",
  "Emre",
  "Freja",
  "Genji",
  "Hanzo",
  "Hazard",
  "Illari",
  "Junkerqueen",
  "Junkrat",
  "Juno",
  "Kiriko",
  "Lifeweaver",
  "Lucio",
  "Mauga",
  "Mei",
  "Mercy",
  "Mizuki",
  "Moira",
  "Orisa",
  "Pharah",
  "Ramattra",
  "Reaper",
  "Reinhardt",
  "Roadhog",
  "Sigma",
  "Sojourn",
  "Soldier",
  "Sombra",
  "Symmetra",
  "Torbjorn",
  "Tracer",
  "Vendetta",
  "Venture",
  "Widowmaker",
  "Winston",
  "Wrecking Ball",
  "Wuyang",
  "Zarya",
  "Zenyatta"
];

const grid = document.getElementById("grid");

//API Grabs every upload from Spilo's channel

async function getUploadsPlaylistId() {

  const url =
    `https://www.googleapis.com/youtube/v3/channels?part=contentDetails&id=${CHANNEL_ID}&key=${API_KEY}`;

  const res = await fetch(url);
  const data = await res.json();

  return data.items[0].contentDetails.relatedPlaylists.uploads;
}

//API Grabs video title, thumbnail and ID

async function fetchAllVideos(playlistId) {

  let pageToken = "";
  const videos = [];

  do {
    const url =
      `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=${playlistId}&key=${API_KEY}` +
      (pageToken ? `&pageToken=${pageToken}` : "");

    const res = await fetch(url);
    const data = await res.json();

    data.items.forEach(item => {

      const snippet = item.snippet;

      videos.push({

        title: snippet.title,
        thumb: snippet.thumbnails.medium.url,
        id: snippet.resourceId.videoId
      });
    });

    pageToken = data.nextPageToken;
  } while (pageToken);

  return videos;
}

//Title format: Rank Character Coaching

function parseTitle(title) {

  let foundRank = "Unknown";
  let foundCharacter = "Unknown";

  ranks.forEach(rank =>{
    if (title.includes(rank)) {
      foundRank = rank;
    }
  });

  characters.forEach(character =>{

    if (title.includes(character)) {
      foundCharacter = character
    }
  });

  return {
    rank: foundRank,
    character: foundCharacter
  };
}

//Places videos into grid (also known as rendering, stupid)

function renderVideos(videos) {

  videos.forEach(video => {

    const parsed = parseTitle(video.title);

    const a = document.createElement("a");
    a.className = "video";

    a.dataset.character = parsed.character;
    a.dataset.rank = parsed.rank;

    a.href = `https://www.youtube.com/watch?v=${video.id}`;
    a.target = "_blank";

    const img = document.createElement("img");
    img.src = video.thumb;

    const title = document.createElement("p");
    title.textContent = video.title;

    a.appendChild(img);
    a.appendChild(title);
    grid.appendChild(a);
  });
}

async function init() {

  const uploadsId = await getUploadsPlaylistId();
  const videos = await fetchAllVideos(uploadsId);

  renderVideos(videos);
}

init();

function filterVideos(){

  const rank = document.getElementById('rankDropDown').value;
  const character = document.getElementById('characterDropDown').value;

  const videos = document.querySelectorAll('.video');

  videos.forEach(v => {

    const matchCharacter = !character || v.dataset.character === character;
    const matchRank = !rank || v.dataset.rank === rank;

    v.style.display = (matchCharacter && matchRank)

      ? ''
      : 'none';
  });
}

document.getElementById('characterDropDown').addEventListener('input',filterVideos);

document.getElementById('rankDropDown').addEventListener('input', filterVideos);
