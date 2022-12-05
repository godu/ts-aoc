import {
	constant,
	decrement,
	flow,
	identity,
	pipe,
	tupled,
} from 'fp-ts/lib/function';
import * as E from 'fp-ts/lib/Either';
import * as A from 'fp-ts/lib/Array';
import * as O from 'fp-ts/lib/Option';
import * as S from 'fp-ts/lib/string';
import * as T from 'fp-ts/lib/Tuple';
import {char, parser, string} from 'parser-ts';
import {type Solver} from '../type';
import {add, endOfFile, endOfLine, parse, space} from '../util';

type Crate = string;
export type Stack = Crate[];
export type Move = [number, [number, number]];
type Input = [Stack[], Move[]];

const crateParser: parser.Parser<string, Crate> = pipe(
	char.letter,
	parser.between(char.char('['), char.char(']')),
);
const emptyParser: parser.Parser<string, void> = pipe(
	string.string('   '),
	parser.map(constant(undefined)),
);

const stackRowParser: parser.Parser<
	string,
	Array<O.Option<Crate>>
> = parser.sepBy1(
	space,
	pipe(
		pipe(crateParser, parser.map(O.some)),
		parser.alt<string, O.Option<string>>(
			constant(pipe(emptyParser, parser.map(constant(O.none)))),
		),
	),
);
const indexParser = pipe(string.int, parser.map(decrement));
const moveParser: parser.Parser<string, Move> = pipe(
	string.string('move '),
	parser.apSecond(string.int),
	add(
		pipe(
			string.string(' from '),
			parser.apSecond(indexParser),
			parser.apFirst(string.string(' to ')),
			add(indexParser),
		),
	),
);

export const inputParser: parser.Parser<string, Input> = pipe(
	parser.sepBy1(endOfLine, stackRowParser),
	parser.apFirst(endOfLine),
	add(parser.sepBy1(space, pipe(string.int, parser.between(space, space)))),
	parser.map(([lines, stackIndexes]) => {
		return pipe(
			stackIndexes,
			A.map<number, string[]>((index) =>
				pipe(
					lines,
					A.map(flow(A.lookup(index - 1), O.flatten, A.fromOption)),
					A.flatten,
				),
			),
		);
	}),
	parser.apFirst(endOfLine),
	parser.apFirst(endOfLine),
	add(parser.sepBy1(endOfLine, moveParser)),
	parser.apFirst(endOfFile),
);

export const unfoldMoves =
	(rearrangeCrates: (crates: Crate[]) => Crate[] = A.reverse) =>
	(stacks: Stack[], moves: Move[]) =>
		pipe(
			moves,
			// eslint-disable-next-line unicorn/no-array-reduce
			A.reduce<Move, Stack[]>(stacks, (stacks, [howMany, [from, to]]) => {
				const f = pipe(stacks, A.lookup(from), O.map(A.splitAt(howMany)));
				const toMove = pipe(f, O.map(flow(T.fst, rearrangeCrates)));
				const nextFrom = pipe(f, O.map(T.snd));
				const nextTo = pipe(
					stacks,
					A.lookup(to),
					O.chain((to) =>
						pipe(
							toMove,
							O.map((toMove) => [...toMove, ...to]),
						),
					),
				);

				return pipe(
					stacks,
					O.fold<Stack, (stacks: Stack[]) => Stack[]>(
						constant(identity),
						(nextFrom) => (stacks) =>
							pipe(
								stacks,
								A.updateAt(from, nextFrom),
								O.fold(constant(stacks), identity),
							),
					)(nextFrom),
					O.fold<Stack, (stacks: Stack[]) => Stack[]>(
						constant(identity),
						(nextTo) => (stacks) =>
							pipe(
								stacks,
								A.updateAt(to, nextTo),
								O.fold(constant(stacks), identity),
							),
					)(nextTo),
				);
			}),
		);

export const getAnwser = (stacks: Stack[]): string =>
	pipe(
		stacks,
		A.map(flow(A.head, A.fromOption)),
		A.flatten,
		A.foldMap(S.Monoid)(identity),
	);

const solver: Solver = flow(
	parse(inputParser),
	E.fold(constant(''), flow(tupled(unfoldMoves()), getAnwser)),
);

export default solver;
