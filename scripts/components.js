// components.js
// Initialize header/footer/search when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
  // Load header/footer
  await loadComponents();
  
  // Initialize search AFTER MiniSearch is loaded
  await initSearch();
});

async function loadComponents() {
  // Header
  const headerResponse = await fetch('./components/header.html');
  document.querySelector('header').innerHTML = await headerResponse.text();

  // Footer
  const footerResponse = await fetch('./components/footer.html');
  document.querySelector('footer').innerHTML = await footerResponse.text();
}

// Initialize search
async function initSearch() {
  const searchInput = document.getElementById('search-input');
  const searchResults = document.getElementById('search-results');

  // 0. Fetch the plain array of documents
  let docs = [];
  try {
    const response = await fetch('data/search-index.json');
    docs = await response.json();
  } catch (err) {
    console.error('Failed to load search index:', err);
    return;
  }

  try {
    // 1. Initialize MiniSearch and add documents
    const miniSearch = new MiniSearch({
      fields: ['title', 'content'],
      storeFields: ['title', 'url'],
      idField: 'url' // Use 'url' as the unique identifier
    });
    miniSearch.addAll(docs);
    
    // 2. Set up search input event
    searchInput.addEventListener('input', (e) => {
      const query = e.target.value.trim();
      if (!query) {
        searchResults.innerHTML = '';
        searchResults.style.display = 'none';
        return;
      }
      const results = miniSearch.search(query, { prefix: true, fuzzy: 0.2 });
      displayResults(results, searchResults);
    });
  } catch (error) {
    console.error('Search initialization failed:', error);
  }
}

// 3. Display search results
function displayResults(results, container) {
  if (!results.length) {
    container.innerHTML = '<div class="search-result">No results found.</div>';
    container.style.display = 'block';
    return;
  }
  container.innerHTML = results.map(item => `
    <div class="search-result">
      <a href="${item.url}">${item.title}</a>
    </div>
  `).join('');
  container.style.display = 'block';
  // searchResults.style.display = results.length ? 'block' : 'none';
}

