require("dotenv").config();

const axios = require("axios");
const clientId = process.env.spotify_clientid; // Replace with your Spotify Client ID
const clientSecret = process.env.spotify_clientsecret; // Replace with your Spotify Client Secret
const artistId = "29kkCKKGXheHuoO829FxWK"; // Replace with the desired artist's Spotify ID

// Function to get access token from Spotify
async function getAccessToken() {
	const tokenUrl = "https://accounts.spotify.com/api/token";
	const response = await axios.post(
		tokenUrl,
		new URLSearchParams({
			grant_type: "client_credentials",
		}),
		{
			headers: {
				Authorization:
					"Basic " +
					Buffer.from(`${clientId}:${clientSecret}`).toString(
						"base64"
					),
				"Content-Type": "application/x-www-form-urlencoded",
			},
		}
	);
	return response.data.access_token;
}

// Function to fetch all tracks by artist ID
async function getArtistTracks(accessToken, artistId) {
	const artistAlbumsUrl = `https://api.spotify.com/v1/artists/${artistId}/albums`;
	const response = await axios.get(artistAlbumsUrl, {
		headers: {
			Authorization: `Bearer ${accessToken}`,
		},
		params: {
			include_groups: "album,single", // Fetch albums and singles only
			limit: 50, // Max limit
		},
	});

	const albums = response.data.items;
	let tracks = [];

	for (const album of albums) {
		const albumTracksUrl = `https://api.spotify.com/v1/albums/${album.id}/tracks`;
		const albumTracksResponse = await axios.get(albumTracksUrl, {
			headers: {
				Authorization: `Bearer ${accessToken}`,
			},
		});

		tracks.push({
			title: album.name,
			url: album.external_urls.spotify,
		});
		albumTracksResponse.data.items.forEach((track) => {
			tracks.push({
				title: track.name,
				url: track.external_urls.spotify,
				Album: album.name,
			});
		});
	}
	return tracks;
}

// Main function to fetch songs and output them in the desired format
async function fetchSongs() {
	try {
		const accessToken = await getAccessToken();
		const tracks = await getArtistTracks(accessToken, artistId);
		console.log(tracks);
		console.log(tracks.length);
	} catch (error) {
		console.error("Error fetching data:", error.message);
	}
}

// Execute the main function
fetchSongs();
