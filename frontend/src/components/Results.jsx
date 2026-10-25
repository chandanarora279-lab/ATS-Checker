function scoreTone(pct) {
  if (pct >= 75) return 'good'
  if (pct >= 50) return 'ok'
  return 'low'
}

function ScoreRing({ value }) {
  const radius = 54
  const circumference = 2 * Math.PI * radius
  const offset = circumference * (1 - value / 100)
  return (
    <svg className={`ring ${scoreTone(value)}`} viewBox="0 0 120 120" role="img" aria-label={`${value}% match`}>
      <circle className="track" cx="60" cy="60" r={radius} />
      <circle
        className="bar"
        cx="60"
        cy="60"
        r={radius}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
      />
      <text x="60" y="60" className="value">{Math.round(value)}%</text>
      <text x="60" y="82" className="label">match</text>
    </svg>
  )
}

// The LLM may return strings or small objects (e.g. {role, company}); render either.
function display(item) {
  if (item == null) return ''
  if (typeof item !== 'object') return String(item)
  return Object.values(item).filter(Boolean).map(display).join(' · ')
}

function Chips({ items, tone }) {
  if (!items?.length) return <p className="muted">None</p>
  return (
    <div className="chips">
      {items.map((item, i) => (
        <span key={i} className={`chip ${tone || ''}`}>{display(item)}</span>
      ))}
    </div>
  )
}

function List({ items }) {
  if (!items?.length) return <p className="muted">None</p>
  return (
    <ul className="list">
      {items.map((item, i) => <li key={i}>{display(item)}</li>)}
    </ul>
  )
}

export default function Results({ result, jobTitle }) {
  const pct = Number(result.match_percentage) || 0
  const matched = result.matching_skills?.length || 0
  const required = result.required_skills?.length || 0

  return (
    <div className="results">
      <div className="summary">
        <ScoreRing value={pct} />
        <div>
          <h2>{jobTitle ? `Match for ${jobTitle}` : 'Analysis result'}</h2>
          <p className="muted">
            {required ? `${matched} of ${required} required skills found. ` : ''}
            {result.total_experience != null && `Experience: ${display(result.total_experience)}`}
          </p>
        </div>
      </div>

      <div className="grid">
        <div className="block">
          <h3>Matching skills</h3>
          <Chips items={result.matching_skills} tone="good" />
        </div>
        <div className="block">
          <h3>Missing skills</h3>
          <Chips items={result.missing_skills} tone="low" />
        </div>
      </div>

      <div className="block highlight">
        <h3>How to improve</h3>
        <List items={result.improvement_suggestions} />
      </div>

      <div className="grid">
        <div className="block">
          <h3>Previous roles</h3>
          <List items={result.previous_roles} />
        </div>
        <div className="block">
          <h3>Education</h3>
          <List items={result.education} />
        </div>
      </div>

      <details className="block">
        <summary><h3>All skills on resume ({result.skills?.length || 0})</h3></summary>
        <Chips items={result.skills} />
      </details>
      <details className="block">
        <summary><h3>Skills required by the job ({required})</h3></summary>
        <Chips items={result.required_skills} />
      </details>
    </div>
  )
}
