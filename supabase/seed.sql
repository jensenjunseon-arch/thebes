-- Seed data for local development and staging.
-- The demo problem must stay in sync with lib/demo.ts — both files reference
-- the same forbidden_answer_tokens value ("48").

insert into problems (
  id,
  topic,
  difficulty,
  statement_en,
  statement_ko,
  canonical_solution,
  forbidden_answer_tokens
) values (
  'b7c2e1f0-0000-0000-0000-000000000001',  -- stable id for the demo route
  'Ratios',
  '중2',
  'A car travels from town A to town B at 40 km/h and returns at 60 km/h. What is its average speed for the whole trip?',
  '자동차가 A에서 B까지는 40km/h, 돌아올 때는 60km/h로 갑니다. 왕복 평균 속력은?',
  'Let d = one-way distance. Total time = d/40 + d/60 = 5d/120 = d/24. Total distance = 2d. Average speed = 2d / (d/24) = 48 km/h. The harmonic mean of 40 and 60 equals 2·40·60/(40+60) = 48.',
  ARRAY['48', '48 km/h', '48km/h']
);
