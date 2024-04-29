import { useEffect, useMemo  } from 'react';
import { Group } from '@visx/group';
import { Tree, hierarchy } from '@visx/hierarchy';
import { LinkHorizontal } from '@visx/shape';
import { useParentSize } from '@visx/responsive';
import { BookNode, MoveNode, TreeNode } from "../../chess";
import { useContext } from "react";
import { OpeningsContext } from '../App';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { Chess } from 'chess.js';
import { Zoom } from '@visx/zoom';
import { scaleLinear } from '@visx/scale';
import { Node } from './Node';
import { TransformMatrix } from '@visx/zoom/lib/types';

const nodeHeightScale= scaleLinear({ domain: [300, 1200], range: [12, 50] })
const nodeWidthScale= scaleLinear({ domain: [300, 1200], range: [110, 140] })
const treeWidthScale = scaleLinear({ domain: [300, 1200], range: [150, 300] })

const defaultMargin = { top: 10, left: 40, right: 40, bottom: 10 };
export type TreeProps = {
  margin?: { top: number; right: number; bottom: number; left: number };
};

export default function MoveTree({ margin = defaultMargin }: TreeProps) {
  const { parentRef, width, height } = useParentSize({ initialSize: { width: 800, height: 600 }})
  const openings = useContext(OpeningsContext)
  const moveTree = useSelector((state: RootState) => state.game.moveTree)
  const moveKey = useSelector((state: RootState) => state.game.key)
  const moveList = useSelector((state: RootState) => state.game.moveList)
  const currentNode = moveList.map(mv => mv.san).join(',')

  const nodeHeight = nodeHeightScale(height);
  const nodeWidth = nodeWidthScale(width);
  const treeWidth = treeWidthScale(width)
  const yMax = height - margin.top - margin.bottom;
  const xMax = width - margin.left - margin.right;

  const root = useMemo(() => {
    const generateGameTree = (
      moveNode: MoveNode,
      chess: Chess,
      opening?: BookNode,
    ): TreeNode => {
      // make node name from move history
      const name = chess.history().join(',')
      // get list of legal moves from current position
      const moves = chess.moves()
      // create tree nodes for children
      const children: TreeNode[] = []
      moves.forEach(san => {
        // get opening for child if any
        const childOpening = opening?.children?.find(n => n.move === san)

        // if move exists in moveTree, recurse
        const madeMove = moveNode.children.find(n => moveTree[n].move?.san === san)
        if (madeMove !== undefined) {
          chess.move(san)
          children.push(generateGameTree(moveTree[madeMove], chess, childOpening))
          chess.undo()
        } else if (childOpening) {
          // if move exists in opening, add it
          const move = chess.move(san)
          children.push({
            name: `${name},${san}`,
            attributes: {
              move,
              code: childOpening.code,
              name: childOpening.name,
              wins: childOpening.wins,
              draws: childOpening.draws,
              losses: childOpening.losses,
            }
          })
          chess.undo()
        }
        // add legal moves?
        // else if (moveKey === moveNode.key) {
        //   const move = chess.move(san)
        //   children.push({ name, attributes: { move } })
        //   chess.undo()
        // }
      })

      return {
        name,
        children,
        attributes: {
          move: moveNode.move || undefined,
          name: opening?.name,
          code: opening?.code,
          wins: opening?.wins,
          draws: opening?.draws,
          losses: opening?.losses,
        },
      }
    };
    
    const chess = new Chess()
    const tree = generateGameTree(moveTree[0], chess, openings)
    return hierarchy(tree)
  }, [moveTree, openings, moveKey])

  function currentNodeTranslation(matrix: TransformMatrix) {
    const node = root.descendants().find(node => node.data.name === currentNode);
    return {
      // @ts-ignore
      translateX: (-node?.y * matrix.scaleX) + (xMax / 3),
      // @ts-ignore
      translateY: (-node?.x * matrix.scaleY) + (yMax / 2),
    }
  }

  return (
    <div ref={parentRef} className='w-full h-full border-l border-gray-400 overflow-hidden bg-white'>
      <Zoom<SVGSVGElement>
        width={width}
        height={height}
        scaleXMin={1 / 4}
        scaleYMin={1 / 4}
        scaleXMax={2}
        scaleYMax={2}
      >
        {(zoom) => {
          useEffect(() => {
            zoom.setTranslate(currentNodeTranslation(zoom.transformMatrix))
          }, [currentNode, xMax, yMax])

          return (
            <div className='relative'>
              <svg
                width={width}
                height={height}
                style={{ cursor: zoom.isDragging ? 'grabbing' : 'grab', touchAction: 'none' }}
                ref={zoom.containerRef}
              >
                <g transform={zoom.toString()}>
                  <Tree<TreeNode> root={root} nodeSize={[nodeHeight+5, treeWidth]} >
                    {(tree) => (
                      <Group top={margin.top} left={margin.left}>
                        {tree.links().map((link, i) => (
                          <LinkHorizontal
                            key={`link-${i}`}
                            path={({ source, target }) => {
                              const midY = source.y + (target.y - source.y) * 0.5;
                              return `M${source.y},${source.x}L${midY},${source.x}C${midY},${target.x},${midY},${target.x},${target.y},${target.x}`
                            }}
                            data={link}
                            stroke='black'
                            strokeWidth={link.target.children?.length}
                            strokeLinejoin='round'
                            fill="none"
                          />
                        ))}
                        {tree.descendants().map((node, i) => (
                          <Node
                            key={`node-${i}`}
                            node={node}
                            width={nodeWidth}
                            height={nodeHeight}
                            isHighlighted={currentNode === node.data.name}
                          />
                        ))}
                      </Group>
                    )}
                  </Tree>
                </g>
              </svg>
              <div className="absolute top-1 right-1 flex flex-col gap-1">
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => zoom.setTranslate(currentNodeTranslation(zoom.transformMatrix))}
                >to current</button>
              </div>
            </div>
          )
        }} 
      </Zoom>
    </div>
  );
}
