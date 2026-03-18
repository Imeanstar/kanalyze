import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types for the analyses table
export interface AnalysisData {
  group_summary: string;
  relationship_map?: string;
  members: MemberAnalysis[];
  others_message_count?: number;
}

export interface MemberAnalysis {
  name: string;
  message_count: number;
  title: string;
  traits?: Trait[];
  detailed_markdown?: string;
}

export interface Trait {
  title: string;
  description: string;
  quotes: string[];
}

export interface AnalysisRow {
  id: string;
  data: AnalysisData;
  created_at: string;
}
