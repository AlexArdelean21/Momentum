-- Advanced streak calculation functions for Momentum app

-- Function to calculate current streak for an activity
CREATE OR REPLACE FUNCTION calculate_current_streak(activity_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
    current_date DATE := CURRENT_DATE;
    streak_count INTEGER := 0;
    check_date DATE;
BEGIN
    -- Start from today and go backwards
    check_date := current_date;
    
    -- Check if there's an entry for each consecutive day
    WHILE EXISTS (
        SELECT 1 FROM activity_logs 
        WHERE activity_id = activity_uuid 
        AND date = check_date
        AND count > 0
    ) LOOP
        streak_count := streak_count + 1;
        check_date := check_date - INTERVAL '1 day';
    END LOOP;
    
    RETURN streak_count;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate best streak for an activity
CREATE OR REPLACE FUNCTION calculate_best_streak(activity_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
    max_streak INTEGER := 0;
    current_streak INTEGER := 0;
    prev_date DATE;
    log_record RECORD;
BEGIN
    -- Get all dates for this activity in chronological order
    FOR log_record IN 
        SELECT date FROM activity_logs 
        WHERE activity_id = activity_uuid 
        AND count > 0
        ORDER BY date ASC
    LOOP
        -- If this is the first record or consecutive day
        IF prev_date IS NULL OR log_record.date = prev_date + INTERVAL '1 day' THEN
            current_streak := current_streak + 1;
        ELSE
            -- Reset streak if not consecutive
            current_streak := 1;
        END IF;
        
        -- Update max streak if current is higher
        IF current_streak > max_streak THEN
            max_streak := current_streak;
        END IF;
        
        prev_date := log_record.date;
    END LOOP;
    
    RETURN max_streak;
END;
$$ LANGUAGE plpgsql;

-- Function to get activity stats (optimized for dashboard)
CREATE OR REPLACE FUNCTION get_activity_stats(activity_uuid UUID, target_date DATE DEFAULT CURRENT_DATE)
RETURNS TABLE(
    today_count INTEGER,
    total_days BIGINT,
    current_streak INTEGER,
    best_streak INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE((
            SELECT al.count 
            FROM activity_logs al 
            WHERE al.activity_id = activity_uuid 
            AND al.date = target_date
        ), 0) as today_count,
        
        COALESCE((
            SELECT COUNT(DISTINCT al.date)
            FROM activity_logs al 
            WHERE al.activity_id = activity_uuid 
            AND al.count > 0
        ), 0) as total_days,
        
        calculate_current_streak(activity_uuid) as current_streak,
        calculate_best_streak(activity_uuid) as best_streak;
END;
$$ LANGUAGE plpgsql;
