import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://kixihchzynjgdikbmllm.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtpeGloY2h6eW5qZ2Rpa2JtbGxtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMzMjk4OTksImV4cCI6MjA5ODkwNTg5OX0.aW_kFW_npfeKWiGcfXptnJO12ShkwV0SpKxCtL8UIwM";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
