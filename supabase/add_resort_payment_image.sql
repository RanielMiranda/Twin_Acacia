-- Add optional payment reference image URL to resorts (e.g. GCash QR).
-- Storage path: [resortname]/payment/*.webp in bucket resort-images
-- Run after booking_system_related_schema.sql (resorts table exists).
alter table public.resorts
  add column if not exists payment_image_url text;

comment on column public.resorts.payment_image_url is 'Public URL of resort payment reference image (e.g. GCash QR), stored at [resortname]/payment in resort-images bucket.';
