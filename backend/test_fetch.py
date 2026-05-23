from Bio import Entrez, Medline
Entrez.email = "sahelimajumder2004@gmail.com"
handle = Entrez.esearch(db="pubmed", term="histopathology cancer", retmax=5)
ids = Entrez.read(handle)["IdList"]
handle2 = Entrez.efetch(db="pubmed", id=ids, rettype="medline", retmode="text")
for p in Medline.parse(handle2): print(p.get("TI"), "—", p.get("DP"))

from Bio import Entrez, Medline

Entrez.email = "sahelimajumder2004@gmail.com"

def fetch_papers(query, max_results=20):
    # Step 1: search for IDs
    handle = Entrez.esearch(db="pubmed", term=query, retmax=max_results)
    ids = Entrez.read(handle)["IdList"]
    handle.close()

    # Step 2: fetch full records
    handle = Entrez.efetch(db="pubmed", id=ids, rettype="medline", retmode="text")
    papers = list(Medline.parse(handle))
    handle.close()

    # Step 3: extract the fields you need
    results = []
    for p in papers:
        results.append({
            "title":    p.get("TI", ""),
            "abstract": p.get("AB", ""),
            "authors":  p.get("AU", []),
            "year":     p.get("DP", "")[:4],
            "journal":  p.get("TA", ""),
            "keywords": p.get("MH", []),
            "pmid":     p.get("PMID", ""),
        })
    return results

papers = fetch_papers("histopathology cancer classification", max_results=20)

for p in papers:
    print(f"{p['year']} | {p['title'][:60]}...")
    print(f"       Authors: {', '.join(p['authors'][:3])}")
    print()