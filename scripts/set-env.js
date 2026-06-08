const fs = require('fs');
const path = require('path');

const supabaseUrl =
  process.env.SUPABASE_URL || 'https://yejcpmmuwfztabpmmzep.supabase.co';
const supabaseAnonKey =
  process.env.SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InllamNwbW11d2Z6dGFicG1temVwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA2OTA4NDQsImV4cCI6MjA5NjI2Njg0NH0.od-Hrq5Qn_i7ph00cDp3LyN9lgUA8zMSR61t1eyaW4Y';

const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL === '1';

const content = `export const environment = {
  production: ${isProduction},
  supabaseUrl: '${supabaseUrl}',
  supabaseAnonKey: '${supabaseAnonKey}',
};
`;

const target = path.join(__dirname, '../src/environments/environment.ts');
fs.writeFileSync(target, content);
console.log('environment.ts generated');
