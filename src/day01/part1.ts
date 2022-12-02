import {string, parser} from 'parser-ts';
import {constant, identity, flow, pipe} from 'fp-ts/lib/function';
import {stringify} from 'fp-ts/lib/Json';
import * as A from 'fp-ts/lib/NonEmptyArray';
import * as E from 'fp-ts/lib/Either';
import * as N from 'fp-ts/lib/number';
import {type Solver} from '../type';
import {endOfFile, endOfLine, parse} from '../util';

export const inputParser = pipe(
	parser.sepBy1(
		parser.apFirst(endOfLine)(endOfLine),
		parser.sepBy1(endOfLine, string.int),
	),
	parser.apFirst(endOfFile),
);

const solver: Solver = flow(
	parse(inputParser),
	E.chain(flow(A.map(A.concatAll(N.MonoidSum)), A.max(N.Ord), stringify)),
	E.fold(constant(''), identity),
);

export default solver;
