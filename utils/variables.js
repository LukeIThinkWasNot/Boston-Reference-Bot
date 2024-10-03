//
const randomBotMessages = [
	"BOSTON",
	"BEST BAND EVER",
	"SHUT UP, BOSTON WAS MENTIONED",
];

const bostonSongs = [
	{
		title: "Life, Love & Hope",
		url: "https://open.spotify.com/album/2rIbXgXvgoeWgwhjY6jkoo",
	},
	{
		title: "Heaven on Earth",
		url: "https://open.spotify.com/track/0foU3nnylSVkq1xYbg3H6D",
		Album: "Life, Love & Hope",
	},
	{
		title: "Didn't Mean to Fall in Love",
		url: "https://open.spotify.com/track/1GgnHfXXmRRnpfJ4ZXEskh",
		Album: "Life, Love & Hope",
	},
	{
		title: "Last Day of School",
		url: "https://open.spotify.com/track/77wRn640iIPc3w0FoBRzOn",
		Album: "Life, Love & Hope",
	},
	{
		title: "Sail Away",
		url: "https://open.spotify.com/track/2ilN7dzYuhkwM2ZBgHWYWD",
		Album: "Life, Love & Hope",
	},
	{
		title: "Life Love & Hope",
		url: "https://open.spotify.com/track/3RZLAaRLbcUFkdxrvbjDqH",
		Album: "Life, Love & Hope",
	},
	{
		title: "If You Were in Love",
		url: "https://open.spotify.com/track/4NYUtW0CR02kM4zoi8f0p1",
		Album: "Life, Love & Hope",
	},
	{
		title: "Someday",
		url: "https://open.spotify.com/track/6TEsq7njHAJzc0Motj2UNU",
		Album: "Life, Love & Hope",
	},
	{
		title: "Love Got Away",
		url: "https://open.spotify.com/track/1EvrsfT492XSS6hKEL80lJ",
		Album: "Life, Love & Hope",
	},
	{
		title: "Someone",
		url: "https://open.spotify.com/track/5Ci2QXiIyDoWbfYoJwQ8Fd",
		Album: "Life, Love & Hope",
	},
	{
		title: "You Gave up on Love",
		url: "https://open.spotify.com/track/1X27FISPpWiYMkax14g16C",
		Album: "Life, Love & Hope",
	},
	{
		title: "The Way You Look Tonight",
		url: "https://open.spotify.com/track/25nEgDYRKDVZeq95Eo5qCH",
		Album: "Life, Love & Hope",
	},
	{
		title: "Walk On",
		url: "https://open.spotify.com/album/5Dx1isIQWXqUNlkldbHyKX",
	},
	{
		title: "I Need Your Love",
		url: "https://open.spotify.com/track/4pFSfimXi2W4U7tmQsKkam",
		Album: "Walk On",
	},
	{
		title: "Surrender To Me",
		url: "https://open.spotify.com/track/2K3egGUWS7381sZbxDq9N7",
		Album: "Walk On",
	},
	{
		title: "Livin' For You",
		url: "https://open.spotify.com/track/1K7t1JuHFwaA6OchIYIvgY",
		Album: "Walk On",
	},
	{
		title: "Walkin' At Night",
		url: "https://open.spotify.com/track/39m4BsQuM0V8A6H1U1fymo",
		Album: "Walk On",
	},
	{
		title: "Walk On",
		url: "https://open.spotify.com/track/0lb9p9pJFI3ww5kJxTZibR",
		Album: "Walk On",
	},
	{
		title: "Get Organ-ized/Get Reorgan-ized",
		url: "https://open.spotify.com/track/60oy2goWsaoS6MdQr9XXYP",
		Album: "Walk On",
	},
	{
		title: "Walk On (Some More)",
		url: "https://open.spotify.com/track/47kduF4jZLlfGa8EgmjDW3",
		Album: "Walk On",
	},
	{
		title: "What's Your Name",
		url: "https://open.spotify.com/track/2jacXDzfIXhgjvpqReuNOU",
		Album: "Walk On",
	},
	{
		title: "Magdalene",
		url: "https://open.spotify.com/track/6UbzVRyt4c0TSjwIRUh7ce",
		Album: "Walk On",
	},
	{
		title: "We Can Make It",
		url: "https://open.spotify.com/track/2PRxj7bR8ANlTaBMn9zNPK",
		Album: "Walk On",
	},
	{
		title: "Third Stage",
		url: "https://open.spotify.com/album/3ZjhhUHc4jFc6ZOTchjXsv",
	},
	{
		title: "Amanda",
		url: "https://open.spotify.com/track/4gpext9x0CbdD9NWaa4nDj",
		Album: "Third Stage",
	},
	{
		title: "We're Ready",
		url: "https://open.spotify.com/track/33lj1WVboFiKGLBdxOzSAl",
		Album: "Third Stage",
	},
	{
		title: "The Launch A) Countdown B) Ignition C) Third Stage Separation",
		url: "https://open.spotify.com/track/38mSHlNQxJkjmLHCbES077",
		Album: "Third Stage",
	},
	{
		title: "Cool The Engines",
		url: "https://open.spotify.com/track/5xy6EutTYrw9HJZE2ZYWth",
		Album: "Third Stage",
	},
	{
		title: "My Destination",
		url: "https://open.spotify.com/track/0OHvio80Cimv37hUJbgU7a",
		Album: "Third Stage",
	},
	{
		title: "A New World",
		url: "https://open.spotify.com/track/21A2oTRuD9YMEFtiSn8WRK",
		Album: "Third Stage",
	},
	{
		title: "To Be A Man",
		url: "https://open.spotify.com/track/4HkxVCX6ocEDWqkE0BP1h0",
		Album: "Third Stage",
	},
	{
		title: "I Think I Like It",
		url: "https://open.spotify.com/track/0AkYLutYl7LC0iabvlrmpS",
		Album: "Third Stage",
	},
	{
		title: "Can'tcha Say / Still In Love",
		url: "https://open.spotify.com/track/7bMo7aljgbqpiOMSkwgkEN",
		Album: "Third Stage",
	},
	{
		title: "Still In Love",
		url: "https://open.spotify.com/track/7bMo7aljgbqpiOMSkwgkEN",
		Album: "Third Stage",
	},
	{
		title: "Hollyann",
		url: "https://open.spotify.com/track/5h3OrLvTXxE34EGGSR6t19",
		Album: "Third Stage",
	},
	{
		title: "Don't Look Back",
		url: "https://open.spotify.com/album/2bJalk1WMed8Z2CZca2zKp",
	},
	{
		title: "Don't Look Back",
		url: "https://open.spotify.com/track/4QySZtWymRGNgrwxZOODKF",
		Album: "Don't Look Back",
	},
	{
		title: "The Journey",
		url: "https://open.spotify.com/track/6YvEvzEhfUlAZ86Nc32yVr",
		Album: "Don't Look Back",
	},
	{
		title: "It's Easy",
		url: "https://open.spotify.com/track/0xwQD6xJYa5lbsJ8B3rtoK",
		Album: "Don't Look Back",
	},
	{
		title: "A Man I'll Never Be",
		url: "https://open.spotify.com/track/0bjKbwEvZfU5epyZ3aZm1y",
		Album: "Don't Look Back",
	},
	{
		title: "Feelin' Satisfied",
		url: "https://open.spotify.com/track/0yqIpi7zj74a0CRCedacOW",
		Album: "Don't Look Back",
	},
	{
		title: "Party",
		url: "https://open.spotify.com/track/3fEJ2l3vfqRzLiDb9JksJb",
		Album: "Don't Look Back",
	},
	{
		title: "Used to Bad News",
		url: "https://open.spotify.com/track/1u5oRu7MMTDhcQw4LWbfuc",
		Album: "Don't Look Back",
	},
	{
		title: "Don't Be Afraid",
		url: "https://open.spotify.com/track/01ADfl2dm3ev0a7qcZN1Ix",
		Album: "Don't Look Back",
	},
	{
		title: "Boston",
		url: "https://open.spotify.com/album/2QLp07RO6anZHmtcKTEvSC",
	},
	{
		title: "More Than a Feeling",
		url: "https://open.spotify.com/track/1QEEqeFIZktqIpPI4jSVSF",
		Album: "Boston",
	},
	{
		title: "Peace of Mind",
		url: "https://open.spotify.com/track/1GqlvSEtMx5xbGptxOTTyk",
		Album: "Boston",
	},
	{
		title: "Foreplay",
		url: "https://open.spotify.com/track/39C5FuZ8C8M0QI8CrMsPkR",
		Album: "Boston",
	},
	{
		title: "Long Time",
		url: "https://open.spotify.com/track/39C5FuZ8C8M0QI8CrMsPkR",
		Album: "Boston",
	},
	{
		title: "Rock & Roll Band",
		url: "https://open.spotify.com/track/5E89Izp4YhPyNShoxiOJ1u",
		Album: "Boston",
	},
	{
		title: "Smokin'",
		url: "https://open.spotify.com/track/5u5qlnyVaewWugJIjzilIc",
		Album: "Boston",
	},
	{
		title: "Hitch a Ride",
		url: "https://open.spotify.com/track/0870QNicMawQH2cnzBVZ3P",
		Album: "Boston",
	},
	{
		title: "Something About You",
		url: "https://open.spotify.com/track/1KxNmUInjFsoDFrLaTtpLZ",
		Album: "Boston",
	},
	{
		title: "Let Me Take You Home Tonight",
		url: "https://open.spotify.com/track/6485cn8SoHq6qPdmeQcw4x",
		Album: "Boston",
	},
	{
		title: "God Rest Ye Metal Gentlemen",
		url: "https://open.spotify.com/album/1HbDTEm9BhaImvEMmRVwsN",
	},
	{
		title: "God Rest Ye Metal Gentlemen",
		url: "https://open.spotify.com/track/50CtiaYTvDF0G8QyOu8kxr",
		Album: "God Rest Ye Metal Gentlemen",
	},
];

module.exports = {
	bostonSongs,
	randomBotMessages,
};
