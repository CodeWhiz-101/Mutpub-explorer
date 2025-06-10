from fastapi import FastAPI
import requests
from fastapi.middleware.cors import CORSMiddleware
from xml.etree import ElementTree as ET

app=FastAPI()

app.add_middleware(CORSMiddleware,allow_origins=["*"],allow_credentials=True,allow_methods=["*"],allow_headers=["*"])

@app.get("/api/search/{query}")
def search_mutation(query:str):
    search_url=f"https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi"
    search_params={
        "db":"pubmed",
        "term": query,
        "retmode":"json",
        "retmax":5   #this will limit to 5 articles
    }

    search_response=requests.get(search_url,params=search_params)
    ids=search_response.json()["esearchresult"]["idlist"]

    if not ids:
        return{"results": []}

    fetch_url=f"https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi"
    fetch_params={
        "db":"pubmed",
        "id": ",".join(ids),
        "retmode": "xml"
    }

    fetch_response=requests.get(fetch_url,params=fetch_params)

    #the obtained output will be unstructured xml, so we are parsing it below

    root=ET.fromstring(fetch_response.text)
    articles=[]
#here we loop through each of the pubmed articles and by using findtext we extract fields like title,abstract etc...
    for article in root.findall(".//PubmedArticle"):
        title=article.findtext(".//ArticleTitle", default="No Title")
        abstract=article.findtext(".//AbstractText", default="No abstract")
        journal=article.findtext(".//Journal/Title", default="unknown journal")
        year=article.findtext(".//PubDate/Year", default="unknown year")
        pmid=article.findtext(".//PMID", default="-")
#Here we store everything to a json dictionary
        authors=[]
        for author in article.findall(".//Author"):
            lastname=author.findtext("LastName")
            initials=author.findtext("Initials")
            if lastname and initials:
                authors.append(f"{lastname} {initials}")

        articles.append({
             "title": title,
            "abstract": abstract,
            "journal": journal,
            "year": year,
            "authors": authors,
            "pubmed_url": f"https://pubmed.ncbi.nlm.nih.gov/{pmid}/"
        })
    return {"results": articles}
