import {identity, constant, flow, pipe} from 'fp-ts/lib/function';
import {parser} from 'parser-ts';
import * as E from 'fp-ts/lib/Either';
import * as A from 'fp-ts/lib/Array';
import * as O from 'fp-ts/lib/Option';
import * as S from 'fp-ts/lib/string';
import * as N from 'fp-ts/lib/number';
import {stringify} from 'fp-ts/lib/Json';
import {type Solver} from '../type';
import {add, endOfFile, endOfLine, parse} from '../util';
import {type Item, rucksacParser, type Rucksac, itemToPriority} from './part1';

type Group = readonly [Rucksac, Rucksac, Rucksac];
type Badge = Item;

const groupParser: parser.Parser<string, Group> = pipe(
	pipe(rucksacParser, parser.apFirst(endOfLine)),
	add(pipe(rucksacParser, parser.apFirst(endOfLine))),
	add(rucksacParser),
	parser.map(([[a, b], c]) => [a, b, c] as const),
);

const identifyBadge = ([a, b, c]: Group): Badge =>
	pipe(
		a,
		A.intersection(S.Eq)(b),
		A.intersection(S.Eq)(c),
		A.head,
		O.fold(constant(''), identity),
	);

const inputParser: parser.Parser<string, Group[]> = pipe(
	parser.sepBy(endOfLine, groupParser),
	parser.apFirst(endOfFile),
);

const solver: Solver = flow(
	parse(inputParser),
	E.chain(
		flow(
			A.foldMap(N.MonoidSum)(flow(identifyBadge, itemToPriority)),
			stringify,
		),
	),
	E.fold(constant(''), identity),
);
export default solver;
