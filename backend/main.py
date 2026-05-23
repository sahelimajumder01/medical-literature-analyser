from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from Bio import Entrez, Medline
import re
from collections import Counter

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Entrez.email = "sahelimajumder2004@gmail.com"

def fetch_papers(query, max_results=20):
    handle = Entrez.esearch(db="pubmed", term=query, retmax=max_results)
    ids = Entrez.read(handle)["IdList"]
    handle.close()

    if not ids:
        return []

    handle = Entrez.efetch(db="pubmed", id=ids, rettype="medline", retmode="text")
    papers = list(Medline.parse(handle))
    handle.close()

    results = []
    for p in papers:
        year_str = p.get("DP", "")
        year_match = re.search(r"\d{4}", year_str)
        results.append({
            "title":    p.get("TI", ""),
            "abstract": p.get("AB", "No abstract available."),
            "authors":  p.get("AU", []),
            "year":     int(year_match.group()) if year_match else 0,
            "journal":  p.get("TA", ""),
            "keywords": p.get("MH", [])[:6],
            "pmid":     p.get("PMID", ""),
            "link":     f"https://pubmed.ncbi.nlm.nih.gov/{p.get('PMID', '')}/",
        })
    return results


@app.get("/search")
def search(
    query: str = Query(...),
    max_results: int = Query(20, le=100)
):
    papers = fetch_papers(query, max_results)
    return {"total": len(papers), "papers": papers}


@app.get("/trend")
def trend(
    query: str = Query(...),
    start_year: int = Query(2000),
    end_year: int = Query(2025),
):
    years, counts = [], []
    for year in range(start_year, end_year + 1):
        try:
            handle = Entrez.esearch(
                db="pubmed",
                term=f"{query} AND {year}[dp]",
                retmax=0          # we only need the count, not the actual records
            )
            record = Entrez.read(handle)
            handle.close()
            counts.append(int(record["Count"]))
        except Exception:
            counts.append(0)
        years.append(year)
    return {"years": years, "counts": counts}



@app.post("/analyse")
def analyse(data: dict):
    papers = data.get("papers", [])
    if not papers:
        raise HTTPException(400, "No papers provided.")

    abstracts = [p.get("abstract", "") for p in papers if p.get("abstract")]

    return {
        "top_keywords":    _top_keywords(papers, abstracts),
        "topics":          _fallback_topics(abstracts),
        "sentiment_trend": _sentiment_trend(papers),
        "total":           len(papers),
        "with_abstracts":  len(abstracts),
    }


def _top_keywords(papers, abstracts):
    stopwords = {
        "the","a","an","is","in","of","and","to","with","for","was","were",
        "are","that","this","as","by","from","or","be","have","has","had",
        "not","at","its","it","on","which","also","these","their","our",
        "we","can","may","been","using","used","between","than","after",
        "both","all","more","but","into","about","through","while","such",
        "show","showed","shown","result","results","study","studies","based",
        "patients","patient","method","methods","data","analysis","high",
        "low","significant","associated","compared","however","including",
        "showed","findings","among","use","new","within","during","without"
    }
    words = []
    # MeSH keywords from papers
    for p in papers:
        for kw in p.get("keywords", []):
            clean = kw.split("/")[0].strip().lower()
            if clean and len(clean) > 3:
                words.append(clean)
    # words from abstracts
    for abstract in abstracts[:40]:
        tokens = re.findall(r"\b[a-zA-Z]{4,}\b", abstract.lower())
        words.extend([w for w in tokens if w not in stopwords])

    counter = Counter(words)
    return [{"word": w, "count": c} for w, c in counter.most_common(20)]


def _fallback_topics(abstracts):
    buckets = {
        "Treatment & Therapy":    ["treatment","therapy","clinical","drug","chemotherapy","immunotherapy","surgery"],
        "Genomics & Mutations":   ["gene","mutation","expression","genomic","variant","sequencing","dna","rna"],
        "Imaging & Detection":    ["imaging","detection","diagnosis","classification","deep learning","model","neural"],
        "Molecular Pathways":     ["protein","pathway","signaling","cell","mechanism","apoptosis","receptor"],
        "Prognosis & Survival":   ["survival","prognosis","incidence","cohort","mortality","recurrence","outcome"],
        "Histopathology":         ["histopathology","histological","biopsy","tissue","slide","staining","pathology"],
    }
    all_text = " ".join(abstracts).lower()
    results = []
    for i, (label, keywords) in enumerate(buckets.items()):
        count = sum(all_text.count(kw) for kw in keywords)
        results.append({
            "id": i,
            "label": label,
            "count": count,
            "keywords": keywords[:4]
        })
    return sorted(results, key=lambda x: -x["count"])


def _sentiment_trend(papers):
    pos = {"improve","effective","significant","benefit","novel","advance",
           "promising","success","increased","better","efficacy","accurate",
           "superior","innovative","potent","robust","enhanced","optimal"}
    neg = {"failure","risk","adverse","toxicity","limited","poor","decreased",
           "ineffective","resistance","complication","worse","relapse",
           "recurrence","aggressive","metastatic","fatal","severe","toxic"}

    from collections import defaultdict
    year_scores = defaultdict(list)
    for p in papers:
        year = p.get("year", 0)
        abstract = (p.get("abstract") or "").lower().split()
        if not abstract or year < 1990:
            continue
        p_count = sum(1 for w in abstract if w in pos)
        n_count = sum(1 for w in abstract if w in neg)
        score = round((p_count - n_count) / max(len(abstract) / 100, 1), 3)
        year_scores[year].append(score)

    return [
        {"year": y, "sentiment": round(sum(s) / len(s), 3)}
        for y, s in sorted(year_scores.items())
    ]