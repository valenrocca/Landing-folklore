const fs = require('fs');
const path = require('path');

const typeformFormId = process.env.TYPEFORM_FORM_ID || 'DxHVf2L2';
const typeformDomain =
  process.env.TYPEFORM_DOMAIN || 'https://daleplaylive.typeform.com';
const registrationGateEnabled =
  process.env.REGISTRATION_GATE_ENABLED !== 'false';
const isProduction =
  process.env.NODE_ENV === 'production' || process.env.VERCEL === '1';

const content = `export const environment = {
  production: ${isProduction},
  typeformFormId: '${typeformFormId}',
  typeformDomain: '${typeformDomain}',
  registrationGateEnabled: ${registrationGateEnabled},
};
`;

const target = path.join(__dirname, '../src/environments/environment.ts');
fs.writeFileSync(target, content);
console.log('environment.ts generated');
