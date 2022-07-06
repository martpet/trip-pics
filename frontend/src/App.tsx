import { oauthScopes } from '~/consts';
import { getStackOutput } from '~/utils';

// Todo: import authDomain directly from consts
const { userPoolClientId, authDomain } = getStackOutput();

export function App() {
  const authUrl = new URL(`https://${authDomain}/oauth2/authorize`);
  const redirectUrl = `${window.location.protocol}//${window.location.host}`;

  authUrl.searchParams.append('response_type', 'token');
  authUrl.searchParams.append('identity_provider', 'Google');
  authUrl.searchParams.append('client_id', userPoolClientId);
  authUrl.searchParams.append('redirect_uri', redirectUrl);
  authUrl.searchParams.append('scope', oauthScopes.join(' '));

  const [tokenEntry, tokenTypeEntry, tokenExpirationEntry] = window.location.hash
    .substring(1)
    .split('&');

  return (
    <>
      <a href={authUrl.href}>click</a>
      <br />
      <br />
      {tokenEntry}
      <br />
      <br />
      {tokenTypeEntry}
      <br />
      <br />
      {tokenExpirationEntry}
    </>
  );
}
