// frontend/src/components/SearchBar.jsx
import "./SearchBar.css";

export default function SearchBar({ onSearch }) {
  function handleSubmit(e) {
    e.preventDefault();
    const q = e.target.elements.query.value.trim();
    const year = e.target.elements.year.value.trim();
    onSearch({ query: q, year: year || undefined });
  }

  return (
    <form className="tmdb-searchbar" onSubmit={handleSubmit}>
      <div className="tmdb-input-wrapper">
        <input
          name="query"
          placeholder="Search for a movie or TV show..."
          className="tmdb-input"
        />
      </div>

      <input
        name="year"
        placeholder="Year"
        className="tmdb-input year-input"
      />

      <button type="submit" className="tmdb-btn">
        Search
      </button>
    </form>
  );
}
