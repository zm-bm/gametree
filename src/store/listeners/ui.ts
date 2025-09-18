import { playMoveSound } from "@/shared/lib/sound";
import { startAppListening } from "../listener";
import { selectBoardPromotionTarget } from "../selectors";
import { ui } from "../slices";

startAppListening({
  actionCreator: ui.actions.setCurrent,
  effect: async (_a, listenerApi) => {
    const { dispatch, getState } = listenerApi;
    const state = getState();
    const promotionTarget = selectBoardPromotionTarget(state);

    if (promotionTarget) dispatch(ui.actions.setPromotionTarget(null));
    playMoveSound();
  },
});
