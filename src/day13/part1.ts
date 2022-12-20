import {constant, flow, identity, pipe} from 'fp-ts/lib/function';
import {char, parser, string} from 'parser-ts';
import * as A from 'fp-ts/lib/Array';
import * as E from 'fp-ts/lib/Either';
import * as N from 'fp-ts/lib/number';
import {isNumber} from 'fp-ts/lib/number';
import {stringify} from 'fp-ts/lib/Json';
import {type Ordering} from 'fp-ts/lib/Ordering';
import {type Eq} from 'fp-ts/lib/Eq';
import {type Ord} from 'fp-ts/lib/Ord';
import {type Solver} from '../type';
import {add, endOfFile, endOfLine, parse} from '../util/parser';

export type Packet = Array<number | Packet>;

const arrayParser = <A>(
	a: parser.Parser<string, A>,
): parser.Parser<string, A[]> =>
	pipe(
		parser.sepBy(char.char(','), a),
		parser.between(char.char('['), char.char(']')),
	);

const packetParser: parser.Parser<string, Packet> = pipe(
	arrayParser(
		parser.alt<string, number | Packet>(() => packetParser)(string.int),
	),
);

const doubleendOfLines = pipe(endOfLine, parser.apFirst(endOfLine));

export const inputParser = pipe(
	parser.sepBy1(
		doubleendOfLines,
		pipe(packetParser, parser.apFirst(endOfLine), add(packetParser)),
	),
	parser.apFirst(endOfFile),
);

export const compare = (left: Packet, right: Packet): Ordering => {
	if (A.isEmpty(left) && A.isEmpty(right)) return 0;

	if (A.isEmpty(left)) return -1;

	if (A.isEmpty(right)) return 1;

	const [l, ...ll] = left;
	const [r, ...rr] = right;

	if (isNumber(l) && isNumber(r)) {
		if (l === r) return compare(ll, rr);
		return l < r ? -1 : 1;
	}

	if (isNumber(l)) {
		return compare([[l], ...ll], right);
	}

	if (isNumber(r)) {
		return compare(left, [[r], ...rr]);
	}

	switch (compare(l, r)) {
		case 1: {
			return 1;
		}

		case -1: {
			return -1;
		}

		default: {
			return compare(ll, rr);
		}
	}
};

export const packetEq: Eq<Packet> = {
	equals(left, right) {
		return compare(left, right) === 0;
	},
};

export const packetOrd: Ord<Packet> = {
	...packetEq,
	compare,
};

const solver: Solver = flow(
	parse(inputParser),
	E.chain(
		flow(
			A.foldMapWithIndex(N.MonoidSum)((i, [left, right]) =>
				compare(left, right) === -1 ? i + 1 : 0,
			),
			stringify,
		),
	),
	E.fold(constant(''), identity),
);

export default solver;
