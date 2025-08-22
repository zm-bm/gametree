import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import { Id, Move } from "../../shared/types";

const nav = createSlice({
  name: 'nav',
  initialState: {
  },
  reducers: {
    // intents (no-ops)
    navigateUp: () => {},
    navigateDown: () => {},
    navigatePrevSibling: () => {},
    navigateNextSibling: () => {},
    navigateToId: (_s, _a: PayloadAction<Id>) => {},
    commitMove: (_s, _a: PayloadAction<Move>) => {},
  }
});

export default nav;
