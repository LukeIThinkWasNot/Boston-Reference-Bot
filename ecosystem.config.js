module.exports = {
	apps: [
		{
			name: "Boston Reference",
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
