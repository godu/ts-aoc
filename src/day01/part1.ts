import {char, string, parser} from 'parser-ts';
import {constant, identity, flow} from 'fp-ts/lib/function';
import {stringify} from 'fp-ts/lib/Json';
import * as A from 'fp-ts/lib/NonEmptyArray';
import * as E from 'fp-ts/lib/Either';
import * as N from 'fp-ts/lib/number';
import {type Solver} from '../type';
import {parse} from '../util';

export const inputParser = parser.apFirst(parser.eof<string>())(
	parser.sepBy1(
		string.string('\n\n'),
		parser.sepBy1(char.char('\n'), string.int),
	),
);

const solver: Solver = flow(
	parse(inputParser),
	E.chain(flow(A.map(A.concatAll(N.MonoidSum)), A.max(N.Ord), stringify)),
	E.fold(constant(''), identity),
);

export default solver;
