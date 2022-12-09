import {
	constant,
	decrement,
	flow,
	identity,
	increment,
	pipe,
} from 'fp-ts/lib/function';
import * as A from 'fp-ts/lib/Array';
import * as T from 'fp-ts/lib/Tuple';
import * as E from 'fp-ts/lib/Either';
import * as O from 'fp-ts/lib/Option';
import {char, parser, string} from 'parser-ts';
import {stringify} from 'fp-ts/lib/Json';
import {type Eq} from 'fp-ts/lib/Eq';
import {type Solver} from '../type';
import {add, endOfFile, endOfLine, parse, space} from '../util';

type Direction = 'R' | 'U' | 'L' | 'D';
type Command = [Direction, number];

const directionParser = <A extends Direction>(direction: A) =>
	pipe(char.char(direction), parser.map(constant(direction)));

const commandParser: parser.Parser<string, Command> = pipe(
	directionParser('R'),
	parser.alt<string, Direction>(constant(directionParser('U'))),
	parser.alt<string, Direction>(constant(directionParser('L'))),
	parser.alt<string, Direction>(constant(directionParser('D'))),
	parser.apFirst(space),
	add(string.int),
);

export const inputParser = pipe(
	parser.sepBy1(endOfLine, commandParser),
	parser.apFirst(endOfFile),
);

type Point = [number, number];

export const pointEq: Eq<Point> = {
	equals: ([xx, xy], [yx, yy]) => xx === yx && xy === yy,
};

type Rope = Point[];

const moveUp: (p: Point) => Point = T.mapFst(increment);
const moveDown: (p: Point) => Point = T.mapFst(decrement);
const moveRight: (p: Point) => Point = T.mapSnd(increment);
const moveLeft: (p: Point) => Point = T.mapSnd(decrement);
const move = (direction: Direction) =>
	direction === 'R'
		? moveRight
		: direction === 'L'
		? moveLeft
		: direction === 'U'
		? moveUp
		: moveDown;

const inRange =
	(min: number, max: number) =>
	(x: number): boolean =>
		min <= x && x <= max;

const isTouching =
	([px, py]: Point) =>
	([qx, qy]: Point) =>
		inRange(-1, 1)(px - qx) && inRange(-1, 1)(py - qy);

const moveKnot = ([hx, hy]: Point, [tx, ty]: Point): Point => {
	if (isTouching([hx, hy])([tx, ty])) return [tx, ty];
	const [dx, dy] = [hx - tx, hy - ty];

	return dx === 0
		? [tx, ty + (dy > 0 ? 1 : -1)]
		: dy === 0
		? [tx + (dx > 0 ? 1 : -1), ty]
		: [tx + (dx > 0 ? 1 : -1), ty + (dy > 0 ? 1 : -1)];
};

export const moveRope =
	(rope: Rope) =>
	(commands: Command[]): Rope[] => {
		return pipe(
			commands,
			A.chain(([direction, move]) => A.replicate(move, direction)),
			A.scanLeft<Direction, Rope>(rope, (knots, direction) => {
				return pipe(
					knots,
					A.matchLeft(
						(): Point[] => [],
						(head, tail) => {
							const nextHead = move(direction)(head);
							return pipe(tail, A.scanLeft<Point, Point>(nextHead, moveKnot));
						},
					),
				);
			}),
		);
	};

const solver: Solver = flow(
	parse(inputParser),
	E.chain(
		flow(
			moveRope([
				[0, 0],
				[0, 0],
			]),
			A.map(A.last),
			A.sequence(O.Applicative),
			O.map(flow(A.uniq(pointEq), A.size)),
			E.fromOption(constant('')),
			E.chain(stringify),
		),
	),
	E.fold(constant(''), identity),
);

export default solver;
