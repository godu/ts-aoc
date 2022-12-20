import {constant, flow, identity, pipe} from 'fp-ts/lib/function';
import * as A from 'fp-ts/lib/Array';
import * as E from 'fp-ts/lib/Either';
import * as M from 'fp-ts/lib/Map';
import * as N from 'fp-ts/lib/number';
import * as O from 'fp-ts/lib/Option';
import {char, parser, string} from 'parser-ts';
import {stringify} from 'fp-ts/lib/Json';
import {type Semigroup} from 'fp-ts/lib/Semigroup';
import {type Eq} from 'fp-ts/lib/Eq';
import {type Solver} from '../type';
import {add, endOfFile, endOfLine, parse, space} from '../util/parser';
import {groupBy} from '../util';
import {take} from '../util/iterable';

const monkeyIndexParser: parser.Parser<string, number> = pipe(
	string.string('Monkey '),
	parser.apSecond(string.int),
	parser.apFirst(string.string(':')),
);
const startingItemsParser: parser.Parser<string, number[]> = pipe(
	string.string('  Starting items: '),
	parser.apSecond(parser.sepBy1(string.string(', '), string.int)),
);

const operationParser: parser.Parser<string, (x: number) => number> = pipe(
	string.string('  Operation: new = '),
	parser.apSecond(
		pipe(
			string.string('old'),
			parser.map<string, (x: number) => number>(constant(identity)),
			parser.alt<string, (x: number) => number>(
				constant(pipe(string.int, parser.map(flow(identity, constant)))),
			),
		),
	),
	parser.apFirst(space),
	add(
		pipe(
			char.char('+'),
			parser.map<string, (a: number, b: number) => number>(
				constant((a, b) => a + b),
			),
			parser.alt<string, (a: number, b: number) => number>(
				constant(pipe(char.char('*'), parser.map(constant((a, b) => a * b)))),
			),
		),
	),
	parser.apFirst(space),
	add(
		pipe(
			string.string('old'),
			parser.map<string, (x: number) => number>(constant(identity)),
			parser.alt<string, (x: number) => number>(
				constant(pipe(string.int, parser.map(flow(identity, constant)))),
			),
		),
	),
	parser.map(
		([[a, ab], b]) =>
			(x: number) =>
				ab(a(x), b(x)),
	),
);

const testParser: parser.Parser<string, [number, number, number]> = pipe(
	string.string('  Test: divisible by '),
	parser.apSecond(string.int),
	parser.apFirst(endOfLine),
	parser.apFirst(string.string('    If true: throw to monkey ')),
	add(string.int),
	parser.apFirst(endOfLine),
	parser.apFirst(string.string('    If false: throw to monkey ')),
	add(string.int),
	parser.map(([[d, t], f]) => [d, t, f]),
);

type Monkey = {
	index: number;
	startingItems: number[];
	operation: (x: number) => number;
	test: [number, number, number];
};

const monkeySemigroup: Semigroup<Monkey> = {
	concat: identity,
};

export const inputParser: parser.Parser<string, Monkey[]> = pipe(
	parser.sepBy1(
		pipe(endOfLine, parser.apFirst(endOfLine)),
		pipe(
			monkeyIndexParser,
			parser.bindTo('index'),
			parser.apFirst(endOfLine),
			parser.bind('startingItems', constant(startingItemsParser)),
			parser.apFirst(endOfLine),
			parser.bind('operation', constant(operationParser)),
			parser.apFirst(endOfLine),
			parser.bind('test', constant(testParser)),
		),
	),
	parser.apFirst(endOfFile),
);

const tryModifyAt =
	<K>(E: Eq<K>) =>
	<A>(k: K, f: (a: A) => A) =>
	(m: Map<K, A>): Map<K, A> => {
		return pipe(m, M.modifyAt(E)(k, f), O.getOrElse(constant(m)));
	};

const quotient = (a: number, b: number) => Math.floor(a / b);
const remainder = (a: number, b: number) => a % b;

const loop = (
	cycleLength: number,
	decrease: (worryLevel: number) => number,
	index: number,
	monkeys: Map<number, Monkey>,
): Map<number, Monkey> =>
	pipe(
		monkeys,
		tryModifyAt(N.Eq)(index, (m) => ({...m, startingItems: []})),
		pipe(
			M.lookup(N.Eq)(index, monkeys),
			O.map((m) =>
				pipe(
					m.startingItems,
					A.foldMap<(m: Map<number, Monkey>) => Map<number, Monkey>>({
						empty: identity,
						concat: (a, b) => flow(a, b),
					})((i: number): ((m: Map<number, Monkey>) => Map<number, Monkey>) => {
						const worryLevel = pipe(i, m.operation, decrease, (x) =>
							remainder(x, cycleLength),
						);
						const to = pipe(worryLevel, (x) =>
							x % m.test[0] === 0 ? m.test[1] : m.test[2],
						);
						return tryModifyAt(N.Eq)(to, (m) => ({
							...m,
							startingItems: [...m.startingItems, worryLevel],
						}));
					}),
				),
			),
			O.getOrElse<(m: Map<number, Monkey>) => Map<number, Monkey>>(
				constant(identity),
			),
		),
	);

const rounds =
	(decrease: (worryLevel: number) => number) =>
	(monkeys: Monkey[]): Iterable<Monkey> => ({
		*[Symbol.iterator]() {
			const monkeyOrder = pipe(
				monkeys,
				A.map((m) => m.index),
			);

			const cycleLength = pipe(
				monkeys,
				A.foldMap(N.MonoidProduct)((m) => m.test[0]),
			);

			let mapMonkeys = groupBy(N.Eq, monkeySemigroup)((m) => m.index)(monkeys);

			while (true) {
				for (const monkeyIndex of monkeyOrder) {
					const current = M.lookup(N.Eq)(monkeyIndex, mapMonkeys);
					if (O.isSome(current)) yield current.value;
					mapMonkeys = loop(cycleLength, decrease, monkeyIndex, mapMonkeys);
				}
			}
		},
	});

export const solve =
	(decrease: (worryLevel: number) => number, count: number) =>
	(monkeys: Monkey[]): number =>
		pipe(
			monkeys,
			rounds(decrease),
			take(monkeys.length * count),
			Array.from,
			A.foldMap(M.getUnionMonoid(N.Eq, N.SemigroupSum))((m: Monkey) =>
				M.singleton(m.index, m.startingItems.length),
			),
			M.values(N.Ord),
			A.sort(N.Ord),
			A.takeRight(2),
			A.foldMap(N.MonoidProduct)(identity),
		);

const solver: Solver = flow(
	parse(inputParser),
	E.chain(
		flow(
			solve((x) => quotient(x, 3), 20),
			stringify,
		),
	),
	E.fold(constant(''), identity),
);

export default solver;
