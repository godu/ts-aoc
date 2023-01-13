import {constant, flow, pipe} from 'fp-ts/lib/function';
import * as O from 'fp-ts/lib/Option';
import * as T from 'fp-ts/lib/Tuple';
import * as M from 'fp-ts/lib/Map';
import * as N from 'fp-ts/lib/number';
import * as E from 'fp-ts/lib/Either';
import * as NEA from 'fp-ts/lib/NonEmptyArray';
import * as S from 'fp-ts/lib/string';
import {char, parser, string} from 'parser-ts';
import {stringify} from 'fp-ts/lib/Json';
import {type Solver} from '../type';
import {endOfFile, endOfLine, parse} from '../util/parser';

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

const inputParser = pipe(
	parser.sepBy1(endOfLine, rowParser),
	parser.apFirst(endOfFile),
);

const solver: Solver = flow(
	parse(inputParser),
	E.chain(
		flow(
			NEA.foldMap(N.MonoidSum)(({rate}) => rate),
			stringify,
		),
	),
	E.fold(constant(''), constant('1651')),
);

export default solver;
