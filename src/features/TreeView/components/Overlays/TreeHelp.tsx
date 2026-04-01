import { useCallback, useEffect, useState } from "react";
import { HierarchyPointNode } from "@visx/hierarchy/lib/types";

import { cn } from "@/shared/lib/cn";
import { TreeViewNode } from "@/shared/types";
import { TreeDimensionsContext } from "../../context/TreeDimensionsContext";
import { TreeNode } from "../TreeNode";

import { HelpModal } from "./HelpModal";
import { SVGDefs } from "../SVGDefs";

const HELP_SEEN_STORAGE_KEY = "gtTreeHelpSeen";

const getShouldAutoOpenHelp = () => {
  try {
    return window.localStorage.getItem(HELP_SEEN_STORAGE_KEY) !== "1";
  } catch {
    return true;
  }
};

const markHelpSeen = () => {
  try {
    window.localStorage.setItem(HELP_SEEN_STORAGE_KEY, "1");
  } catch {
    // Ignore storage failures; help can still be dismissed for this session.
  }
};

const keyClass = cn([
  "inline-flex items-center justify-center min-w-6 h-6 px-1 rounded",
  "text-[12px] font-semibold leading-none",
  "border border-lightmode-900/30 dark:border-darkmode-100/30",
  "bg-lightmode-200/60 dark:bg-darkmode-800/60",
  "text-lightmode-800 dark:text-darkmode-100",
]);

const shortcutLabelClass = "text-sm";

const HELP_DEMO_SOURCE_STATS = {
  white: 42,
  draws: 31,
  black: 27,
  total: 100,
};

const HELP_DEMO_PARENT_NODE: TreeViewNode = {
  id: "help-parent",
  childrenLoaded: true,
  loading: false,
  move: null,
  edgeStats: {
    otb: HELP_DEMO_SOURCE_STATS,
    online: HELP_DEMO_SOURCE_STATS,
  },
  positionStats: {
    otb: HELP_DEMO_SOURCE_STATS,
    online: HELP_DEMO_SOURCE_STATS,
  },
  white: 480,
  draws: 260,
  black: 260,
  total: 1000,
  children: [],
  childCount: 1,
};

const HELP_DEMO_NODE: TreeViewNode = {
  id: "help-node",
  childrenLoaded: true,
  loading: false,
  move: {
    color: "w",
    from: "g1",
    to: "f3",
    piece: "n",
    san: "Nf3",
    lan: "g1f3",
    before: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
    after: "rnbqkb1r/pppppppp/5n2/8/8/5N2/PPPPPPPP/RNBQKB1R b KQkq - 1 1",
  },
  edgeStats: {
    otb: { white: 73, draws: 64, black: 47, total: 184 },
    online: { white: 96, draws: 58, black: 30, total: 184 },
  },
  positionStats: {
    otb: { white: 85, draws: 72, black: 51, total: 208 },
    online: { white: 112, draws: 64, black: 32, total: 208 },
  },
  white: 73,
  draws: 64,
  black: 47,
  total: 184,
  children: [],
  childCount: 0,
};

const HELP_DEMO_POINT_NODE = {
  data: HELP_DEMO_NODE,
  parent: { data: HELP_DEMO_PARENT_NODE },
  x: 0,
  y: 0,
} as HierarchyPointNode<TreeViewNode>;

const KeyCombo = ({ keys }: { keys: string[] }) => (
  <span className="inline-flex items-center gap-1">
    {keys.map((key) => (
      <kbd key={key} className={keyClass}>{key}</kbd>
    ))}
  </span>
);

const HelpMarker = ({
  label,
  className,
}: {
  label: string;
  className: string;
}) => (
  <div className={cn(
    "absolute rounded-full bg-lightmode-900 text-lightmode-50 dark:bg-darkmode-50 dark:text-darkmode-900",
    "text-[11px] font-semibold px-2 py-0.5 leading-none",
    className,
  )}>
    {label}
  </div>
);

const AnnotatedNode = () => {
  return (
    <div className="grid gap-5 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] md:items-center">
      <div className="relative mx-auto w-full max-w-[356px] rounded-lg border border-lightmode-900/20 dark:border-darkmode-100/20 bg-lightmode-50/70 dark:bg-darkmode-800/60 p-3">
        <svg
          viewBox="0 0 340 200"
          className="absolute inset-0 w-full h-full pointer-events-none"
          aria-hidden="true"
        >
          <defs>
            <marker
              id="help-arrowhead"
              markerWidth="7"
              markerHeight="7"
              refX="6"
              refY="3.5"
              orient="auto"
              markerUnits="strokeWidth"
            >
              <path d="M0,0 L7,3.5 L0,7 z" fill="rgba(148,163,184,0.82)" />
            </marker>
          </defs>

          <g
            stroke="rgba(148,163,184,0.78)"
            strokeWidth="1.25"
            fill="none"
            strokeLinecap="round"
            markerEnd="url(#help-arrowhead)"
          >
            <path d="M28 102 L102 102" />
            <path d="M170 20 L170 50" />
            <path d="M316 96 L196 96" />
            <path d="M290 176 L240 156" />
          </g>
        </svg>

        <HelpMarker label="A" className="top-1/2 left-2 -translate-y-[20%]" />
        <HelpMarker label="B" className="top-2 left-1/2 -translate-x-1/2" />
        <HelpMarker label="C" className="top-1/2 right-2 -translate-y-[70%]" />
        <HelpMarker label="D" className="bottom-2 right-8" />

        <TreeDimensionsContext.Provider
          value={{
            width: 320,
            height: 180,
            treeColumnSpacing: 56,
            treeRowSpacing: 28,
            treeNodeSpacing: [56, 28],
            nodeRectSize: 120,
            fontSize: 30,
            nodeRadius: 60,
          }}
        >
          <svg
            viewBox="0 0 320 180"
            className="w-full h-auto pointer-events-none"
            role="img"
            aria-label="Example tree node"
          >
            <SVGDefs />
            <g transform="translate(160 92)">
              <TreeNode node={HELP_DEMO_POINT_NODE} x={0} y={0} showButtonDrawer={false} />
            </g>
          </svg>
        </TreeDimensionsContext.Provider>
      </div>

      <div className="space-y-1.5 text-sm text-lightmode-800/90 dark:text-darkmode-200/90 md:self-stretch md:flex md:flex-col md:justify-center">
        <p><span className="font-semibold">A</span> Node card: click to jump to this move in the line.</p>
        <p><span className="font-semibold">B</span> Move frequency from the parent position.</p>
        <p><span className="font-semibold">C</span> Move label in normal chess notation.</p>
        <p><span className="font-semibold">D</span> W/D/L bar: win, draw, and loss rates for this move.</p>
      </div>
    </div>
  );
};

export const TreeHelp = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (getShouldAutoOpenHelp()) {
      setIsOpen(true);
    }
  }, []);

  const openHelp = useCallback(() => {
    setIsOpen(true);
  }, []);

  const closeHelp = useCallback(() => {
    markHelpSeen();
    setIsOpen(false);
  }, []);

  return (
    <>
      <button
        type="button"
        className="treeview-card px-3 py-1.5 text-sm font-semibold interactive-treeview"
        aria-label="Open help"
        onClick={openHelp}
      >
        Help
      </button>

      <HelpModal
        isOpen={isOpen}
        title="Tree Help"
        onClose={closeHelp}
        maxWidthClassName="max-w-4xl"
      >
        <section className="text-sm text-lightmode-800/85 dark:text-darkmode-200/85">
          Explore the game tree of chess from the current position, including the most common continuations and how they score.
        </section>

        <section>
          <h3 className="text-base font-semibold mb-2">Reading a node</h3>
          <AnnotatedNode />
        </section>

        <section className="pt-1 border-t border-lightmode-900/10 dark:border-darkmode-100/10">
          <h3 className="text-base font-semibold mb-2">Node and edge visuals</h3>
          <ul className="space-y-1.5 text-sm text-lightmode-800/90 dark:text-darkmode-200/90">
            <li>Each edge is a legal next move from the current position.</li>
            <li>Thicker edges mean the move is played more often. Thin edges are rarer sidelines.</li>
            <li>Edge color reflects results: better-performing moves look cooler, worse ones warmer.</li>
            <li>A small <span className="font-semibold text-amber-600 dark:text-amber-300">T</span> means the same position can also be reached by a different move order.</li>
            <li>Pinned nodes keep important positions easy to find again while exploring.</li>
          </ul>
        </section>

        <section className="pt-1 border-t border-lightmode-900/10 dark:border-darkmode-100/10">
          <h3 className="text-base font-semibold mb-2">How to use</h3>
          <ol className="space-y-1.5 text-sm text-lightmode-800/90 dark:text-darkmode-200/90 list-decimal pl-4">
            <li>Start from the current board position and click a node to follow that move.</li>
            <li>Use thick edges to understand the mainline first, then branch into thinner sidelines.</li>
            <li>Compare moves by frequency, edge color, and the W/D/L bar together.</li>
            <li>Use Tree Settings to change the data source and how results are compared.</li>
            <li>Hover a node for quick actions like pinning, copying FEN, or opening Lichess.</li>
          </ol>
        </section>

        <section className="pt-1 border-t border-lightmode-900/10 dark:border-darkmode-100/10">
          <h3 className="text-base font-semibold mb-2 text-center">Keyboard shortcuts</h3>
          <div className="mx-auto grid grid-cols-[max-content_auto] justify-start gap-x-4 gap-y-1.5 w-fit">
            <span className={shortcutLabelClass}>Previous sibling</span>
            <KeyCombo keys={["↑", "k"]} />

            <span className={shortcutLabelClass}>Next sibling</span>
            <KeyCombo keys={["↓", "j"]} />

            <span className={shortcutLabelClass}>Go to parent</span>
            <KeyCombo keys={["←", "h"]} />

            <span className={shortcutLabelClass}>Go to child</span>
            <KeyCombo keys={["→", "l"]} />

            <span className={shortcutLabelClass}>Toggle engine</span>
            <KeyCombo keys={["e"]} />

            <span className={shortcutLabelClass}>Pin or unpin current</span>
            <KeyCombo keys={["p"]} />
          </div>
        </section>
      </HelpModal>
    </>
  );
};
