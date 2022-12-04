import {constant, flow, identity, pipe, tupled} from 'fp-ts/lib/function';
import {stringify} from 'fp-ts/lib/Json';
import * as A from 'fp-ts/lib/Array';
import * as E from 'fp-ts/lib/Either';
import {char, parser, string} from 'parser-ts';
import {type Solver} from '../type';
import {add, endOfLine, parse} from '../util';

type Section = number;
export type Range = [Section, Section];

const sectionParser: parser.Parser<string, Section> = string.int;
const rangeParser: parser.Parser<string, Range> = pipe(
	sectionParser,
	parser.apFirst(char.char('-')),
	add(sectionParser),
);
const pairParser: parser.Parser<string, [Range, Range]> = pipe(
	rangeParser,
	parser.apFirst(char.char(',')),
	add(rangeParser),
);
export const inputParser = parser.sepBy1(endOfLine, pairParser);

const isFullyContain = ([a, b]: Range, [c, d]: Range) =>
	(a <= c && b >= d) || (a >= c && b <= d);

const solver: Solver = flow(
	parse(inputParser),
	E.chain(flow(A.filter(tupled(isFullyContain)), A.size, stringify)),
	E.fold(constant(''), identity),
);

export default solver;
