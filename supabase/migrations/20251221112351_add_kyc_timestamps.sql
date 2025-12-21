-- Add KYC timestamp and rejection reason columns to profiles table
-- This fixes the missing columns that useKycTrading hook expects

DO $$
BEGIN
    -- Add kyc_rejected_at column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'profiles' AND column_name = 'kyc_rejected_at'
    ) THEN
        ALTER TABLE profiles ADD COLUMN kyc_rejected_at TIMESTAMP WITH TIME ZONE;
    END IF;

    -- Add kyc_approved_at column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'profiles' AND column_name = 'kyc_approved_at'
    ) THEN
        ALTER TABLE profiles ADD COLUMN kyc_approved_at TIMESTAMP WITH TIME ZONE;
    END IF;

    -- Add kyc_rejection_reason column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'profiles' AND column_name = 'kyc_rejection_reason'
    ) THEN
        ALTER TABLE profiles ADD COLUMN kyc_rejection_reason TEXT;
    END IF;
END $$;