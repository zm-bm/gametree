import { startAppListening } from "../listener";
import { engine, ui } from "../slices";
import { selectEngineRunning } from "../selectors";
import { isAnyOf } from "@reduxjs/toolkit";
import { startEngine, stopEngine } from "../../worker";

startAppListening({
  matcher: isAnyOf(
    ui.actions.toggleEngine,
    ui.actions.setEngineHash,
    ui.actions.setEngineThreads,
    ui.actions.setCurrent,
  ),
  effect: async (_, listenerApi) => {
    const { dispatch, getState } = listenerApi;
    dispatch(engine.actions.clearEngineOutput());

    const state = getState();
    const running = selectEngineRunning(state);

    if (running) {
      startEngine();
    } else {
      stopEngine();
    }
  },
});

startAppListening({
  actionCreator: engine.actions.reportEngineError,
  effect: async (action, listenerApi) => {
    const { dispatch } = listenerApi;
    console.error('Engine error:', action.payload);
    dispatch(ui.actions.toggleEngine());
  }
});
