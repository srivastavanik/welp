# Supabase Integration Setup Guide

This guide will help you set up the Supabase database integration for the Welp application.

## Prerequisites

1. You should already have the application running with Node.js and pnpm
2. A Supabase account and project created
3. The environment variables already configured in `.env.local`

## Database Setup

### 1. Run the SQL Schema

1. Go to your Supabase dashboard
2. Navigate to the SQL Editor
3. Copy and paste the contents of `supabase-schema.sql` 
4. Run the SQL script to create the tables and policies

The script will create:
- `customers` table for storing customer information
- `reviews` table for storing restaurant reviews about customers
- Proper indexes for performance
- Row Level Security policies (currently set to public access)

### 2. Verify Tables

After running the schema, you should see two new tables in your Supabase Table Editor:
- `customers` 
- `reviews`

## Environment Variables

The following environment variables are already configured in `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://zgydjjqxpqfshrhmiuqt.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpneWRqanF4cHFmc2hyaG1pdXF0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTExNTk3MzksImV4cCI6MjA2NjczNTczOX0.fgHnz0l8CQ8QMEqFP9V_01O3YVv7SfcbAIkIpQVKz_I
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpneWRqanF4cHFmc2hyaG1pdXF0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTE1OTczOSwiZXhwIjoyMDY2NzM1NzM5fQ.xoWqfGRbf45PLadPrR2-az1FnBbhT4MPJt0rYWhganQ
```

## Features Implemented

### 1. Customer Lookup (`/lookup`)
- Enter a phone number to look up customer reviews
- Calculates overall scores from review data
- Shows detailed review history
- Real-time data from Supabase

### 2. Rate Customer (`/rate`)
- Submit reviews for customers by phone number
- Automatically creates customer records if they don't exist
- Stores detailed ratings (overall, behavior, payment, maintenance)
- Integrated with restaurant name and reviewer role

### 3. Review Management (`/reviews`)
- View all submitted reviews
- Edit existing reviews
- Delete reviews
- Real-time updates to Supabase

## API Endpoints

The following API endpoints have been created:

- `GET /api/customers?phone={phone}` - Look up customer by phone
- `POST /api/customers` - Create new customer
- `GET /api/reviews` - Get all reviews
- `GET /api/reviews?customer_id={id}` - Get reviews for specific customer
- `POST /api/reviews` - Create new review
- `GET /api/reviews/{id}` - Get specific review
- `PUT /api/reviews/{id}` - Update review
- `DELETE /api/reviews/{id}` - Delete review

## Testing the Integration

1. Start the development server: `pnpm dev`
2. Go to `/rate` and submit a review with a phone number
3. Go to `/lookup` and search for the same phone number
4. Go to `/reviews` to see all submitted reviews

## Data Migration

If you had existing data in localStorage from the previous version, it will no longer be accessible. The app now uses Supabase exclusively for data storage.

## Security Considerations

- The current setup uses public policies for easy development
- In production, you should implement proper Row Level Security
- Consider adding authentication and user-specific policies
- The service role key should only be used server-side

## Troubleshooting

1. **Database connection issues**: Verify the Supabase URL and keys are correct
2. **Table not found errors**: Make sure you've run the SQL schema script
3. **Permission errors**: Check that RLS policies are properly configured
4. **API errors**: Check the browser console and server logs for detailed error messages 