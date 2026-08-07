const { supabase } = require('./_shared/supabase')
const { cors, verifyAdmin } = require('./_shared/auth')

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return cors({})
  if (!verifyAdmin(event)) return cors({ error: 'Unauthorized' }, 401)

  const pathId = event.path.split('/').find((_, i, arr) => arr[i - 1] === 'carriers')
  const id = (event.queryStringParameters && event.queryStringParameters.id) || pathId
  const { status } = JSON.parse(event.body || '{}')

  if (!id) return cors({ error: 'Missing carrier id' }, 400)
  if (!['pending', 'approved', 'rejected'].includes(status)) return cors({ error: 'Invalid status' }, 400)

  const { error } = await supabase.from('carriers').update({ status }).eq('id', id)
  if (error) return cors({ error: error.message }, 500)
  return cors({ ok: true })
}
