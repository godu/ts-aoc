import {constant, flow, identity, pipe, tupled} from 'fp-ts/lib/function';
import * as E from 'fp-ts/lib/Either';
import * as A from 'fp-ts/lib/Array';
import * as S from 'fp-ts/lib/string';
import {type Solver} from '../type';
import {parse} from '../util';
import {inputParser, unfoldMoves, type Stack} from './part1';

export const getAnwser = (stacks: Stack[]): string =>
	pipe(
		stacks,
		A.map(flow(A.head, A.fromOption)),
		A.flatten,
		A.foldMap(S.Monoid)(identity),
	);

const solver: Solver = flow(
	parse(inputParser),
	E.fold(constant(''), flow(tupled(unfoldMoves(identity)), getAnwser)),
);
export default solver;
