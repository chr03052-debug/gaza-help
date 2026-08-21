# Content review policy

Before changing humanitarian information:

1. Open the official source and record the review time in `verified_at`.
2. Confirm Arabic and Japanese titles and bodies describe the same claim.
3. Do not publish precise personal locations, unconfirmed routes, or personal contact details.
4. Treat medical and important records as overdue after 14 days; food and aid records after 30 days.
5. Ask a fluent Arabic reviewer to check new or materially changed Arabic wording. Do not label machine-only review as native review.
6. Change one factual record at a time and verify the deployed card after merge.

Automated checks validate structure and review age. They do not prove that a service is currently available or safe to reach.

## Arabic review gate

A pull request that changes Arabic text must not merge until:

1. a fluent human reviewer checks meaning, tone, dialect suitability, and safety;
2. the reviewer and date are recorded in the pull request without sensitive personal details;
3. the `arabic-reviewed` label is added by a maintainer.

The automated gate only proves that the label exists. It does not prove the quality or identity of the reviewer. Machine translation and automated review do not satisfy this requirement.

## Exceptional owner waiver

If publication proceeds without fluent Arabic review, the repository owner must make an explicit, PR-specific decision after being informed of the limitation. Record it in `.github/ARABIC_REVIEW_WAIVER` with the pull request number, date, scope, and reason. A waiver applies only to that pull request and must never be described as human Arabic review.
