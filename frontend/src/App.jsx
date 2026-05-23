import { useState, useRef } from "react"
import axios from "axios"
import PaperCard from "./components/PaperCard"
import TrendChart from "./components/TrendChart"
import AnalysisPanel from "./components/AnalysisPanel"
import "./App.css"

const API = "http://localhost:8000"

export default function App() {
  const [query, setQuery] = useState("")
  const [currentQuery, setCurrentQuery] = useState("")
  const [papers, setPapers] = useState([])
  const [trend, setTrend] = useState(null)

  const [loadingPapers, setLoadingPapers] = useState(false)
  const [loadingTrend, setLoadingTrend] = useState(false)

  const [analysis, setAnalysis] = useState(null)
  const [loadingAnalysis, setLoadingAnalysis] = useState(false)

  const [error, setError] = useState("")
  const [searched, setSearched] = useState(false)

  const trendRef = useRef(0)

  async function handleSearch() {
    if (!query.trim()) return

    const thisSearch = Date.now()
    trendRef.current = thisSearch

    setError("")
    setSearched(false)
    setTrend(null)

    setLoadingTrend(false)
    setLoadingPapers(true)

    setCurrentQuery(query)

    setAnalysis(null)
    setLoadingAnalysis(false)

    // ─────────────────────────────────────────────
    // FETCH PAPERS
    // ─────────────────────────────────────────────
    let fetchedPapers = []

    try {
      const res = await axios.get(`${API}/search`, {
        params: {
          query,
          max_results: 20,
        },
      })

      fetchedPapers = res.data.papers || []

      setPapers(fetchedPapers)
      setSearched(true)

      // ─────────────────────────────────────────────
      // NLP ANALYSIS
      // ─────────────────────────────────────────────
      setLoadingAnalysis(true)

      try {
        const analysisRes = await axios.post(`${API}/analyse`, {
          papers: fetchedPapers,
        })

        setAnalysis(analysisRes.data)
      } catch (err) {
        console.error("Analysis failed:", err)
      } finally {
        setLoadingAnalysis(false)
      }

      setLoadingPapers(false)
    } catch (err) {
      console.error(err)

      setError(
        "Could not reach backend. Make sure it's running on port 8000."
      )

      setLoadingPapers(false)
      return
    }

    // ─────────────────────────────────────────────
    // TREND FETCH (BACKGROUND)
    // ─────────────────────────────────────────────
    if (trendRef.current !== thisSearch) return

    setLoadingTrend(true)

    try {
      const res = await axios.get(`${API}/trend`, {
        params: {
          query,
          start_year: 2000,
          end_year: 2025,
        },
      })

      if (trendRef.current === thisSearch) {
        setTrend(res.data)
      }
    } catch (err) {
      console.error("Trend fetch failed:", err)
    } finally {
      if (trendRef.current === thisSearch) {
        setLoadingTrend(false)
      }
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  return (
    <div className="app">

      {/* HEADER */}
      <header className="header">
        <div className="header-tag">
          biomedical research tool
        </div>

        <h1 className="logo">
          MedLit<span>Analyser</span>
        </h1>

        <p className="tagline">
          Search · Analyse · Visualise biomedical literature
        </p>
      </header>

      {/* SEARCH */}
      <div className="search-wrap">
        <div className="search-box">

          <input
            type="text"
            placeholder="e.g. histopathology cancer classification"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="search-input"
          />

          <button
            onClick={handleSearch}
            className="search-btn"
            disabled={loadingPapers}
          >
            {loadingPapers ? "Searching…" : "Search"}
          </button>

        </div>

        {error && (
          <p className="error">{error}</p>
        )}
      </div>

      {/* PAPERS */}
      {searched && (
        <div className="section">

          <h2 className="section-title">
            {papers.length} papers found for{" "}
            <span>"{currentQuery}"</span>
          </h2>

          {papers.length === 0 && (
            <p className="no-results">
              No papers found. Try a different query.
            </p>
          )}

          <div className="papers-grid">
            {papers.map((p) => (
              <PaperCard
                key={p.pmid}
                paper={p}
              />
            ))}
          </div>

        </div>
      )}

      {/* TREND */}
      {(loadingTrend || trend) && (
        <div className="section">

          {loadingTrend && !trend && (
            <div className="trend-loading">

              <div className="trend-skeleton shimmer" />

              <p>
                Loading publication trend — this takes ~15 seconds…
              </p>

            </div>
          )}

          {trend && (
            <>
              <h2 className="section-title">
                Publication trend —{" "}
                <span>"{currentQuery}"</span>
              </h2>

              <div className="chart-wrap">
                <TrendChart
                  years={trend.years}
                  counts={trend.counts}
                />
              </div>
            </>
          )}

        </div>
      )}

      {/* NLP ANALYSIS PANEL */}
      {(loadingAnalysis || analysis) && (
        <div className="section">

          <h2 className="section-title">
            NLP analysis — <span>"{currentQuery}"</span>
          </h2>

          {loadingAnalysis && !analysis && (
            <div
              className="card-skeleton shimmer"
              style={{ height: "200px" }}
            />
          )}

          {analysis && (
            <AnalysisPanel data={analysis} />
          )}

        </div>
      )}

    </div>
  )
}