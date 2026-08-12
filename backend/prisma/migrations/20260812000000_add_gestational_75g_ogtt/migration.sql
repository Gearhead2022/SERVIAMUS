-- Add a distinct catalog test for future gestational 75g OGTT requests.
-- Existing 2H-OGTT and OGTT 75G rows are deliberately left unchanged so
-- historical laboratory records retain their current schema resolution.
INSERT INTO `laboratory_tests` (`name`, `category`, `schema_key`)
SELECT '2H-OGTT Gestational', 'Clinical_Chemistry', 'twohOGTTv2'
WHERE NOT EXISTS (
  SELECT 1
  FROM `laboratory_tests`
  WHERE `name` = '2H-OGTT Gestational'
);

-- Give the new test a billable service using the legacy 2H-OGTT price.
INSERT INTO `services` (
  `reference_id`,
  `category`,
  `service_name`,
  `price`,
  `date`,
  `created_at`,
  `updated_at`
)
SELECT
  `test_id`,
  'LABORATORY',
  '2H-OGTT Gestational',
  320.00,
  CURRENT_DATE,
  NOW(),
  NOW()
FROM `laboratory_tests`
WHERE `name` = '2H-OGTT Gestational'
  AND NOT EXISTS (
    SELECT 1
    FROM `services`
    WHERE `service_name` = '2H-OGTT Gestational'
  );
