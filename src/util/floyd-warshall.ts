import {constant, identity, pipe} from 'fp-ts/lib/function';
import * as A from 'fp-ts/lib/Array';
import * as M from 'fp-ts/lib/Map';
import * as O from 'fp-ts/lib/Option';
import * as S from 'fp-ts/lib/Set';
import {type Ord} from 'fp-ts/lib/Ord';
import {min, type Semigroup} from 'fp-ts/lib/Semigroup';
import * as I from './iterable';

export type Graph<Node, Cost> = Map<Node, Map<Node, Cost>>;

const toNodeSet = <Node, Cost>(nodeOrd: Ord<Node>) => {
	return (graph: Graph<Node, Cost>) =>
		pipe(
			graph,
			M.toArray(nodeOrd),
			A.foldMap(A.getMonoid<Node>())(([from, tos]) => [
				from,
				...M.keys(nodeOrd)(tos),
			]),
			S.fromArray(nodeOrd),
		);
};

export type ShortestPath<Node, Cost> = Map<Node, Map<Node, Cost>>;

export const gaussJordanFloydWarshallMcNaughtonYamada =
	<Node, Cost>(
		nodeOrd: Ord<Node>,
		costOrdAndSemigroup: Ord<Cost> & Semigroup<Cost>,
	) =>
	(graph: Graph<Node, Cost>) => {
		const nodes = toNodeSet(nodeOrd)(graph);

		const walk =
			(graph: Graph<Node, Cost>) => (paths: ShortestPath<Node, Cost>) =>
				pipe(
					paths,
					M.mapWithIndex((to, m) =>
						pipe(
							m,
							M.foldMapWithIndex(nodeOrd)(
								M.getMonoid(nodeOrd, min(costOrdAndSemigroup)),
							)((from, cost) =>
								pipe(
									graph,
									M.lookup(nodeOrd)(from),
									O.getOrElse<Map<Node, Cost>>(constant(M.empty)),
									M.deleteAt(nodeOrd)(to),
									M.map((c): Cost => costOrdAndSemigroup.concat(cost, c)),
								),
							),
						),
					),
				);

		const shortest = I.unfold<
			ShortestPath<Node, Cost>,
			ShortestPath<Node, Cost>
		>(graph, (g) => O.some([g, walk(graph)(g)]));

		return pipe(
			shortest,
			I.take(S.size(nodes) - 1),
			I.foldMap(
				M.getMonoid(nodeOrd, M.getMonoid(nodeOrd, min(costOrdAndSemigroup))),
			)(identity),
		);
	};
