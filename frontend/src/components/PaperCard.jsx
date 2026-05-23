import { useState } from "react"

export default function PaperCard({ paper }) {
  const [expanded, setExpanded] = useState(false)

  const abstract = paper.abstract || "No abstract available."
  const shortAbstract = abstract.length > 200
    ? abstract.slice(0, 200) + "…"
    : abstract

  return (
    <div className="card">

      <div className="card-top">
        <span className="card-year">{paper.year}</span>
        <span className="card-journal">{paper.journal}</span>
      </div>

      <h3 className="card-title">
        <a href={paper.link} target="_blank" rel="noreferrer">
          {paper.title}
        </a>
      </h3>

      <p className="card-authors">
        {paper.authors.slice(0, 3).join(", ")}
        {paper.authors.length > 3 && ` +${paper.authors.length - 3} more`}
      </p>

      <p className="card-abstract">
        {expanded ? abstract : shortAbstract}
      </p>

      {abstract.length > 200 && (
        <button
          className="expand-btn"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? "Show less" : "Read more"}
        </button>
      )}

      {paper.keywords.length > 0 && (
        <div className="card-keywords">
          {paper.keywords.slice(0, 5).map(k => (
            <span key={k} className="keyword">{k}</span>
          ))}
        </div>
      )}

    </div>
  )
}