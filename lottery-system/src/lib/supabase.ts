import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ocrckuelojprhyfnhtqn.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9jcmNrdWVsb2pwcmh5Zm5odHFuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUzNTI0NjcsImV4cCI6MjA3MDkyODQ2N30.l0_3Tz_sFVCD6GTD32eqbMARmSJkhzcWDT2TVns892c'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)