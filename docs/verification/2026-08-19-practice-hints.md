# Contextual Hint Verification

The protected **Get a contextual hint** action appears between confidence capture and answer submission in the learner practice card. At desktop width, the control, non-disclosure statement, and submission action form a clear sequence without competing with answer selection. At 390px mobile width, the same controls remain full-width, legible, and reachable after the answer options and confidence choices, with no horizontal overflow.

The hint action is intentionally unavailable to unauthenticated visitors because generation occurs through the protected learner-practice contract. Its adjacent microcopy explains the instructional boundary: hints direct reasoning but do not reveal an answer choice or the full explanation.

The server sends the model only the question stem and category—never answer choices, the credited answer, or the explanation. A prompt-level prohibition and deterministic output sanitizer reject answer-letter and answer-revealing language. Router contracts verify a successful answer-safe hint, a missing-question response that never invokes the model, and a safe retryable error when generation fails.

One live protected generation used persisted question `60003` and returned: “Focus on whether any differences between the two groups of website visitors—other than the design of the checkout page itself—could have caused the variation in purchase rates.” The output passed the answer-safety validator and demonstrates the intended learner-facing reasoning clue without revealing an option, credited answer, or full explanation.

The protected `practice.hint` procedure was also invoked live with persisted learner context and the same question. It returned an independently generated, sanitized clue about differences between the visitor groups, confirming the protected mutation boundary—not merely the underlying service—handles the answer-safe response correctly.

An authenticated browser-level verification then exercised the rendered learner control with the surrounding practice-page contracts mocked at the tRPC boundary. It confirmed a successful contextual-hint panel renders after a `200` mutation response and the retryable “A hint could not be generated safely. Please try again.” state renders after a `500` mutation response.

Finally, a real authenticated learner session opened the `nexus-84-necessary-assumptions-008` practice item and invoked **Get a contextual hint**. The UI rendered the answer-safe clue, “Focus on the gap between the local origin of the exhibit's sculptures and the prediction that it will draw a larger local audience than the previous photography exhibit,” without identifying an option, credited answer, or full explanation.
