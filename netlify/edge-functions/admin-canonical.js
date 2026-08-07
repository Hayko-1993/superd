// Only redirect /admin when VITE_ADMIN_ORIGIN is explicitly set.
// If unset, admin stays on the current Netlify site (required for new deploys).
const rawOrigin = (Netlify.env.get('VITE_ADMIN_ORIGIN') || '').trim().replace(/\/$/, '')

export default async (request, context) => {
  if (!rawOrigin) return context.next()

  const url = new URL(request.url)
  let adminHost
  try {
    adminHost = new URL(rawOrigin).hostname
  } catch {
    return context.next()
  }

  if (url.hostname !== adminHost) {
    return Response.redirect(`${rawOrigin}${url.pathname}${url.search}`, 302)
  }

  return context.next()
}
