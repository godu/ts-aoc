import {identity, constant, flow, pipe, flip} from 'fp-ts/lib/function';
import {char, parser} from 'parser-ts';
import * as E from 'fp-ts/lib/Either';
import * as A from 'fp-ts/lib/Array';
import * as NEA from 'fp-ts/lib/NonEmptyArray';
import * as O from 'fp-ts/lib/Option';
import * as S from 'fp-ts/lib/string';
import * as N from 'fp-ts/lib/number';
import * as R from 'fp-ts/lib/Record';
import {stringify} from 'fp-ts/lib/Json';
import {type Solver} from '../type';
import {endOfFile, endOfLine, parse} from '../util';

export type Item = string;
export type Rucksac = Item[];
export type Priority = number;

export const itemParser: parser.Parser<string, Item> = char.letter;
export const rucksacParser: parser.Parser<string, Rucksac> =
	parser.many1(itemParser);

const inputParser: parser.Parser<string, Rucksac[]> = pipe(
	parser.sepBy(endOfLine, rucksacParser),
	parser.apFirst(endOfFile),
);

const rucksacToCompartments = (rucksac: Rucksac): [Item[], Item[]] =>
	A.splitAt(A.size(rucksac) / 2)(rucksac);

const detectMisplacedItem = (rucksac: Rucksac): O.Option<Item> => {
	const [compartmentA, compartmentB] = rucksacToCompartments(rucksac);
	return A.head(A.intersection(S.Eq)(compartmentA)(compartmentB));
};

const isUpperCase = (s: string) => s === S.toUpperCase(s);

export const itemToPriority = (char: string) =>
	(char.codePointAt(0) ?? 0) - (isUpperCase(char) ? 38 : 96);

const solver: Solver = flow(
	parse(inputParser),
	E.chain(
		flow(
			A.foldMap(N.MonoidSum)(
				flow(detectMisplacedItem, O.fold(constant(0), itemToPriority)),
			),
			stringify,
		),
	),
	E.fold(constant(''), identity),
);

export default solver;
