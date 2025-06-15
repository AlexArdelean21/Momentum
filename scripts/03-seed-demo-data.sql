-- Seed demo data for testing (optional)
-- This creates a demo user and some sample activities

-- Insert demo user
INSERT INTO users (id, email, name, provider) 
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'demo@momentum.app',
    'Demo User',
    'demo'
) ON CONFLICT (email) DO NOTHING;

-- Insert demo activities
INSERT INTO activities (id, user_id, name, emoji, description) VALUES
(
    '10000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001',
    'Morning Exercise',
    '💪',
    '30 minutes of workout to start the day'
),
(
    '10000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000001',
    'Read Books',
    '📚',
    'Read for at least 20 minutes daily'
),
(
    '10000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000001',
    'Meditation',
    '🧘',
    'Daily mindfulness and meditation practice'
)
ON CONFLICT DO NOTHING;

-- Insert some demo activity logs (last 10 days)
INSERT INTO activity_logs (activity_id, user_id, date, count) 
SELECT 
    activity_id,
    '00000000-0000-0000-0000-000000000001',
    date_series,
    CASE 
        WHEN random() > 0.3 THEN floor(random() * 3 + 1)::integer
        ELSE 0
    END
FROM (
    SELECT 
        unnest(ARRAY[
            '10000000-0000-0000-0000-000000000001',
            '10000000-0000-0000-0000-000000000002',
            '10000000-0000-0000-0000-000000000003'
        ]) as activity_id,
        generate_series(
            CURRENT_DATE - INTERVAL '10 days',
            CURRENT_DATE,
            INTERVAL '1 day'
        )::date as date_series
) as demo_data
WHERE NOT EXISTS (
    SELECT 1 FROM activity_logs 
    WHERE activity_id = demo_data.activity_id 
    AND date = demo_data.date_series
);
