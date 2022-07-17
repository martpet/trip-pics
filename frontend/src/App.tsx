import { getStackOutput } from '~/utils';

const { userPoolClientId, authDomain } = getStackOutput();

export function App() {
  const googleUrl = authUrl('Google');
  const appleUrl = authUrl('SignInWithApple');

  return (
    <>
      <p>
        <a href={googleUrl.href}>Google</a>, <a href={appleUrl.href}>Apple</a>
      </p>
      <p>{window.location.href}</p>
    </>
  );
}

function authUrl(idp: string) {
  const url = new URL(`https://${authDomain}/oauth2/authorize`);
  url.searchParams.append('identity_provider', idp);
  url.searchParams.append('client_id', userPoolClientId);
  url.searchParams.append('redirect_uri', window.location.origin);
  url.searchParams.append('response_type', 'code');
  return url;
}
