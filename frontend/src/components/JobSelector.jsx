import { useState } from 'react'
import { createJob } from '../api'

export default function JobSelector({ jobs, jobId, onSelect, onCreated, loadError }) {
  const [adding, setAdding] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function handleSave() {
    setError('')
    setSaving(true)
    try {
      const job = await createJob(title.trim(), description.trim())
      onCreated(job)
      setTitle('')
      setDescription('')
      setAdding(false)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="job-selector">
      {loadError && <div className="alert error">{loadError}</div>}

      {!adding && (
        <div className="row">
          <select value={jobId} onChange={(e) => onSelect(e.target.value)} disabled={!jobs.length}>
            {!jobs.length && <option value="">No job descriptions yet</option>}
            {jobs.map((job) => (
              <option key={job.id} value={job.id}>
                {job.job_title}
              </option>
            ))}
          </select>
          <button type="button" className="btn" onClick={() => setAdding(true)}>
            + New
          </button>
        </div>
      )}

      {adding && (
        <div className="new-job">
          <input
            placeholder="Job title, e.g. Python Developer"
            maxLength={100}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <textarea
            placeholder="Paste the full job description here"
            rows={8}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          {error && <div className="alert error">{error}</div>}
          <div className="row end">
            <button type="button" className="btn ghost" onClick={() => setAdding(false)}>
              Cancel
            </button>
            <button
              type="button"
              className="btn primary"
              onClick={handleSave}
              disabled={saving || !title.trim() || !description.trim()}
            >
              {saving ? 'Saving…' : 'Save job'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
