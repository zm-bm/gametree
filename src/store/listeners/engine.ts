import { startAppListening } from "../listener";
import { engine, ui } from "../slices";
import { selectEngineRunning } from "../selectors";
import { isAnyOf } from "@reduxjs/toolkit";
import { startEngine, stopEngine } from "../../worker";

startAppListening({
  matcher: isAnyOf(
    ui.actions.toggleEngine,
    ui.actions.setEngineRunning,
    ui.actions.setEngineHash,
    ui.actions.setEngineThreads,
    ui.actions.setCurrent,
  ),
  effect: async (action, listenerApi) => {
    const { dispatch, getState, getOriginalState } = listenerApi;

    const prevState = getOriginalState();
    const state = getState();
    const wasRunning = selectEngineRunning(prevState);
    const running = selectEngineRunning(state);

    const isSetCurrent = action.type === ui.actions.setCurrent.type;
    const isToggleEngine = action.type === ui.actions.toggleEngine.type;
    const isSetEngineRunning = action.type === ui.actions.setEngineRunning.type;
    const isSetEngineHash = action.type === ui.actions.setEngineHash.type;
    const isSetEngineThreads = action.type === ui.actions.setEngineThreads.type;

    const shouldClearOnStart =
      (isToggleEngine && running)
      || (isSetEngineRunning && action.payload === true)
      || ((isSetEngineHash || isSetEngineThreads) && running);

    if (isSetCurrent || shouldClearOnStart) {
      dispatch(engine.actions.clearEngineOutput());
    }

    if (running) {
      startEngine();
    } else if (wasRunning) {
      stopEngine();
    }
  },
});

startAppListening({
  actionCreator: engine.actions.reportEngineError,
  effect: async (action, listenerApi) => {
    const { dispatch } = listenerApi;
    console.error('Engine error:', action.payload);
    dispatch(ui.actions.setEngineRunning(false));
  }
});
