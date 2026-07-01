import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
  type ComponentType,
  type ReactNode,
  type SyntheticEvent,
} from 'react';
import { createPortal } from 'react-dom';
import { BiCollapse, BiExpand } from 'react-icons/bi';
import { FaBookOpen, FaInfoCircle, FaMicrochip, FaTimes } from 'react-icons/fa';

import ChessBoard from '@/features/Hud/Board/ChessBoard';
import PositionSummary from '@/features/Hud/Panels/PositionSummary/PositionSummary';
import ToggleOrientationButton from '@/features/Hud/Board/ToggleOrientationButton';

import './BoardHud.css';

const EngineView = lazy(() => import('@/features/Hud/Panels/EngineView'));
const PositionTheory = lazy(() => import('@/features/Hud/Panels/PositionTheory/PositionTheory'));

const stopBoardHudEvent = (event: SyntheticEvent<HTMLElement>) => {
  event.stopPropagation();
};

type HudPanelId = 'summary' | 'engine' | 'theory';
type HudPanelDefinition = {
  id: HudPanelId;
  title: string;
  icon: ComponentType<{ 'aria-hidden'?: boolean }>;
  render: () => ReactNode;
};

const getHudPanelId = (panelId: HudPanelId) => `board-hud-panel-${panelId}`;
const getHudPanelTitleId = (panelId: HudPanelId) => `board-hud-panel-title-${panelId}`;

const HudPanelLoading = ({ label }: { label: string }) => (
  <div className="gt-board-hud-detail-loading" role="status">
    {label}
  </div>
);

const HUD_PANELS: HudPanelDefinition[] = [
  {
    id: 'summary',
    title: 'Summary',
    icon: FaInfoCircle,
    render: () => <PositionSummary />,
  },
  {
    id: 'engine',
    title: 'Engine',
    icon: FaMicrochip,
    render: () => (
      <Suspense fallback={<HudPanelLoading label="Loading engine..." />}>
        <EngineView />
      </Suspense>
    ),
  },
  {
    id: 'theory',
    title: 'Theory',
    icon: FaBookOpen,
    render: () => (
      <Suspense fallback={<HudPanelLoading label="Loading theory..." />}>
        <PositionTheory />
      </Suspense>
    ),
  },
];

const BoardHud = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [openPanels, setOpenPanels] = useState<Set<HudPanelId>>(() => new Set());
  const backButtonRef = useRef<HTMLButtonElement | null>(null);
  const expand = useCallback(() => setIsExpanded(true), []);
  const collapse = useCallback(() => setIsExpanded(false), []);
  const isPanelOpen = useCallback((panelId: HudPanelId) => openPanels.has(panelId), [openPanels]);
  const togglePanel = useCallback((panelId: HudPanelId) => {
    setOpenPanels((current) => {
      const next = new Set(current);
      if (next.has(panelId)) {
        next.delete(panelId);
      } else {
        next.add(panelId);
      }

      return next;
    });
  }, []);
  const closePanel = useCallback((panelId: HudPanelId) => {
    setOpenPanels((current) => {
      if (!current.has(panelId)) return current;
      const next = new Set(current);
      next.delete(panelId);
      return next;
    });
  }, []);
  const visiblePanels = HUD_PANELS.filter((panel) => openPanels.has(panel.id));

  useEffect(() => {
    if (isExpanded) backButtonRef.current?.focus();
  }, [isExpanded]);

  useEffect(() => {
    if (!isExpanded) return;

    const appRoot = document.getElementById('root');
    if (!appRoot) return;

    const hadInert = appRoot.hasAttribute('inert');
    const previousAriaHidden = appRoot.getAttribute('aria-hidden');

    appRoot.setAttribute('inert', '');
    appRoot.setAttribute('aria-hidden', 'true');

    return () => {
      if (!hadInert) appRoot.removeAttribute('inert');

      if (previousAriaHidden === null) {
        appRoot.removeAttribute('aria-hidden');
      } else {
        appRoot.setAttribute('aria-hidden', previousAriaHidden);
      }
    };
  }, [isExpanded]);

  useEffect(() => {
    if (!isExpanded) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') collapse();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [collapse, isExpanded]);

  return (
    <>
      <div
        className="gt-board-hud-region"
        data-testid="board-hud-region"
        onPointerDown={stopBoardHudEvent}
        onPointerMove={stopBoardHudEvent}
        onPointerUp={stopBoardHudEvent}
        onMouseDown={stopBoardHudEvent}
        onClick={stopBoardHudEvent}
        onTouchStart={stopBoardHudEvent}
        onWheel={stopBoardHudEvent}
        onContextMenu={stopBoardHudEvent}
      >
        <section
          className="gt-board-hud"
          data-testid="board-hud"
          aria-label="Current position board"
        >
          <div className="gt-board-hud-board" data-testid="board-hud-board">
            <ChessBoard className="gt-board-hud-board-surface" />
          </div>

          <div
            className="gt-board-hud-toolbar"
            data-testid="board-hud-toolbar"
            role="toolbar"
            aria-label="Board actions"
          >
            <ToggleOrientationButton />
            <button
              type="button"
              className="gt-board-hud-action gt-board-hud-expand-action"
              data-testid="board-hud-expand-action"
              aria-label="Expand board"
              onClick={expand}
            >
              <BiExpand aria-hidden="true" />
            </button>
          </div>

          <div
            className="gt-board-hud-detail-rail"
            data-testid="board-hud-detail-rail"
            role="toolbar"
            aria-label="Position detail panels"
          >
            {HUD_PANELS.map((panel) => {
              const Icon = panel.icon;
              const isOpen = isPanelOpen(panel.id);
              const actionLabel = `${isOpen ? 'Hide' : 'Show'} ${panel.title.toLowerCase()}`;

              return (
                <button
                  key={panel.id}
                  type="button"
                  className="gt-board-hud-action gt-board-hud-detail-toggle"
                  data-testid={`board-hud-detail-toggle-${panel.id}`}
                  aria-label={actionLabel}
                  aria-pressed={isOpen}
                  aria-expanded={isOpen}
                  aria-controls={getHudPanelId(panel.id)}
                  onClick={() => togglePanel(panel.id)}
                >
                  <Icon aria-hidden={true} />
                </button>
              );
            })}
          </div>
        </section>

        {visiblePanels.length > 0 ? (
          <div className="gt-board-hud-detail-stack" data-testid="board-hud-detail-stack">
            {visiblePanels.map((panel) => {
              return (
                <section
                  id={getHudPanelId(panel.id)}
                  key={panel.id}
                  className="gt-board-hud-detail-panel"
                  data-testid={`board-hud-detail-panel-${panel.id}`}
                  role="region"
                  aria-labelledby={getHudPanelTitleId(panel.id)}
                >
                  <div className="gt-board-hud-detail-header">
                    <h2 id={getHudPanelTitleId(panel.id)} className="gt-board-hud-detail-title">
                      {panel.title}
                    </h2>
                    <button
                      type="button"
                      className="gt-board-hud-detail-close"
                      aria-label={`Close ${panel.title.toLowerCase()} panel`}
                      onClick={() => closePanel(panel.id)}
                    >
                      <FaTimes aria-hidden="true" />
                    </button>
                  </div>
                  <div className="gt-board-hud-detail-body">
                    {panel.render()}
                  </div>
                </section>
              );
            })}
          </div>
        ) : null}
      </div>

      {isExpanded ? createPortal(
        <div
          className="gt-board-hud-inspect-layer"
          data-testid="board-hud-inspect-layer"
          aria-label="Expanded board inspector"
        >
          <div
            className="gt-board-hud-backdrop"
            data-testid="board-hud-backdrop"
            onClick={collapse}
          />
          <section
            className="gt-board-hud-panel"
            data-testid="board-hud-panel"
            role="dialog"
            aria-modal="true"
            aria-label="Board inspection"
            onPointerDown={stopBoardHudEvent}
            onPointerMove={stopBoardHudEvent}
            onPointerUp={stopBoardHudEvent}
            onMouseDown={stopBoardHudEvent}
            onClick={stopBoardHudEvent}
            onTouchStart={stopBoardHudEvent}
            onWheel={stopBoardHudEvent}
            onContextMenu={stopBoardHudEvent}
          >
            <div className="gt-board-hud-panel-header" data-testid="board-hud-panel-header">
              <h2 className="gt-board-hud-panel-title">Board inspection</h2>
              <div className="gt-board-hud-panel-actions" data-testid="board-hud-panel-actions">
                <ToggleOrientationButton />
                <button
                  ref={backButtonRef}
                  type="button"
                  className="gt-board-hud-header-action"
                  onClick={collapse}
                >
                  <BiCollapse size={14} aria-hidden="true" />
                  <span>Back to tree</span>
                </button>
              </div>
            </div>

            <div className="gt-board-hud-expanded-board" data-testid="board-hud-expanded-board">
              <ChessBoard className="gt-board-hud-board-surface" />
            </div>

            <div className="gt-board-hud-card gt-board-hud-summary">
              <PositionSummary />
            </div>
          </section>
        </div>,
        document.body,
      ) : null}
    </>
  );
};

export default BoardHud;
