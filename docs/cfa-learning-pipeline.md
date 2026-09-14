# CFA Learning Pipeline

The CFA EPUB files in the project root are private study material. They are intentionally ignored by Git, along with generated output under `data/cfa.local/`.

## Import the books locally

```bash
npm run cfa:import
```

The importer extracts structured practice questions, options, answer markers, explanations, and source-book metadata. It deduplicates repeated material and marks records that still need answer-key review.

## How to reach 5,000 good questions

Do not create 5,000 near-duplicates by paraphrasing a paragraph. Build the bank in layers:

1. Import source questions as private references.
2. Split each reading into a topic map and learning objectives.
3. Generate new questions from one objective at a time: definition, calculation, interpretation, comparison, and scenario.
4. Require four options, one defensible answer, a worked explanation, difficulty, estimated time, and source location.
5. Run duplicate detection and numerical-answer checks.
6. Review every generated question before publishing it to the app.

The target is approximately 250 questions per major topic across 20 topics, with spaced repetition selecting questions the learner has not recently seen or has answered incorrectly. CFA source questions and answer explanations should remain private and should not be uploaded to the public Finzy repository.

## Product behavior

The app should show a short FYP-style lesson first, then one question. The learner can answer immediately, save the lesson, or continue. Each attempt should record topic, objective, difficulty, response, correctness, time, and last-seen date. The feed can then prioritize weak objectives and suppress recently seen questions.

For companies and countries, use a separate reviewed data model with dated sources: business model, financial statements, capital structure, competitive position, macro indicators, policy, and key risks. Every time-sensitive fact needs a source date and a review date.