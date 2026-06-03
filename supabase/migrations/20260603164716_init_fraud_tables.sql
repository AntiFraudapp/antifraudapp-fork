/*
  # Initialize AntiFraudApp Database

  1. New Tables
    - `fraud_reports` - Reports submitted by users about fraudulent activities
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `target_type` (text) - Type of fraud target: email, phone, link, crypto, message
      - `target` (text) - The fraudulent target (email, phone number, etc.)
      - `description` (text) - User's description of the fraud
      - `risk_score` (integer) - Calculated risk score (1-99)
      - `country` (text) - Country where fraud originated
      - `city` (text) - City where fraud originated
      - `lat` (float) - Latitude for geolocation
      - `lon` (float) - Longitude for geolocation
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `fraud_reports` table
    - Add policies for authenticated users to read and create their own reports
*/

CREATE TABLE IF NOT EXISTS fraud_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  target_type text NOT NULL CHECK (target_type IN ('email', 'phone', 'link', 'crypto', 'message')),
  target text NOT NULL,
  description text,
  risk_score integer NOT NULL CHECK (risk_score >= 1 AND risk_score <= 99),
  country text DEFAULT 'Unknown',
  city text DEFAULT 'Unknown',
  lat float DEFAULT 0,
  lon float DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE fraud_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create their own reports"
  ON fraud_reports
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own reports"
  ON fraud_reports
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX idx_fraud_reports_user_id ON fraud_reports(user_id);
CREATE INDEX idx_fraud_reports_target ON fraud_reports(target);
CREATE INDEX idx_fraud_reports_created_at ON fraud_reports(created_at);
