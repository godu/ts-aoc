import {constant, flow, identity, pipe} from 'fp-ts/lib/function';
import * as O from 'fp-ts/lib/Option';
import * as T from 'fp-ts/lib/Tuple';
import * as M from 'fp-ts/lib/Map';
import * as E from 'fp-ts/lib/Either';
import * as S from 'fp-ts/lib/string';
import {parser, string} from 'parser-ts';
import {type Solver} from '../type';
import {endOfFile, endOfLine, parse} from '../util/parser';
import {traceId, traceStringId} from '../util/debug';

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

const rowParser = pipe(
	string.string('Valve '),
	parser.apSecond(string.notSpaces1),
	parser.bindTo('valve'),
	parser.apFirst(string.string(' has flow rate=')),
	parser.bind('rate', constant(string.int)),
	parser.apFirst(string.string('; tunnels lead to valves ')),
	parser.bind(
		'valves',
		constant(parser.sepBy1(string.string(', '), string.)),
	),
);

const inputParser = pipe(
	parser.sepBy1(endOfLine, rowParser),
	// Parser.apFirst(endOfFile),
);

const solver: Solver = flow(
	parse(inputParser),
	E.bimap(traceStringId('error\n'), traceId('input\n')),
);

export default solver;
