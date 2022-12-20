import {constant, flow, identity, increment, pipe} from 'fp-ts/lib/function';
import * as A from 'fp-ts/lib/Array';
import * as E from 'fp-ts/lib/Either';
import * as O from 'fp-ts/lib/Option';
import {stringify} from 'fp-ts/lib/Json';
import {type Solver} from '../type';
import {parse} from '../util/parser';
import {inputParser, packetOrd, type Packet} from './part1';

const firstDividerPacket: Packet = [[2]];
const secondDividerPacket: Packet = [[6]];

const solver: Solver = flow(
	parse(inputParser),
	E.chain(
		flow(
			A.flatten,
			A.concat<Packet>([firstDividerPacket, secondDividerPacket]),
			A.sort<Packet>(packetOrd),
			(xs) => {
				const firstDividerIndex = pipe(
					xs,
					A.findIndex((x) => packetOrd.equals(x, firstDividerPacket)),
					O.map(increment),
				);
				const secondDividerIndex = pipe(
					xs,
					A.findIndex((x) => packetOrd.equals(x, secondDividerPacket)),
					O.map(increment),
				);

				return pipe(
					firstDividerIndex,
					O.chain((f) =>
						pipe(
							secondDividerIndex,
							O.map((s) => s * f),
						),
					),
				);
			},
			O.getOrElse(constant(0)),
			stringify,
		),
	),
	E.fold(constant(''), identity),
);

export default solver;
