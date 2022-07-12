require("dotenv").config();

const { App } = require("@slack/bolt");
const axios = require("axios");

/* -------------------------- Initialize Slack app -------------------------- */

const app = new App({
	token: process.env.SLACK_USER_TOKEN,
	signingSecret: process.env.SLACK_SIGNING_SECRET,
	socketMode: true,
	appToken: process.env.SLACK_APP_TOKEN,
});

/* --------------------------- Core functionality --------------------------- */

function setStatus() {
	axios(
		`http://api.openweathermap.org/data/2.5/weather?q=${process.env.LOCATION}&appid=${process.env.OWM_APP_ID}&units=${process.env.UNITS}`
	).then(({ data }) => {
		const temperature = Math.floor(data.main.temp);
		const weatherCode = data.weather[0].id; // https://openweathermap.org/weather-conditions#Weather-Condition-Codes-2

		/* ------------------------------ Select emoji ------------------------------ */

		let emoji; // NOTE: I use the custom Twemoji on my workspace because I prefer the look; remove tw_ to get standard emoji names

		if ([200, 210, 230].includes(weatherCode)) emoji = ":tw_lightning:";

		if ([201, 202, 211, 212, 221, 231, 232].includes(weatherCode))
			emoji = ":tw_thunder_cloud_and_rain:";

		if (
			[
				300, 301, 302, 310, 311, 312, 313, 314, 321, 500, 501, 502, 503,
				504, 511, 520, 521, 522, 531,
			].includes(weatherCode)
		)
			emoji = ":tw_rain_cloud:";

		if (weatherCode.toString()[0] == "6") emoji = ":tw_snow_cloud:";

		if ([701, 741].includes(weatherCode)) emoji = ":tw_fog:";

		if ([711, 721, 731, 751, 761, 762, 771].includes(weatherCode))
			emoji = ":tw_dash:";

		if (weatherCode == 781) emoji = ":tw_tornado:";

		if (weatherCode == 800) emoji = ":tw_sunny:";

		if (weatherCode == 801) emoji = ":tw_mostly_sunny:";

		if (weatherCode == 802) emoji = ":tw_partly_sunny:";

		if (weatherCode == 803) emoji = ":tw_barely_sunny:";

		if (weatherCode == 804) emoji = ":tw_cloud:";

		/* ------------------------------- Set status ------------------------------- */

		app.client.users.profile.set({
			profile: {
				status_emoji: emoji,
				status_text: `${temperature}°F — ${data.weather[0].description}`, // NOTE: If you change your units, consider editing the formatting here
			},
		});
	});
}

/* --------------- Set status, and set it again every interval -------------- */

(async () => {
	await app.start(process.env.PORT || 3000);

	console.log("Started!");

	setStatus();
	setInterval(setStatus, process.env.INTERVAL * 60 * 1000);
})();
