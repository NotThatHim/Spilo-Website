/*
We like to avoid committing our API keys to the repository or just generally avoid sending them to anyone when possible.
For this project its not too big of a deal but good habit to get into. I would suggest using a .env file to store your
secrets (like API keys) locally and then you can import them here into your code. Ultimately its still going to be present
in the HTML build but since this isn't a published production project its fine. If you wanted to host this project, you
would probably want to look into something like Vite or even hosting a small JS server to help keep the key a secret.

For now, I would do the following:

1. Create a file called .env in the root on your project. It can be empty for now, or you can add "API_KEY=" (no quotes, don't add your key just yet)
2. In this script.jsfile, remove the text of the API key
3. Commit and push this new file to the repository.
4. Create a new file called .gitignore in the root of your project. Gitignore tells git to ignore certain files and not commit any changes to them to
    your repository. Go ahead and add the .env file to it by just writiing ".env" (no quotes) in the .gitignore file.
5. Now that you've told git to ignore the .env file, go ahead and add your API key to the .env file. It should look like "API_KEY=WHATEVERYOUKEYIS" (no quotes)
6. In this script.js file, you can use the API key from the .env file by calling window.env.API_KEY.

This is a simple way where you can still have your public repo but not have to share your API key with everyone. You can add
instructions for using the project to your README.md file that might include telling someone how to get their own API key
and adding it to the .env file themselves.
*/

const API_KEY = window.env.API_KEY;
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


  /*
  This is great! Nice and simple way of trying to find the rank and character for sorting the videos. Navi pointed out that
  you can make the search a little bit more flexible by using something called regex but I actually prefer using included
  methods in the lanaguage when possible because I find regex to be less readable.

  In your loop, you could do something like this to make your match case insensitive for example::

  ranks.forEach(rank =>{
    const formattedTitle = title.toLowerCase();
    const formattedRank = rank.toLowerCase();
    if (formattedTitle.includes(formattedRank)) {
      foundRank = rank;
    }
  });

  There are a few other things you could look to do to make the search more inclusive as well. How could you remove punctuation
  or spacing?
  */
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

  /*
  Extra credit:
  A number of coaching videos have multiple characters in the title. In your current implementation, what would happen in
  this scenario? Which character would the video be sorted into? How could you modify your code to assign the video to
  multiple characters if you would match on more than one? 
  */

  return {
    rank: foundRank,
    character: foundCharacter
  };
}

//Places videos into grid (also known as rendering, stupid)

/*
Nice! I bet you could re-use some of this logic to build dropdowns for the rank and character filters.
*/
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