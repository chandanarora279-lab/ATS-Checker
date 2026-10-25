import { useRef, useState } from 'react'

const MAX_SIZE = 5 * 1024 * 1024 // matches MAX_RESUME_SIZE in Django settings

export default function ResumeUpload({ file, onChange }) {
  const inputRef = useRef(null)
  const [dragging, setDragging] = useState(false)
  const [error, setError] = useState('')

  function pick(f) {
    setError('')
    if (!f) return
    if (!f.name.toLowerCase().endsWith('.pdf')) {
      setError('Only PDF files are supported.')
      return
    }
    if (f.size > MAX_SIZE) {
      setError('File too large (max 5 MB).')
      return
    }
    onChange(f)
  }

  return (
    <>
      <div
        className={`dropzone ${dragging ? 'dragging' : ''} ${file ? 'has-file' : ''}`}
        onClick={() => inputRef.current.click()}
        onDragOver={(e) => {
          e.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragging(false)
          pick(e.dataTransfer.files[0])
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf,.pdf"
          hidden
          onChange={(e) => {
            pick(e.target.files[0])
            e.target.value = ''
          }}
        />
        {file ? (
          <>
            <strong>{file.name}</strong>
            <span>{(file.size / 1024).toFixed(0)} KB · click to change</span>
          </>
        ) : (
          <>
            <strong>Drop your resume here</strong>
            <span>or click to browse · PDF, max 5 MB</span>
          </>
        )}
      </div>
      {error && <div className="alert error">{error}</div>}
    </>
  )
}
