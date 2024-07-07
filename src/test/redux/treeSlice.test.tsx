import { describe, expect, it } from "vitest";
import openingsTreeSlice, { AddOpenings, initialState, SetDataSource } from "../../redux/openingsTreeSlice";
import { treeNode, openings } from "../testData";

describe('openingsTreeSlice', () => {
  it('clears tree on SetDataSource', () => {
    expect(openingsTreeSlice({
      root: treeNode,
      source: 'masters'
    }, SetDataSource('lichess'))).toMatchObject({
      root: null,
      source: 'lichess',
    })
  });

  it('builds tree on SetDataSource', () => {
    expect(openingsTreeSlice(initialState, AddOpenings({
      openings, 
      moves: [],
    }))).toMatchObject({
      root: treeNode,
    })
  });
});
