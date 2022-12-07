import {constant, flow, identity} from 'fp-ts/lib/function';
import {stringify} from 'fp-ts/lib/Json';
import * as E from 'fp-ts/lib/Either';
import * as T from 'fp-ts/lib/Tuple';
import * as A from 'fp-ts/lib/Array';
import * as N from 'fp-ts/lib/number';
import * as O from 'fp-ts/lib/Option';
import {type Solver} from '../type';
import {parse} from '../util';
import {commandsToFileSystem, directories, inputParser, size} from './part1';

const solver: Solver = flow(
	parse(inputParser),
	E.chain(
		flow(
			commandsToFileSystem,
			T.fst,
			A.map(directories),
			A.flatten,
			A.map(size),
			A.sort(N.Ord),
			(ss: number[]): O.Option<number> => {
				const total = A.last(ss);
				const unused = O.map((total_: number) => 70_000_000 - total_)(total);
				const required = O.map((unused_: number) => 30_000_000 - unused_)(
					unused,
				);

				return O.chain((required_: number) =>
					A.findFirst<number>((s) => s >= required_)(ss),
				)(required);
			},
			E.fromOption(constant('')),
			E.chain(stringify),
		),
	),
	E.fold(constant(''), identity),
);

export default solver;
