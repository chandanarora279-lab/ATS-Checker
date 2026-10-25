// Thin wrapper around the Django REST API. Every response has the shape
// { status: bool, message?: string, data: ... }.

async function request(url, options) {
  let res
  try {
    res = await fetch(url, options)
  } catch {
    throw new Error('Cannot reach the server. Is the Django backend running?')
  }

  let body = null
  try {
    body = await res.json()
  } catch {
    // non-JSON response (e.g. HTML error page)
  }

  if (!res.ok || (body && body.status === false)) {
    throw new Error(errorMessage(res, body))
  }
  return body?.data
}

function errorMessage(res, body) {
  if (res.status === 429) return 'Too many requests. Please wait a while and try again.'
  if (!body) return `Request failed (${res.status})`
  if (body.detail) return body.detail
  // DRF field errors: { field: ["msg", ...] }
  if (body.data && typeof body.data === 'object' && Object.keys(body.data).length) {
    return Object.entries(body.data)
      .map(([field, msgs]) => `${field}: ${[].concat(msgs).join(' ')}`)
      .join('\n')
  }
  return body.message || `Request failed (${res.status})`
}

export function listJobs() {
  return request('/api/jobs/')
}

export function createJob(job_title, job_description) {
  return request('/api/jobs/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ job_title, job_description }),
  })
}

export function analyzeResume(jobId, file) {
  const form = new FormData()
  form.append('job_description', jobId)
  form.append('resume', file)
  return request('/api/resume/', { method: 'POST', body: form })
}
