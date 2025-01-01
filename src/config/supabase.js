import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ovnbykkfpyiushqctugz.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im92bmJ5a2tmcHlpdXNocWN0dWd6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU3NzAwMTUsImV4cCI6MjA1MTM0NjAxNX0.R7nco7HRQtAad9xpH6dTxcmRkyMz3JmpqIASKXvf6S4'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
