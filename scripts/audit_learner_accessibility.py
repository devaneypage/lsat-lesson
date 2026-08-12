#!/usr/bin/env python3
"""Check baseline keyboard and accessible-name behavior for learner routes."""

from __future__ import annotations

import json
from pathlib import Path

from playwright.sync_api import sync_playwright


BASE_URL = "http://127.0.0.1:3000"
ROUTES = ("/today", "/resources")
OUTPUT = Path(__file__).resolve().parents[1] / "accessibility-audit.json"


def describe_focus(page):
    return page.evaluate(
        """() => {
          const el = document.activeElement;
          if (!el || el === document.body) return 'BODY';
          const name = (el.getAttribute('aria-label') || el.textContent || el.getAttribute('title') || '')
            .trim().replace(/\\s+/g, ' ').slice(0, 80);
          return `${el.tagName}:${name}`;
        }"""
    )


def audit_route(page, route, console_errors):
    page.goto(f"{BASE_URL}{route}", wait_until="networkidle")
    page.wait_for_timeout(300)
    is_authenticated_view = page.locator('#orientation-title').count() == 1
    result = {
        "route": route,
        "authenticated_view": is_authenticated_view,
        "protected_sign_in_shell": page.get_by_role("heading", name="Sign in to continue learning").count() == 1,
        "orientation_landmark_count": page.locator('[aria-labelledby="orientation-title"]').count(),
        "breadcrumb_count": page.locator('nav[aria-label="Breadcrumb"]').count(),
        "heading_count": page.locator('#orientation-title').count(),
        "unnamed_interactives": page.locator('a, button').evaluate_all(
            """elements => elements
              .filter(el => {
                const style = window.getComputedStyle(el);
                const hidden = el.hasAttribute('hidden') || style.display === 'none' || style.visibility === 'hidden';
                if (hidden) return false;
                const name = (el.getAttribute('aria-label') || el.getAttribute('title') || el.textContent || '').trim();
                return name.length === 0;
              })
              .map(el => el.outerHTML.slice(0, 180))"""
        ),
        "tab_stops": [],
    }
    page.locator('body').focus()
    for _ in range(min(5, page.locator('a, button').count())):
        page.keyboard.press("Tab")
        result["tab_stops"].append(describe_focus(page))
    result["console_errors"] = console_errors[:]
    return result


def main():
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(headless=True, executable_path="/usr/bin/chromium")
        page = browser.new_page(viewport={"width": 1280, "height": 720})
        console_errors = []
        page.on("console", lambda message: console_errors.append(message.text) if message.type == "error" else None)
        results = [audit_route(page, route, console_errors) for route in ROUTES]
        browser.close()

    failures = []
    for result in results:
        if result["authenticated_view"]:
            if result["orientation_landmark_count"] != 1:
                failures.append(f"{result['route']}: expected one orientation landmark")
            if result["breadcrumb_count"] != 1:
                failures.append(f"{result['route']}: expected one breadcrumb nav")
            if result["heading_count"] != 1:
                failures.append(f"{result['route']}: expected one orientation heading")
        elif not result["protected_sign_in_shell"]:
            failures.append(f"{result['route']}: expected the protected sign-in shell")
        if result["unnamed_interactives"]:
            failures.append(f"{result['route']}: found unnamed interactive controls")
        if "BODY" in result["tab_stops"]:
            failures.append(f"{result['route']}: keyboard focus remained on body")
        if result["console_errors"]:
            failures.append(f"{result['route']}: browser console errors detected")

    payload = {"results": results, "failures": failures}
    OUTPUT.write_text(json.dumps(payload, indent=2), encoding="utf-8")
    print(json.dumps(payload, indent=2))
    if failures:
        raise SystemExit(1)


if __name__ == "__main__":
    main()
