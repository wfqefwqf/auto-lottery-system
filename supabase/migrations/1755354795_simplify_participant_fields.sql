-- Migration: simplify_participant_fields
-- Created at: 1755354795

-- 简化参与者表结构，移除邮箱和手机号字段
ALTER TABLE participants 
DROP COLUMN IF EXISTS email,
DROP COLUMN IF EXISTS phone;;