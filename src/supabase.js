import { createClient } from '@supabase/supabase-js';

const URL = 'https://oijknqqnzxaqarsnkzqu.supabase.co';
const KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9pamtucXFuenhhcWFyc25renF1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQyNzk2NDMsImV4cCI6MjA5OTg1NTY0M30.ZY-SwdcZb5jhO0iuVmliwAinzMa1D3fQrl31O2jU-eM';

export const sb = createClient(URL, KEY);
