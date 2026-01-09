-- Migration 002: Onboarding System
-- Adds fields for onboarding wizard, social media links, usage tracking, and tenant pause/unpause

-- Add new columns to restaurants table
ALTER TABLE restaurants ADD COLUMN facebook_url TEXT;
ALTER TABLE restaurants ADD COLUMN instagram_handle TEXT;
ALTER TABLE restaurants ADD COLUMN tiktok_handle TEXT;
ALTER TABLE restaurants ADD COLUMN onboarding_completed BOOLEAN DEFAULT 0;
ALTER TABLE restaurants ADD COLUMN onboarding_completed_at DATETIME;
ALTER TABLE restaurants ADD COLUMN paused_at DATETIME;
ALTER TABLE restaurants ADD COLUMN paused_reason TEXT;

-- Create usage_metrics table for bandwidth and views tracking
CREATE TABLE IF NOT EXISTS usage_metrics (
  id TEXT PRIMARY KEY,
  restaurant_id TEXT NOT NULL,
  date DATE NOT NULL,
  page_views INTEGER DEFAULT 0,
  unique_visitors INTEGER DEFAULT 0,
  bandwidth_bytes BIGINT DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE,
  UNIQUE(restaurant_id, date)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_usage_metrics_restaurant_date ON usage_metrics(restaurant_id, date);
CREATE INDEX IF NOT EXISTS idx_restaurants_onboarding ON restaurants(onboarding_completed);
CREATE INDEX IF NOT EXISTS idx_restaurants_paused ON restaurants(paused_at);
