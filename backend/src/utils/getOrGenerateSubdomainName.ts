import { resolve } from 'app-root-path';
import { appendFileSync } from 'fs';
import { userInfo } from 'os';

export const getOrGenerateSubdomainName = () => {
  const envKey = 'PERSONAL_SUBDOMAIN';
  let subdomain = process.env[envKey];

  if (!subdomain) {
    const fileName = '.env.local';
    const filePath = resolve(fileName);
    subdomain = `${userInfo().username}${Date.now()}`;

    appendFileSync(filePath, `\r${envKey}=${subdomain}`);
    console.log(`❗️ Your personal environment's subdomain was written to ${filePath}.`);
  }

  return subdomain;
};
