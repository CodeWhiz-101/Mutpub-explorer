import { useState, useEffect } from "react";

function App() {
  const [query, setQuery] = useState("");
  const [articles, setArticles] = useState([]);
  const [filteredArticles, setFilteredArticles] = useState([]);
  const [loading, setLoading] = useState(false);

  const [selectedJournal, setSelectedJournal] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedAuthor, setSelectedAuthor] = useState("");

  const [journalFilterInput, setJournalFilterInput] = useState("");
  const [authorFilterInput, setAuthorFilterInput] = useState("");

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const response = await fetch(
        `http://localhost:8000/api/search/${encodeURIComponent(query)}`
      );
      const data = await response.json();
      const results = data["results:"] || data.results;
      setArticles(results);
      setFilteredArticles(results);
    } catch (err) {
      console.error("Failed to fetch:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let filtered = [...articles];

    if (selectedJournal) {
      filtered = filtered.filter((a) => a.journal === selectedJournal);
    }
    if (selectedYear) {
      filtered = filtered.filter((a) => a.year === selectedYear);
    }
    if (selectedAuthor) {
      filtered = filtered.filter((a) => a.authors.includes(selectedAuthor));
    }

    setFilteredArticles(filtered);
  }, [selectedJournal, selectedYear, selectedAuthor, articles]);

  const allJournals = [...new Set(articles.map((a) => a.journal))];
  const allYears = [...new Set(articles.map((a) => a.year))];
  const allAuthors = [...new Set(articles.flatMap((a) => a.authors))];

  const filteredJournals = allJournals.filter((j) =>
    j.toLowerCase().includes(journalFilterInput.toLowerCase())
  );
  const filteredAuthors = allAuthors.filter((a) =>
    a.toLowerCase().includes(authorFilterInput.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-4xl font-bold text-center mb-6">MutPub Explorer 🔬</h1>

      <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-8">
        <input
          type="text"
          placeholder="Search PubMed..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="p-3 w-full sm:w-96 rounded-lg text-black"
        />
        <button
          onClick={handleSearch}
          className="bg-blue-600 px-6 py-3 rounded-lg hover:bg-blue-500 transition"
        >
          Search
        </button>
      </div>

      {articles.length > 0 && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {/* 🔍 Journal filter with input */}
          <div>
            <input
              type="text"
              placeholder="Filter Journals..."
              value={journalFilterInput}
              onChange={(e) => setJournalFilterInput(e.target.value)}
              className="w-full p-2 mb-1 rounded text-black"
            />
            <select
              value={selectedJournal}
              onChange={(e) => setSelectedJournal(e.target.value)}
              className="w-full p-2 rounded text-black"
            >
              <option value="">All Journals</option>
              {filteredJournals.map((j, i) => (
                <option key={i} value={j}>
                  {j}
                </option>
              ))}
            </select>
          </div>

          {/* 📅 Year filter */}
          <div>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full p-2 rounded text-black"
            >
              <option value="">All Years</option>
              {allYears.map((y, i) => (
                <option key={i} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          {/* 👤 Author filter with input */}
          <div>
            <input
              type="text"
              placeholder="Filter Authors..."
              value={authorFilterInput}
              onChange={(e) => setAuthorFilterInput(e.target.value)}
              className="w-full p-2 mb-1 rounded text-black"
            />
            <select
              value={selectedAuthor}
              onChange={(e) => setSelectedAuthor(e.target.value)}
              className="w-full p-2 rounded text-black"
            >
              <option value="">All Authors</option>
              {filteredAuthors.map((a, i) => (
                <option key={i} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {loading && <p className="text-center text-lg">Loading...</p>}

      <div className="space-y-4">
        {filteredArticles.map((article, index) => (
          <div
            key={index}
            className="bg-gray-800 p-4 rounded-xl shadow-md border border-gray-700"
          >
            <h2 className="text-xl font-semibold">{article.title}</h2>
            <p className="text-sm text-gray-300 mb-2">
              <span className="italic">{article.journal}</span> ({article.year})
            </p>
            <p className="text-gray-200">
              {article.abstract.length > 300
                ? article.abstract.slice(0, 300) + "..."
                : article.abstract}
            </p>
            <a
              href={article.pubmed_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:underline inline-block mt-2"
            >
              Read More →
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;


