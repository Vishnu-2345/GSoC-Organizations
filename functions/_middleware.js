const CANONICAL_HOST = 'gsocorganizations.xyz';

export async function onRequest(context) {
  const url = new URL(context.request.url);

  if (url.hostname === `www.${CANONICAL_HOST}`) {
    url.hostname = CANONICAL_HOST;
    url.protocol = 'https:';

    return Response.redirect(url.toString(), 301);
  }

  return context.next();
}
