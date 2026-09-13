# Joint proposal, round 2 (NOT FILED: superseded by disposition version 2, digest b7d4ade1346c54c0, which repaired both points before this was filed)

run: c-mu06ff7r-mfcm66
series: prd-nerf-bench-review-2026-09-13, phase 1 of 1
answers: disposition of round 1, digest cb73c25340140151, Amendments 1 to 22 as landed in the PRD ledger
drafted by: fable; raised by astra (ref nerf-disposition-check-2), endorsed by grok and fable

Two narrow corrections to the LANDED text. Neither reopens a decision of Vince's: "wait for someone else's keys" stands, and no other amendment moves. Both land as further append-only ledger entries with the same `seam:` line.

## 1. R-71's proof record must bind a verified run and the key's payer (Amendment 22)

As landed, R-71's cell proves only that a proof record exists and names a supplier other than Vince. An executor-written record with a donor's name unlocks the API path for an app with no real API run behind it, and "supplier" is not "payer": a donor can hand over a key that Vince's account pays for.

Amendment (supersedes: R-71 text; R-71 cell description):

R-71 now reads: the site MUST refuse an API-path result for an app until that app's API path has been proved by a real attested run on that app, on the API path, on a key not paid for by Vince; the proof record MUST reference that run's attestation digest (R-06 identity), its app and its access path, and MUST name both who supplied the key and who pays for it, and the payer MUST NOT be Vince (D-09, D-39, amendment A3 to D-43).

Cell: on signed synthetic fixtures with no API spend, it fails unless each of these is refused: a proof record whose referenced digest does not verify; one whose digest verifies but whose run names another app; one whose referenced run used the subscription path; one naming Vince as payer under any supplier name. And it fails unless a record whose referenced run verifies for that app on the API path unlocks that app only, leaving every other app refused. Fixtures exercise the gate logic; the app's real readiness stays false until a real run on a non-Vince-paid key exists and is recorded.

## 2. Amendment 3 leaves the original fixture-data sentence in force against deployment (2)

Amendment 3 says the rest of the original Verification world paragraph "still holds" except the R-29 and R-66 sentences. The original paragraph also says fixture data is "kept in a separate fixture store that never reaches the staging or public data". Read literally, that forbids deployment (2), the disposable PUBLIC fixture deployment, from serving fixtures, so the cells Amendment 3 places there cannot run.

Amendment (supersedes: the Verification world's fixture-store sentence):

That sentence now reads: fixture data is kept in a separate fixture store that never reaches staging (1) or the production site; deployment (2) exists to serve it publicly, disposable and synthetic, and is torn down after the matrix run.

## Not reopened

V1 (Vince's "wait for someone else's keys"), every other amendment, and the parked debt file.
