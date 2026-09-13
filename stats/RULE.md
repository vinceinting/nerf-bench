# The rule for calling a change real

Published 2026-09-13. Rule version 2026-09-13. The numbers below live in `stats/rule.cjs`; the code in `stats/` is the rule executed. This file changes only by a dated amendment appended at the end, and never after a result has been published without one.

## What is compared

Each series is one combination of app, model, effort, access path and app track. Nothing is ever pooled across two series.

**Baseline.** Every run started in the 7 days after the model's official release timestamp (days 1 to 7), pooled task by task. Once day 7 ends the baseline is frozen: runs that arrive later, whenever they started, never change it.

**Now.** Every run started in the 7 days ending at the moment of evaluation, never reaching back into the baseline week.

## The test

1. For each task that ran in both windows, take its pass rate now minus its pass rate in the baseline. The measured change is the average of those differences over the shared tasks. Pairing each task with itself removes the difference in difficulty between tasks.
2. If the task set has rotated since launch week, the change is carried across the overlap: during overlap every run executes both the outgoing and the incoming set, so the change is (outgoing set: overlap minus baseline) plus (incoming set: now minus overlap), summed through as many rotations as have happened.
3. The uncertainty is a 99% percentile bootstrap interval: the shared tasks are resampled with replacement 10,000 times, separately within each link of step 2, with a fixed published random seed (20260913) so anyone rerunning it gets the same interval.

## When a change is called real

All of these must hold. Otherwise the card reads "within normal variation".

- The 99% interval excludes zero (two-sided significance level 0.01; stricter than 0.05 because the verdict is re-evaluated every day).
- The measured change is at least 5 percentage points.
- The baseline and the current window each hold at least 3 runs.
- Every link of the comparison shares at least 20 tasks.

The headline then states only the size and direction of the measured change against launch week. It never states or suggests a cause.

## Chart bands

Each day on a chart is the pooled pass rate of that day's runs, with a Wilson 95% interval on the day's task attempts as its band. The band shows how noisy one day is; it is not the test above, which alone decides a verdict. Day one is shown as its own labelled point. Days without runs are left empty rather than filled in.

## What this rule cannot see

It measures pass rates on hidden, rotating real-world tasks. It cannot rule out a lab recognizing the tasks and handling them differently, and a run-to-run change can come from the app, the model or the service around it; markers on the chart show official events, not causes.

## Amendments

None.
