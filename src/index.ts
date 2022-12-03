import {argv} from 'node:process';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {parseArgs} from 'node:util';
import {formatDay} from './util';
import {type Solver} from './type';

const outputSolution = async (day: number, part: number): Promise<string> => {
	const {default: solver} = (await import(
		`./day${formatDay(day)}/part${part}.js`
	)) as {default: Solver};
	const input = await readFile(
		new URL(`day${formatDay(day)}/input.txt`, import.meta.url),
		{encoding: 'utf8'},
	);

	return `Day ${day} | Part ${part} - Solution: ${solver(input)}`;
};

const validate = (type: 'day' | 'part', number_: number, max: number) => {
	if (number_ < 1 || number_ > max + 1) {
		throw new Error(
			`The ${type} must be number between 1 and ${max}, you entered ${number_}`,
		);
	}
};

if (import.meta.url.startsWith('file:')) {
	const modulePath = fileURLToPath(import.meta.url);
	if (argv[1] === modulePath) {
		const {values: args} = parseArgs({
			options: {
				day: {
					type: 'string',
					short: 'd',
				},
				part: {
					type: 'string',
					short: 'c',
				},
			},
		});
		const day = Number(args.day ?? 0);
		const part = Number(args.part ?? 0);

		validate('day', day, 25);
		validate('part', part, 2);
		console.log(await outputSolution(day, part));
	}
}
