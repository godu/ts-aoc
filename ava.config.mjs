const config = {
	files: ['src/*/test.*', '!test/**/helpers/**/*'],
	extensions: {
		ts: 'module',
	},
	nodeArguments: ['--no-warnings', '--loader=ts-node/esm/transpile-only'],
};

export default config;
