import { describe, expect, it } from "vitest";
import treeSlice, { AddOpenings, initialState, SetDataSource } from "../../redux/treeSlice";
import { treeNode, openings } from "../testData";

describe('treeSlice', () => {
  it('clears tree on SetDataSource', () => {
    expect(treeSlice(initialState, SetDataSource('lichess'))).toMatchObject({
      root: null,
      source: 'lichess',
    })
  });

  it('builds tree on SetDataSource', () => {
    expect(treeSlice(initialState, AddOpenings({
      openingStats: openings, 
      moves: [],
    }))).toMatchObject({
      root: treeNode,
    })
  });
});
