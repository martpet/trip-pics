import { resolve } from 'app-root-path';
import { appendFileSync } from 'fs';
import { userInfo } from 'os';

export const getPersonalDevSubdomain = () => {
  const envKey = 'PERSONAL_SUBDOMAIN';
  let subdomain = process.env[envKey];

  if (!subdomain) {
    const fileName = '.env.local';
    const filePath = resolve(fileName);
    let username;

    try {
      username = userInfo().username;
    } catch (e) {
      username = 'user';
    }

    subdomain = `${username}${Date.now()}`;
    appendFileSync(filePath, `\r${envKey}=${subdomain}`);
    console.log(`❗️ Your dev environment's subdomain was written to ${filePath}.`);
  }

  return subdomain.replace(/_|-$|\.|\*|\\|\//gi, '');
};
