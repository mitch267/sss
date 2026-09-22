function cookieValue(request, name) {
  const raw = request.headers.get('Cookie') || '';
  const match = raw.match(new RegExp('(?:^|;\\s*)' + name.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&') + '=([^;]*)'));
  return match ? decodeURIComponent(match[1]) : '';
}

function callbackHtml(message) {
  const safe = JSON.stringify(message).replace(/</g, '\\u003c');
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>CMS Login</title></head><body><p>Completing GitHub login…</p><script>(function(){var msg=${safe};if(window.opener){window.opener.postMessage(msg,'*');setTimeout(function(){window.close()},300)}else{document.body.innerHTML='<p>Login completed. You can close this window and return to the CMS.</p>'}})();<\/script></body></html>`;
}

async function startAuth(request, env) {
  if (!env.GITHUB_CLIENT_ID) return new Response('Missing GITHUB_CLIENT_ID in Cloudflare environment variables.', { status: 500 });
  const url = new URL(request.url);
  const state = crypto.randomUUID();
  const callback = `${url.origin}/api/callback`;
  const github = new URL('https://github.com/login/oauth/authorize');
  github.searchParams.set('client_id', env.GITHUB_CLIENT_ID);
  github.searchParams.set('redirect_uri', callback);
  github.searchParams.set('scope', env.GITHUB_REPO_PRIVATE === 'true' ? 'repo,user' : 'public_repo,user');
  github.searchParams.set('state', state);
  return new Response(null, { status: 302, headers: {
    Location: github.toString(),
    'Set-Cookie': `decap_oauth_state=${state}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=600`,
    'Cache-Control': 'no-store'
  }});
}

async function finishAuth(request, env) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const expected = cookieValue(request, 'decap_oauth_state');
  if (!code) return new Response('GitHub did not return an authorization code.', { status: 400 });
  if (!state || !expected || state !== expected) return new Response('Invalid OAuth state. Close this window and try again.', { status: 400 });
  if (!env.GITHUB_CLIENT_ID || !env.GITHUB_CLIENT_SECRET) return new Response('Missing GitHub OAuth environment variables.', { status: 500 });

  const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json', 'User-Agent': 'Decap-CMS-Cloudflare-OAuth' },
    body: JSON.stringify({ client_id: env.GITHUB_CLIENT_ID, client_secret: env.GITHUB_CLIENT_SECRET, code, redirect_uri: `${url.origin}/api/callback`, state })
  });
  const tokenData = await tokenRes.json();
  if (!tokenRes.ok || !tokenData.access_token) {
    const detail = tokenData.error_description || tokenData.error || 'Token exchange failed';
    return new Response(callbackHtml('authorization:github:error:' + JSON.stringify({ message: detail })), { status: 400, headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' }});
  }
  const message = 'authorization:github:success:' + JSON.stringify({ token: tokenData.access_token, provider: 'github' });
  return new Response(callbackHtml(message), { headers: {
    'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store',
    'Set-Cookie': 'decap_oauth_state=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0'
  }});
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (request.method === 'GET' && url.pathname === '/api/auth') return startAuth(request, env);
    if (request.method === 'GET' && url.pathname === '/api/callback') return finishAuth(request, env);
    return env.ASSETS.fetch(request);
  }
};
