import { resolve } from 'app-root-path';
import { appendFileSync } from 'fs';
import { userInfo } from 'os';

export const getOrGeneratePersonalSubdomainName = () => {
  let personalSubdomain = process.env.PERSONAL_SUBDOMAIN;

  if (!personalSubdomain) {
    const dotEnvVarKey = 'PERSONAL_SUBDOMAIN';
    const dotEnvPath = resolve('.env.local');

    personalSubdomain = `${userInfo().username}${Date.now()}`;

    appendFileSync(dotEnvPath, `\r=${dotEnvVarKey}${personalSubdomain}`);

    console.log("❗️ Your personal environment's subdomain was written to .env.local.");
  }

  return personalSubdomain;
};
