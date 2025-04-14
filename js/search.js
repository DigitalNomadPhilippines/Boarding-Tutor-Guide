// Enhanced search functionality for Boarding Tutor Reference Guide
document.addEventListener('DOMContentLoaded', function() {
    // Add search form to all pages
    const headerContainer = document.querySelector('header .container');
    if (headerContainer && !document.getElementById('header-search-form')) {
        const searchFormHTML = `
            <div class="header-search">
                <form id="header-search-form" action="search-results.html" method="get">
                    <input type="text" id="header-search-input" name="q" placeholder="Search the guide..." aria-label="Search">
                    <button type="submit" aria-label="Submit search"><i class="fas fa-search"></i></button>
                </form>
            </div>
        `;
        headerContainer.insertAdjacentHTML('beforeend', searchFormHTML);
    }

    // Initialize search functionality if search form exists
    const searchForms = document.querySelectorAll('form[action="search-results.html"]');
    if (searchForms.length > 0) {
        searchForms.forEach(form => {
            form.addEventListener('submit', function(e) {
                e.preventDefault();
                const searchInput = this.querySelector('input[name="q"]');
                const searchTerm = searchInput.value.trim().toLowerCase();
                if (searchTerm.length < 2) {
                    alert('Please enter at least 2 characters to search');
                    return;
                }
                
                // Redirect to search results page with query parameter
                window.location.href = 'search-results.html?q=' + encodeURIComponent(searchTerm);
            });
        });
    }
    
    // Handle search results page if we're on it
    if (window.location.pathname.includes('search-results.html')) {
        const urlParams = new URLSearchParams(window.location.search);
        const searchTerm = urlParams.get('q');
        
        if (searchTerm) {
            const searchTermDisplay = document.getElementById('search-term');
            const searchInput = document.getElementById('search-input');
            
            if (searchTermDisplay) {
                searchTermDisplay.textContent = searchTerm;
            }
            
            if (searchInput) {
                searchInput.value = searchTerm;
            }
            
            performSearch(searchTerm);
        }
    }
});

// Enhanced search functionality
function performSearch(searchTerm) {
    const resultsContainer = document.getElementById('search-results');
    if (!resultsContainer) return;
    
    // Clear previous results
    resultsContainer.innerHTML = '<p>Searching...</p>';
    
    // Get search data
    fetch('js/search-data.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            // Perform search with relevance scoring
            const results = searchWithRelevance(data, searchTerm);
            displaySearchResults(results, searchTerm);
        })
        .catch(error => {
            resultsContainer.innerHTML = `
                <div class="alert alert-danger">
                    <p>Error loading search data. Please try again later.</p>
                    <p>Error details: ${error.message}</p>
                </div>`;
            console.error('Search error:', error);
        });
}

// Search with relevance scoring
function searchWithRelevance(data, searchTerm) {
    // Split search term into keywords
    const keywords = searchTerm.toLowerCase().split(/\s+/).filter(word => word.length > 1);
    
    // Calculate relevance score for each item
    const scoredResults = data.map(item => {
        let score = 0;
        const title = item.title.toLowerCase();
        const content = item.content.toLowerCase();
        
        // Check for exact match in title (highest relevance)
        if (title.includes(searchTerm.toLowerCase())) {
            score += 10;
        }
        
        // Check for exact match in content
        if (content.includes(searchTerm.toLowerCase())) {
            score += 5;
        }
        
        // Check for individual keyword matches
        keywords.forEach(keyword => {
            // Title keyword matches
            if (title.includes(keyword)) {
                score += 3;
            }
            
            // Content keyword matches
            if (content.includes(keyword)) {
                score += 1;
            }
            
            // URL matches (indicates relevant section)
            if (item.url.toLowerCase().includes(keyword)) {
                score += 2;
            }
        });
        
        return {
            ...item,
            score
        };
    });
    
    // Filter items with score > 0 and sort by score (descending)
    return scoredResults
        .filter(item => item.score > 0)
        .sort((a, b) => b.score - a.score);
}

function displaySearchResults(results, searchTerm) {
    const resultsContainer = document.getElementById('search-results');
    
    if (results.length === 0) {
        resultsContainer.innerHTML = `
            <div class="alert alert-info">
                <p>No results found for "${searchTerm}".</p>
                <p>Try using different keywords or check your spelling.</p>
                <p>You can also browse the guide using the navigation menu.</p>
            </div>`;
        return;
    }
    
    let html = `
        <p>Found ${results.length} result${results.length === 1 ? '' : 's'} for "${searchTerm}":</p>
        <div class="search-results-list">`;
    
    results.forEach(result => {
        // Highlight the search term in the excerpt
        let excerpt = result.excerpt || '';
        if (!excerpt) {
            excerpt = result.content.substring(0, 150) + '...';
        }
        
        // Create regex that matches whole words for better highlighting
        const searchTermRegex = new RegExp('\\b(' + searchTerm.split(' ').join('|') + ')\\b', 'gi');
        const highlightedExcerpt = excerpt.replace(
            searchTermRegex,
            match => `<mark>${match}</mark>`
        );
        
        html += `
            <div class="search-result-item">
                <h3><a href="${result.url}">${result.title}</a></h3>
                <p class="search-result-url">${result.url}</p>
                <p>${highlightedExcerpt}</p>
                <a href="${result.url}" class="btn">View</a>
            </div>`;
    });
    
    html += '</div>';
    
    // Add related searches suggestion
    html += `
        <div class="related-searches">
            <h3>Related Searches</h3>
            <ul>
                ${getRelatedSearches(searchTerm).map(term => 
                    `<li><a href="search-results.html?q=${encodeURIComponent(term)}">${term}</a></li>`
                ).join('')}
            </ul>
        </div>`;
    
    resultsContainer.innerHTML = html;
}

// Generate related search terms based on the current search
function getRelatedSearches(searchTerm) {
    const relatedTerms = {
        'tutor': ['boarding tutor responsibilities', 'tutor training', 'tutor communication skills'],
        'pastoral': ['pastoral care strategies', 'pastoral support', 'pastoral activities'],
        'boarding': ['boarding school', 'boarding house management', 'boarding student wellbeing'],
        'student': ['student support', 'student wellbeing', 'student relationships'],
        'homesick': ['homesickness management', 'homesickness strategies', 'student adjustment'],
        'parent': ['parent communication', 'working with parents', 'parent relationships'],
        'conflict': ['conflict resolution', 'student disputes', 'behavior management'],
        'academic': ['academic support', 'study skills', 'tutoring techniques'],
        'crisis': ['crisis management', 'emergency protocols', 'student safety'],
        'cultural': ['cultural sensitivity', 'international students', 'cultural inclusion']
    };
    
    // Find matching related terms
    let related = [];
    
    // Check if search term matches any key exactly
    if (relatedTerms[searchTerm.toLowerCase()]) {
        related = relatedTerms[searchTerm.toLowerCase()];
    } else {
        // Check for partial matches in keys
        Object.keys(relatedTerms).forEach(key => {
            if (searchTerm.toLowerCase().includes(key) || key.includes(searchTerm.toLowerCase())) {
                related = related.concat(relatedTerms[key]);
            }
        });
    }
    
    // If no matches, return default related searches
    if (related.length === 0) {
        related = [
            'boarding tutor responsibilities',
            'pastoral care strategies',
            'student wellbeing',
            'communication techniques',
            'conflict resolution'
        ];
    }
    
    // Return up to 5 unique related searches
    return [...new Set(related)].slice(0, 5);
}
