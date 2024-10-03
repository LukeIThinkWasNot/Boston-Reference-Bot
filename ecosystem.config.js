module.exports = {
	apps: [
		{
			name: "Yo Reference",
			script: "./start.sh",
			automation: false,
			env: {
				NODE_ENV: "development",
			},
			env_production: {
				NODE_ENV: "production",
			},
		},
	],
};
