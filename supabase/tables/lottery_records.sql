CREATE TABLE lottery_records (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    category_id UUID,
    participant_id UUID,
    participant_name VARCHAR(255) NOT NULL,
    prize_name VARCHAR(255) NOT NULL,
    lottery_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);