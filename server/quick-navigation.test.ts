import { describe, expect, it } from "vitest";
import { QUICK_ACTIONS } from "../client/src/components/QuickNavigation";

describe("QuickNavigation", () => {
  it("provides a unique stable label for every rendered action key", () => {
    const labels = QUICK_ACTIONS.map(action => action.label);

    expect(new Set(labels).size).toBe(labels.length);
  });

  it("allows distinct workflows to share a destination without sharing a key", () => {
    const questionBankActions = QUICK_ACTIONS.filter(action => action.route === "/question-bank");

    expect(questionBankActions.map(action => action.label)).toEqual(["Start Drill", "Analyze Errors"]);
  });
});
