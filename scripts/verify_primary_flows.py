import json
import os
from pathlib import Path

from playwright.sync_api import sync_playwright


BASE_URL = os.environ.get(
    "LSAT_NEXUS_TEST_URL",
    "https://3000-ik9piw1hyhy8iknm1c68z-cc398852.us2.manus.computer",
).rstrip("/")
OUTPUT_PATH = Path("artifacts/primary-flow-verification.json")


def ensure_text(page, expected_text: str) -> None:
    page.get_by_text(expected_text, exact=False).first.wait_for(state="visible", timeout=15_000)


with sync_playwright() as playwright:
    browser = playwright.chromium.launch(
        headless=True,
        executable_path=os.environ.get("CHROMIUM_EXECUTABLE", "/usr/bin/chromium"),
    )
    page = browser.new_page(viewport={"width": 1440, "height": 1000})
    results = []

    for path, expected_text, label in [
        ("/", "Choose Your Learning Path", "public landing page"),
        ("/about", "Devaney", "public instructor page"),
        ("/booking", "Book", "public booking page"),
        ("/dashboard", "Sign in to continue learning", "protected dashboard guard"),
        ("/question-bank", "Sign in to continue learning", "protected practice guard"),
    ]:
        page.goto(f"{BASE_URL}{path}", wait_until="networkidle")
        ensure_text(page, expected_text)
        results.append({"flow": label, "path": path, "status": "passed", "title": page.title()})

    response = page.request.get(
        f"{BASE_URL}/api/trpc/questions.list",
        params={"input": json.dumps({"json": {"limit": 200, "offset": 0}})},
    )
    payload = response.json()
    payload_text = json.dumps(payload)
    for suffix in range(1, 6):
        assert f"nexus-lr-sample-{suffix:03d}" in payload_text
    results.append({"flow": "Question Bank sample catalog", "path": "/api/trpc/questions.list", "status": "passed"})

    screenshot_path = Path("artifacts/primary-flow-landing.png")
    screenshot_path.parent.mkdir(parents=True, exist_ok=True)
    page.goto(f"{BASE_URL}/", wait_until="networkidle")
    page.screenshot(path=str(screenshot_path), full_page=True)

    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT_PATH.write_text(json.dumps({"baseUrl": BASE_URL, "results": results}, indent=2), encoding="utf-8")
    browser.close()

print(json.dumps({"baseUrl": BASE_URL, "verified": len(results)}, indent=2))
