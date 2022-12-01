const solver = (input: string): string => {
	return `${Math.max(
		...input.split('\n\n').map((s) =>
			s
				.trim()
				.split('\n')
				.map((r) => Number.parseInt(r, 10))
				.reduce((a, b) => a + b, 0),
		),
	)}`;
};

export default solver;
