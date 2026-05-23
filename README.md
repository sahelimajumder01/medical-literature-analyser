# MedLit Analyser

A full stack biomedical research tool that searches, analyses, and visualises medical literature from PubMed in real time.

**Live demo:** [medical-literature-analyser.vercel.app](https://medical-literature-analyser.vercel.app)

---

## What it does

Search any biomedical topic and instantly get:

- **Paper results** — titles, authors, abstracts, journals, MeSH keywords, direct PubMed links
- **Publication trend** — year-by-year chart of how research on a topic has grown since 2000
- **NLP analysis** — topic clusters, top keyword frequency, and research sentiment trend extracted from abstracts

All data is fetched live from the NCBI PubMed database — 36 million+ articles.

---

## Screenshots

> Search results with paper cards

![Search results showing paper cards with titles, authors, abstracts and keywords]

> Publication trend chart

![Line chart showing publication growth from 2000 to 2025]

> NLP analysis panel — topic clusters, keyword bar chart, sentiment trend

![NLP analysis panel showing topic clusters, top keywords and sentiment trend]

---

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite |
| Charts | Recharts |
| Backend | Python · FastAPI |
| Data source | PubMed (NCBI Entrez API) |
| NLP | Python · regex · Counter · keyword extraction |
| Deployment | Vercel (frontend) · Render (backend) |

---

## Features in detail

### Search
- Queries the PubMed Entrez API live
- Returns up to 100 papers with full metadata
- Papers load in ~2 seconds independently of other features

### Publication trend
- Counts papers published per year from 2000–2025 for any query
- Rendered as an area chart with interactive tooltip
- Loads asynchronously — papers appear first, chart follows

### NLP analysis panel
- **Topic clusters** — classifies abstracts into biomedical research categories (Treatment & Therapy, Genomics & Mutations, Imaging & Detection, Molecular Pathways, Prognosis & Survival, Histopathology) with mention counts
- **Top keywords** — extracts and ranks the most frequent terms from MeSH keywords and abstracts, displayed as a horizontal bar chart with fading green gradient
- **Sentiment trend** — calculates positive vs negative language ratio per year using domain-specific biomedical vocabulary

---

## Running locally

### Prerequisites
- Python 3.10+
- Node.js 20+
- Conda or virtualenv (recommended)

### Backend

```bash
cd backend
conda create -n medlit python=3.11
conda activate medlit
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

API docs available at `http://localhost:8000/docs`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

App runs at `http://localhost:5173`

### Environment variables

Create `frontend/.env.local` for local development:

```
VITE_API_URL=http://localhost:8000
```

Create `frontend/.env.production` for production:

```
VITE_API_URL=https://your-render-backend-url.onrender.com
```

---

## API endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/search` | Search PubMed papers by query |
| GET | `/trend` | Get publication counts per year |
| POST | `/analyse` | Run NLP analysis on a list of papers |

### Example

```bash
# Search papers
curl "http://localhost:8000/search?query=histopathology+cancer&max_results=20"

# Get trend data
curl "http://localhost:8000/trend?query=BRCA1&start_year=2000&end_year=2025"

# Analyse papers
curl -X POST "http://localhost:8000/analyse" \
  -H "Content-Type: application/json" \
  -d '{"papers": [...]}'
```

---

## Project structure

```
med-lit-analyser/
├── backend/
│   ├── main.py              # FastAPI app — all endpoints
│   └── requirements.txt     # Python dependencies
└── frontend/
    ├── src/
    │   ├── App.jsx           # Main app — search, state, layout
    │   ├── App.css           # All styles
    │   └── components/
    │       ├── PaperCard.jsx     # Individual paper display
    │       ├── TrendChart.jsx    # Publication trend chart
    │       └── AnalysisPanel.jsx # NLP results panel
    ├── .env.production       # Production API URL
    └── vercel.json           # Vercel deployment config
```

---

## Deployment

### Backend — Render

1. Connect GitHub repo to [render.com](https://render.com)
2. New Web Service → Root Directory: `backend`
3. Build command: `pip install -r requirements.txt`
4. Start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`

> **Note:** Free tier spins down after 15 minutes of inactivity. First request after sleep may take ~50 seconds.

### Frontend — Vercel

1. Connect GitHub repo to [vercel.com](https://vercel.com)
2. Root Directory: `frontend`
3. Add environment variable: `VITE_API_URL` = your Render backend URL
4. Deploy

---

## Background

Built as part of a research-focused full stack portfolio, drawing on experience with biomedical data analysis from a research internship at the Indian Association for the Cultivation of Science (IACS), where work involved histopathological image analysis, genomic data from cBioPortal, and end-to-end ML pipelines on TCGA whole-slide images.

This tool extends that research background into a live, interactive application — making biomedical literature accessible and analysable without needing database access or coding knowledge.

---

## Planned features

- [ ] Co-author network graph (D3 force layout)
- [ ] cBioPortal genomic data integration
- [ ] BERTopic-powered topic modelling
- [ ] Export results as CSV / PDF report
- [ ] Save and compare multiple searches

---

## Author

**Saheli Majumder**
MSc Computer Science · St. Xavier's College, Kolkata
BS Data Science · IIT Madras
UGC-NET qualified (Computer Science) — 99.22 percentile

[GitHub](https://github.com/sahelimajumder01) · [LinkedIn](https://www.linkedin.com/in/sahelimajumder001)