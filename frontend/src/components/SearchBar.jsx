// frontend/src/components/SearchBar.jsx
export default function SearchBar({ onSearch }) {
  function handleSubmit(e) {
    e.preventDefault();
    const q = e.target.elements.query.value.trim();
    const year = e.target.elements.year.value.trim();
    onSearch({ query: q, year: year || undefined });
  }
  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
      <input name="query" placeholder="Search movies or TV..." />
      <input name="year" placeholder="Year (optional)" style={{ width: 120 }} />
      <button type="submit">Search</button>
    </form>
  );
}
