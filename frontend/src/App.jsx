import { useEffect, useState } from 'react'
import { analyzeResume, listJobs } from './api'
import JobSelector from './components/JobSelector'
import ResumeUpload from './components/ResumeUpload'
import Results from './components/Results'

export default function App() {
  const [jobs, setJobs] = useState([])
  const [jobsError, setJobsError] = useState('')
  const [jobId, setJobId] = useState('')
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)

  useEffect(() => {
    listJobs()
      .then((data) => {
        setJobs(data)
        if (data.length) setJobId(String(data[data.length - 1].id))
      })
      .catch((e) => setJobsError(e.message))
  }, [])

  function handleJobCreated(job) {
    setJobs((prev) => [...prev, job])
    setJobId(String(job.id))
  }

  async function handleAnalyze(e) {
    e.preventDefault()
    setError('')
    setResult(null)
    setLoading(true)
    try {
      setResult(await analyzeResume(jobId, file))
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const selectedJob = jobs.find((j) => String(j.id) === jobId)

  return (
    <div className="app">
      <header className="header">
        <h1>ATS Resume Checker</h1>
        <p>See how well your resume matches a job description, and what to improve.</p>
      </header>

      <main className="layout">
        <form className="card" onSubmit={handleAnalyze}>
          <h2>1. Job description</h2>
          <JobSelector
            jobs={jobs}
            jobId={jobId}
            onSelect={setJobId}
            onCreated={handleJobCreated}
            loadError={jobsError}
          />
          {selectedJob && (
            <details className="jd-preview">
              <summary>View description</summary>
              <p>{selectedJob.job_description}</p>
            </details>
          )}

          <h2>2. Resume</h2>
          <ResumeUpload file={file} onChange={setFile} />

          <button className="btn primary full" disabled={!jobId || !file || loading}>
            {loading ? 'Analyzing…' : 'Analyze resume'}
          </button>
          {error && <div className="alert error">{error}</div>}
        </form>

        <section className="card results-card">
          {loading ? (
            <div className="placeholder">
              <div className="spinner" />
              <p>Reading your resume and comparing it with the job…</p>
            </div>
          ) : result ? (
            <Results result={result} jobTitle={selectedJob?.job_title} />
          ) : (
            <div className="placeholder">
              <p>
                Pick a job description, upload a PDF resume, and click <b>Analyze resume</b>.
              </p>
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
