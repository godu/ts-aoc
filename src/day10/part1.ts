import {constant, flow, identity, pipe} from 'fp-ts/lib/function';
import {stringify} from 'fp-ts/lib/Json';
import * as A from 'fp-ts/lib/Array';
import * as E from 'fp-ts/lib/Either';
import * as O from 'fp-ts/lib/Option';
import * as N from 'fp-ts/lib/number';
import {parser, string} from 'parser-ts';
import {type Solver} from '../type';
import {add, endOfFile, endOfLine, parse, space} from '../util/parser';

type Instruction = 'noop' | ['addx', number];

const noopParser = pipe(
	string.string('noop'),
	parser.map(constant('noop' as const)),
);
const addxParser: parser.Parser<string, ['addx', number]> = pipe(
	string.string('addx'),
	parser.map(constant('addx' as const)),
	parser.apFirst(space),
	add(string.int),
);
const instructionParser: parser.Parser<string, Instruction> = pipe(
	noopParser,
	parser.alt<string, Instruction>(constant(addxParser)),
);

export const inputParser = pipe(
	parser.sepBy1(endOfLine, instructionParser),
	parser.apFirst(endOfFile),
);

type Registry = number;
export const cycles: (instructions: Instruction[]) => Registry[] = flow(
	A.chain((instruction) => {
		if (instruction === 'noop') return [0];
		const [, n] = instruction;
		return [0, n];
	}),
	A.scanLeft(1, (registry, n) => registry + n),
);

const solver: Solver = flow(
	parse(inputParser),
	E.chain(
		flow(
			cycles,
			A.filterMapWithIndex((i, n) =>
				(i + 1) % 40 === 20 ? O.some((i + 1) * n) : O.none,
			),
			A.foldMap(N.MonoidSum)(identity),
			stringify,
		),
	),
	E.fold(constant(''), identity),
);

export default solver;
