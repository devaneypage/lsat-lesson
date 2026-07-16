import { describe, expect, it } from "vitest";
import {
  ADMIN_NAV_ROUTES,
  APP_ROUTES,
  canonicalizeAppPath,
  LEARNER_NAV_ROUTES,
  resolveAppRoute,
  getRouteAccessDecision,
} from "../client/src/lib/routes";

describe("application route registry", () => {
  it("keeps route ids, canonical paths, and aliases unique", () => {
    const ids = APP_ROUTES.map(route => route.id);
    const paths = APP_ROUTES.map(route => route.path);
    const aliases = APP_ROUTES.flatMap(route => route.aliases ?? []);

    expect(new Set(ids).size).toBe(ids.length);
    expect(new Set(paths).size).toBe(paths.length);
    expect(new Set(aliases).size).toBe(aliases.length);
    expect(aliases.some(alias => paths.includes(alias))).toBe(false);
  });

  it("canonicalizes exact aliases while preserving query strings and hashes", () => {
    expect(canonicalizeAppPath("/dashboard")).toBe("/today");
    expect(canonicalizeAppPath("/question-bank?difficulty=hard#results"))
      .toBe("/practice?difficulty=hard#results");
    expect(canonicalizeAppPath("/lesson-plan-generator")).toBe("/plan");
  });

  it("canonicalizes nested legacy lesson paths without losing the suffix", () => {
    expect(canonicalizeAppPath("/lessons/formal-logic"))
      .toBe("/learn/formal-logic");
    expect(resolveAppRoute("/learn/formal-logic")?.id).toBe("learn");
  });

  it("separates learner and administrator navigation destinations", () => {
    expect(LEARNER_NAV_ROUTES.every(route => route.audience === "learner")).toBe(true);
    expect(ADMIN_NAV_ROUTES.every(route => route.audience === "admin")).toBe(true);
    expect(LEARNER_NAV_ROUTES.some(route => route.path.startsWith("/admin"))).toBe(false);
    expect(ADMIN_NAV_ROUTES.every(route => route.path.startsWith("/admin"))).toBe(true);
  });

  it("resolves public, authenticated, and administrator access explicitly", () => {
    expect(getRouteAccessDecision("public", null)).toBe("allow");
    expect(getRouteAccessDecision("learner", null)).toBe("sign-in");
    expect(getRouteAccessDecision("learner", "user")).toBe("allow");
    expect(getRouteAccessDecision("admin", "user")).toBe("forbidden");
    expect(getRouteAccessDecision("admin", "admin")).toBe("allow");
  });
});
