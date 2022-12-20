import {char, parser} from 'parser-ts';
import {constant, flip, flow, identity, pipe} from 'fp-ts/lib/function';
import * as E from 'fp-ts/lib/Either';
import * as A from 'fp-ts/lib/Array';
import * as N from 'fp-ts/lib/number';
import {stringify} from 'fp-ts/lib/Json';
import {type Solver} from '../type';
import {endOfFile, endOfLine, parse} from '../util/parser';
import {tuple} from '../util';
import {
	moveParser,
	type Score,
	type Move,
	type Result,
	turnToScore as previousTurnToScore,
} from './part1';

type Turn = [Move, Result];

const resultParser = (
	lossChar: string,
	drawChar: string,
	winChar: string,
): parser.Parser<string, Result> =>
	parser.either(
		parser.Functor.map(char.char(lossChar), constant('Loss' as const)),
		constant(
			parser.either(
				parser.Functor.map(char.char(drawChar), constant('Draw' as const)),
				constant(
					parser.Functor.map(char.char(winChar), constant('Win' as const)),
				),
			),
		),
	);

export const inputParser: parser.Parser<string, Turn[]> = parser.apFirst(
	endOfFile,
)(
	parser.sepBy(
		endOfLine,
		pipe(
			moveParser('C', 'B', 'A'),
			parser.chain((a) =>
				pipe(
					char.space,
					parser.apSecond(
						parser.Functor.map(
							resultParser('X', 'Y', 'Z'),
							flip<Result, Move, Turn>(tuple)(a),
						),
					),
				),
			),
		),
	),
);

const turnToYours = ([opponent, result]: Turn): Move => {
	switch (result) {
		case 'Win': {
			switch (opponent) {
				case 'Paper': {
					return 'Scissors';
				}

				case 'Rock': {
					return 'Paper';
				}

				default: {
					return 'Rock';
				}
			}
		}

		case 'Loss': {
			switch (opponent) {
				case 'Paper': {
					return 'Rock';
				}

				case 'Rock': {
					return 'Scissors';
				}

				default: {
					return 'Paper';
				}
			}
		}

		default: {
			return opponent;
		}
	}
};

const turnToScore = (turn: Turn): Score => {
	const [opponent] = turn;
	const yours = turnToYours(turn);
	return previousTurnToScore([opponent, yours]);
};

const solver: Solver = flow(
	parse(inputParser),
	E.chain(flow(A.foldMap(N.MonoidSum)(turnToScore), stringify)),
	E.fold(constant(''), identity),
);

export default solver;
