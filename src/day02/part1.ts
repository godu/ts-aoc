import {char, parser} from 'parser-ts';
import {constant, flip, flow, identity, pipe} from 'fp-ts/lib/function';
import * as E from 'fp-ts/lib/Either';
import * as A from 'fp-ts/lib/Array';
import * as T from 'fp-ts/lib/Tuple';
import * as N from 'fp-ts/lib/number';
import {stringify} from 'fp-ts/lib/Json';
import {type Solver} from '../type';
import {endOfFile, endOfLine, parse, tuple} from '../util';

export type Move = 'Scissors' | 'Paper' | 'Rock';
export type Score = number;
export type Result = 'Win' | 'Draw' | 'Loss';
type Turn = [Move, Move];

export const moveParser = (
	scissorsChar: string,
	paperChar: string,
	rockChar: string,
): parser.Parser<string, Move> =>
	parser.either(
		parser.Functor.map(char.char(scissorsChar), constant('Scissors' as const)),
		constant(
			parser.either(
				parser.Functor.map(char.char(paperChar), constant('Paper' as const)),
				constant(
					parser.Functor.map(char.char(rockChar), constant('Rock' as const)),
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
							moveParser('Z', 'Y', 'X'),
							flip<Move, Move, Turn>(tuple)(a),
						),
					),
				),
			),
		),
	),
);

const moveToScore = (move: Move): Score => {
	switch (move) {
		case 'Rock': {
			return 1;
		}

		case 'Paper': {
			return 2;
		}

		default: {
			return 3;
		}
	}
};

const turnToResult = ([opponent, yours]: Turn): Result => {
	switch (opponent) {
		case 'Paper': {
			switch (yours) {
				case 'Paper': {
					return 'Draw';
				}

				case 'Rock': {
					return 'Loss';
				}

				default: {
					return 'Win';
				}
			}
		}

		case 'Rock': {
			switch (yours) {
				case 'Paper': {
					return 'Win';
				}

				case 'Rock': {
					return 'Draw';
				}

				default: {
					return 'Loss';
				}
			}
		}

		default: {
			switch (yours) {
				case 'Paper': {
					return 'Loss';
				}

				case 'Rock': {
					return 'Win';
				}

				default: {
					return 'Draw';
				}
			}
		}
	}
};

const resultToScore = (result: Result): Score =>
	result === 'Win' ? 6 : result === 'Draw' ? 3 : 0;

export const turnToScore = (turn: Turn): Score =>
	pipe(turn, turnToResult, resultToScore) + pipe(turn, T.snd, moveToScore);

const solver: Solver = flow(
	parse(inputParser),
	E.chain(flow(A.foldMap(N.MonoidSum)(turnToScore), stringify)),
	E.fold(constant(''), identity),
);

export default solver;
