-- Migration: Add notification fields to profiles table

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS notifications_whatsapp BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS notifications_email BOOLEAN DEFAULT false;
