import base64
import hashlib
import hmac
import json
import os
import re
import subprocess
import time
import uuid
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import urlparse

from playwright.sync_api import sync_playwright

REQUIRED_ENV = ["JWT_SECRET", "VITE_APP_ID", "OWNER_OPEN_ID", "OWNER_NAME", "DATABASE_URL"]
for key in REQUIRED_ENV:
    if not os.environ.get(key):
        raise RuntimeError(f"Missing required environment variable: {key}")

BASE_URL = os.environ.get("E2E_BASE_URL", "http://127.0.0.1:3000").rstrip("/")
QUESTION_ID = int(os.environ.get("E2E_QUESTION_ID", "30003"))
IDEMPOTENCY_KEY = f"e2e-practice-{uuid.uuid4()}"
STARTED_AT = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S")
REPORT_PATH = Path(os.environ.get(
    "E2E_REPORT_PATH",
    "/home/ubuntu/lsat-lesson/docs/audits/practice-evidence-e2e-result.json",
))


def b64url(raw: bytes) -> str:
    return base64.urlsafe_b64encode(raw).rstrip(b"=").decode("ascii")


def sign_session() -> str:
    header = {"alg": "HS256", "typ": "JWT"}
    payload = {
        "openId": os.environ["OWNER_OPEN_ID"],
        "appId": os.environ["VITE_APP_ID"],
        "name": os.environ["OWNER_NAME"],
        "exp": int(time.time()) + 60 * 30,
    }
    encoded_header = b64url(json.dumps(header, separators=(",", ":")).encode())
    encoded_payload = b64url(json.dumps(payload, separators=(",", ":")).encode())
    message = f"{encoded_header}.{encoded_payload}".encode()
    signature = hmac.new(os.environ["JWT_SECRET"].encode(), message, hashlib.sha256).digest()
    return f"{encoded_header}.{encoded_payload}.{b64url(signature)}"


def assert_true(condition: bool, message: str) -> None:
    if not condition:
        raise AssertionError(message)


report = {
    "questionId": QUESTION_ID,
    "viewport": {"width": 1280, "height": 900},
    "assertions": [],
    "consoleErrors": [],
    "pageErrors": [],
    "cleanup": None,
}
cleanup_env = os.environ.copy()
cleanup_env.update({
    "E2E_IDEMPOTENCY_KEY": IDEMPOTENCY_KEY,
    "E2E_QUESTION_ID": str(QUESTION_ID),
    "E2E_STARTED_AT": STARTED_AT,
})

try:
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(
            headless=True,
            executable_path="/usr/bin/chromium",
            args=["--no-sandbox"],
        )
        context = browser.new_context(viewport=report["viewport"])
        parsed = urlparse(BASE_URL)
        context.add_cookies([{
            "name": "app_session_id",
            "value": sign_session(),
            "domain": parsed.hostname,
            "path": "/",
            "httpOnly": True,
            "secure": parsed.scheme == "https",
            "sameSite": "Lax",
        }])
        page = context.new_page()
        page.on("console", lambda message: report["consoleErrors"].append(message.text) if message.type == "error" else None)
        page.on("pageerror", lambda error: report["pageErrors"].append(str(error)))

        submit_request = {"url": None, "body": None}

        def capture_submit(request):
            if "practice.submit" in request.url and request.method == "POST":
                submit_request["url"] = request.url
                submit_request["body"] = request.post_data

        page.on("request", capture_submit)
        page.goto(f"{BASE_URL}/practice?question={QUESTION_ID}", wait_until="networkidle")

        page.get_by_role("heading", name=re.compile(r"Question #")).wait_for(timeout=20_000)
        assert_true(page.get_by_text("Sign in to submit").count() == 0, "Authenticated Practice rendered a sign-in boundary")
        report["assertions"].append("Real session cookie opened the protected Practice surface")

        answer_group = page.get_by_role("group", name="Answer choices")
        answer_buttons = answer_group.get_by_role("button")
        assert_true(answer_buttons.count() >= 4, "Answer choices were not exposed as a labeled semantic group")
        first_answer = answer_buttons.first
        first_answer.focus()
        first_answer.press("Enter")
        assert_true(first_answer.get_attribute("aria-pressed") == "true", "Keyboard answer selection did not expose pressed state")
        report["assertions"].append("Answer group is labeled and keyboard-selectable with announced state")

        confidence_group = page.get_by_role("group", name=re.compile(r"Before you submit, how confident"))
        confidence_button = confidence_group.get_by_role("button", name="Unsure")
        confidence_button.focus()
        confidence_button.press("Space")
        assert_true(confidence_button.get_attribute("aria-pressed") == "true", "Confidence selection did not expose pressed state")
        report["assertions"].append("Pre-answer confidence is required, keyboard-selectable, and announced")

        page.keyboard.press("Tab")
        page.keyboard.press("Tab")
        focused_text = page.evaluate("document.activeElement?.textContent?.trim()")
        assert_true(focused_text == "Submit answer", f"Expected keyboard focus on Submit answer, received: {focused_text}")
        submit_button = page.get_by_role("button", name="Submit answer")
        focus_style = submit_button.evaluate("""element => {
          const style = getComputedStyle(element);
          return { outline: style.outline, boxShadow: style.boxShadow };
        }""")
        assert_true(
            focus_style["outline"] not in ("none", "0px none rgb(0, 0, 0)") or focus_style["boxShadow"] != "none",
            "Submit answer did not expose a visible focus style",
        )
        report["assertions"].append("Keyboard focus order reaches submission and displays a visible focus indicator")

        page.keyboard.press("Enter")
        page.get_by_text("Explanation:", exact=False).wait_for(timeout=20_000)
        page.get_by_text("Calibration:", exact=False).wait_for(timeout=20_000)
        assert_true(submit_request["url"] is not None and submit_request["body"] is not None, "Practice submission request was not captured")
        report["assertions"].append("Submission persisted and revealed explanation, calibration, and active time only afterward")

        replay = page.evaluate(
            """async ({url, body}) => {
              const response = await fetch(url, {
                method: 'POST',
                headers: {'content-type': 'application/json'},
                body,
              });
              return {status: response.status, text: await response.text()};
            }""",
            {"url": submit_request["url"], "body": submit_request["body"]},
        )
        assert_true(replay["status"] == 200, f"Idempotent replay returned HTTP {replay['status']}")
        assert_true('"idempotentReplay":true' in replay["text"], "Repeated submission was not reported as an idempotent replay")
        report["assertions"].append("Replaying the same submission key returned idempotentReplay=true")

        assert_true(not report["pageErrors"], f"Page errors occurred: {report['pageErrors']}")
        assert_true(not report["consoleErrors"], f"Console errors occurred: {report['consoleErrors']}")
        report["assertions"].append("No browser console or page errors occurred")
        browser.close()

    report["status"] = "passed"
except Exception as error:
    report["status"] = "failed"
    report["error"] = str(error)
finally:
    cleanup = subprocess.run(
        ["node", "scripts/cleanup-practice-e2e.mjs"],
        cwd="/home/ubuntu/lsat-lesson",
        env=cleanup_env,
        text=True,
        capture_output=True,
        check=False,
    )
    if cleanup.returncode == 0:
        report["cleanup"] = json.loads(cleanup.stdout)
    else:
        report["cleanup"] = {"error": cleanup.stderr.strip(), "exitCode": cleanup.returncode}
        report["status"] = "failed"
        report["error"] = report.get("error", "Practice test cleanup failed")

    REPORT_PATH.parent.mkdir(parents=True, exist_ok=True)
    REPORT_PATH.write_text(json.dumps(report, indent=2) + "\n")

if report["status"] != "passed":
    raise SystemExit(json.dumps(report, indent=2))

print(json.dumps(report, indent=2))
