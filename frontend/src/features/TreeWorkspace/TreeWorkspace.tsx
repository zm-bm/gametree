import TreeView from '@/features/TreeView';

import BoardDock from './BoardDock';
import './TreeWorkspace.css';

const TreeWorkspace = () => (
  <div className="gt-tree-workspace" data-testid="tree-workspace">
    <TreeView />
    <BoardDock />
  </div>
);

export default TreeWorkspace;
