// Serves the course at ritchot.me/courses/ai-literacy/ and retires the old
// subdomain. Requests for ritchot.me reach this Worker only through the
// website Worker's service binding (it owns the hostname and counts views);
// the subdomain reaches it through its own route.

const PREFIX = '/courses/ai-literacy';
const HOME = 'https://ritchot.me';
const LEGACY_HOST = 'ai-literacy.ritchot.me';

export default {
  /** @param {Request} request @param {{ ASSETS: { fetch: typeof fetch } }} env */
  async fetch(request, env) {
    const url = new URL(request.url);

    // Every old URL moves to the same file under the new prefix. Browsers keep
    // the #/… route across a redirect, so deep links into the app survive.
    if (url.hostname === LEGACY_HOST) {
      return Response.redirect(`${HOME}${PREFIX}${url.pathname}${url.search}`, 301);
    }

    // The PDF links in the app are relative, so the course root needs its
    // trailing slash.
    if (url.pathname === PREFIX) {
      return Response.redirect(`${url.origin}${PREFIX}/${url.search}`, 301);
    }
    if (!url.pathname.startsWith(`${PREFIX}/`)) {
      return new Response('Not found', { status: 404 });
    }

    const asset = new URL(url);
    asset.pathname = url.pathname.slice(PREFIX.length);
    const response = await env.ASSETS.fetch(new Request(asset, request));

    // The reference PDFs are course collateral, kept out of search results.
    // Set here rather than trusting _headers, which keys on the asset path.
    if (asset.pathname.startsWith('/reference/')) {
      const marked = new Response(response.body, response);
      marked.headers.set('X-Robots-Tag', 'noindex');
      return marked;
    }
    return response;
  },
};
