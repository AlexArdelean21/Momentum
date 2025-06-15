-- Function to calculate current streak
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
    ) LOOP
        streak_count := streak_count + 1;
        check_date := check_date - INTERVAL '1 day';
    END LOOP;
    
    RETURN streak_count;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate best streak
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
