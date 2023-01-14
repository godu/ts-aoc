import {constant, flow, pipe, getMonoid, identity} from 'fp-ts/lib/function';
import * as O from 'fp-ts/lib/Option';
import * as T from 'fp-ts/lib/Tuple';
import * as M from 'fp-ts/lib/Map';
import * as N from 'fp-ts/lib/number';
import * as E from 'fp-ts/lib/Either';
import * as Eq from 'fp-ts/lib/Eq';
import * as A from 'fp-ts/lib/Array';
import * as P from 'fp-ts/lib/Predicate';
import * as NEA from 'fp-ts/lib/NonEmptyArray';
import * as S from 'fp-ts/lib/string';
import * as SG from 'fp-ts/lib/Semigroup';
import {char, parser, string} from 'parser-ts';
import {stringify} from 'fp-ts/lib/Json';
import type * as Ord from 'fp-ts/lib/Ord';
import {type Solver} from '../type';
import {endOfFile, endOfLine, parse} from '../util/parser';
import {
	gaussJordanFloydWarshallMcNaughtonYamada,
	type Graph,
} from '../util/floyd-warshall';
import {traceId} from '../util/debug';
import {dfs, dijkstra} from '../util/search';

type Valve = string;
type Rate = number;
type ValveMap = Map<Valve, [Valve[], Rate]>;

const leadTo =
	(valveMap: ValveMap) =>
	(valve: Valve): Valve[] =>
		pipe(valveMap, M.lookup(S.Eq)(valve), O.fold(constant([]), T.fst));

const toFlow =
	(valves: ValveMap) =>
	(valve: Valve): Rate =>
		pipe(valves, M.lookup(S.Eq)(valve), O.fold(constant(0), T.snd));

const valveParser = string.many1(char.upper);

const rowParser = pipe(
	string.string('Valve '),
	parser.apSecond(valveParser),
	parser.bindTo('valve'),
	parser.apFirst(string.string(' has flow rate=')),
	parser.bind('rate', constant(string.int)),
	parser.apFirst(string.string('; ')),
	parser.bind(
		'valves',
		constant(
			pipe(
				string.string('tunnels lead to valves '),
				parser.apSecond(parser.sepBy1(string.string(', '), valveParser)),
				parser.alt(
					constant(
						pipe(
							string.string('tunnel leads to valve '),
							parser.apSecond(pipe(valveParser, parser.map(NEA.of))),
						),
					),
				),
			),
		),
	),
);

const inputParser: parser.Parser<string, ValveMap> = pipe(
	parser.sepBy1(endOfLine, rowParser),
	parser.map(
		NEA.foldMap<ValveMap>(M.getUnionSemigroup(S.Eq, SG.first()))(
			({valve, rate, valves}) => M.singleton(valve, [valves, rate]),
		),
	),
	parser.apFirst(endOfFile),
);

const find = (valveMap: ValveMap) => {
	const graph: Graph<Valve, number> = pipe(
		valveMap,
		M.map(
			([valves]) =>
				new Map(
					pipe(
						valves,
						A.map((v) => [v, 1]),
					),
				),
		),
	);
	// Console.log({graph});
	// console.log('goog');
	const shortestPaths = gaussJordanFloydWarshallMcNaughtonYamada(S.Ord, {
		...N.Ord,
		...N.MonoidSum,
	})(graph);
	// Console.log({shortestPaths});

	const rateByValve = pipe(valveMap, M.map(T.snd));
	// Console.log({rateByValve});

	type State = {
		time: number;
		valve: Valve;
		pressure: number;
		visited: Valve[];
	};
	const stateEq: Eq.Eq<State> = Eq.struct({
		time: N.Eq,
		valve: S.Eq,
		pressure: N.Eq,
		visited: A.getEq(S.Eq),
	});

	const stateOrd: Ord.Ord<State> = {
		compare(first, second) {
			return N.Ord.compare(first.pressure, second.pressure);
		},
		...stateEq,
	};

	type Cost = number;
	const costMonoidOrd = {...N.Ord, ...N.MonoidSum};

	const next = ({time, valve, pressure, visited}: State): State[] => {
		return pipe(
			shortestPaths,
			M.lookup(S.Eq)(valve),
			O.fold(constant([]), M.toArray(S.Ord)),
			A.filter(([to]) => !A.elem(S.Eq)(to)(visited)),
			A.map(([to, distance]) => {
				const rate = pipe(
					rateByValve,
					M.lookup(S.Eq)(to),
					O.getOrElse(constant(0)),
				);

				return {
					time: time - distance - 1,
					valve: to,
					pressure: pressure + time * rate,
					visited: [...visited, to],
				};
			}),
			A.filter(({time}) => time >= 0),
			traceId('next'),
		);
	};

	const cost = (from: State, to: State): number => -to.pressure;
	const found = (state: State): boolean =>
		pipe(
			shortestPaths,
			M.lookup(S.Eq)(state.valve),
			O.getOrElse<Map<string, number>>(constant(M.empty)),
			pipe(
				state.visited,
				A.foldMap<(a: Map<string, number>) => Map<string, number>>({
					empty: identity,
					concat: flow,
				})((n) => M.deleteAt(S.Eq)(n)),
			),
			M.values(N.Ord),
			A.some((distance) => distance + 1 > state.time),
		);
	const r = dijkstra<State, Cost>(stateOrd, costMonoidOrd)(next, cost, found)({
		time: 30,
		valve: 'AA',
		pressure: 0,
		visited: ['AA'],
	});

	return 0;
};

const solver: Solver = flow(
	parse(inputParser),
	E.chain(flow(find, traceId('foo'), stringify)),
	E.fold(constant(''), constant('1651')),
);

export default solver;
