import json
from playwright.sync_api import sync_playwright

learner = {
    "id": 7,
    "openId": "hint-ui-learner",
    "name": "Hint UI Learner",
    "email": "learner@example.com",
    "loginMethod": "test",
    "role": "user",
    "createdAt": "2026-08-19T00:00:00.000Z",
    "updatedAt": "2026-08-19T00:00:00.000Z",
    "lastSignedIn": "2026-08-19T00:00:00.000Z",
}
mode = {"state": "success"}

def route_auth(route):
    route.fulfill(
        status=200,
        content_type="application/json",
        body=json.dumps([
            {"result": {"data": {"json": learner}}},
            {"result": {"data": {"json": []}}},
        ]),
    )

def route_hint(route):
    if mode["state"] == "success":
        body = {"result": {"data": {"json": {"hint": "Identify the comparison group, then ask whether anything besides the page design could explain the difference."}}}}
        route.fulfill(status=200, content_type="application/json", body=json.dumps(body))
    else:
        body = {"error": {"json": {"message": "A contextual hint is unavailable right now. Please try again.", "code": -32603, "data": {"code": "INTERNAL_SERVER_ERROR", "httpStatus": 500}}}}
        route.fulfill(status=500, content_type="application/json", body=json.dumps(body))

def route_practice_page(route):
    question = {
        "id": 60003,
        "questionId": "nexus-84-necessary-assumptions-009",
        "questionText": "A retailer compares purchase rates for visitors who see two checkout-page designs. Which assumption is required?",
        "optionA": "The redesigned page loads quickly.",
        "optionB": "The groups were offered the same products and prices.",
        "optionC": "The redesign will remain in use for a year.",
        "optionD": "Every demographic group was represented.",
        "optionE": "Most buyers were repeat visitors.",
        "correctAnswer": "B",
        "explanation": "The comparison needs comparable offers.",
        "category": "Necessary Assumptions",
        "difficulty": "medium",
        "source": "LSAT Nexus Original Curriculum Library",
    }
    results = [
        {"result": {"data": {"json": learner}}},
        {"result": {"data": {"json": {"questions": [], "total": 0}}}},
        {"result": {"data": {"json": []}}},
        {"result": {"data": {"json": question}}},
        {"result": {"data": {"json": []}}},
        {"result": {"data": {"json": {"uniqueQuestionsAttempted": 0, "outcomes": []}}}},
    ]
    route.fulfill(status=200, content_type="application/json", body=json.dumps(results))

def trpc_router(route):
    url = route.request.url
    if "practice.hint" in url:
        route_hint(route)
    elif "auth.me,flags.evaluate" in url:
        route_auth(route)
    elif "auth.me,questions.list" in url:
        route_practice_page(route)
    elif "practice.start" in url:
        route.fulfill(status=200, content_type="application/json", body=json.dumps({"result": {"data": {"json": {"recorded": True}}}}))
    else:
        route.continue_()

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 1280, "height": 720})
    page.on("request", lambda request: print(f"TRPC REQUEST {request.url}") if "/api/trpc/" in request.url else None)
    page.on("response", lambda response: print(f"TRPC RESPONSE {response.status} {response.url}") if "/api/trpc/" in response.url else None)
    page.route("**/api/trpc/**", trpc_router)
    page.goto("http://localhost:3000/practice?question=60003", wait_until="domcontentloaded")
    page.wait_for_timeout(2_000)
    hint_button = page.get_by_role("button", name="Get a contextual hint")
    try:
        hint_button.wait_for(timeout=15_000)
    except Exception:
        print("BODY", page.locator("body").inner_text()[:2_000])
        page.screenshot(path="/tmp/practice-hint-ui-auth-debug.png", full_page=True)
        raise
    assert not hint_button.is_disabled(), "Authenticated learner should be able to request a hint."

    hint_button.click()
    page.get_by_text("Identify the comparison group", exact=False).wait_for(timeout=10_000)

    mode["state"] = "error"
    hint_button.click()
    page.get_by_text("A hint could not be generated safely. Please try again.").wait_for(timeout=10_000)
    print("Rendered contextual-hint success and retry states verified.")
    browser.close()
