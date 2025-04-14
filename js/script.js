// JavaScript for Boarding Tutor Reference Guide Website

document.addEventListener('DOMContentLoaded', function() {
    // Mobile menu toggle
    const menuToggle = document.querySelector('.mobile-menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    
    if (menuToggle) {
        menuToggle.addEventListener('click', function() {
            navLinks.classList.toggle('show');
        });
    }
    
    // Close mobile menu when clicking outside
    document.addEventListener('click', function(event) {
        if (!event.target.closest('#main-nav') && !event.target.closest('.mobile-menu-toggle')) {
            if (navLinks && navLinks.classList.contains('show')) {
                navLinks.classList.remove('show');
            }
        }
    });
    
    // Add touch support for mobile devices
    if ('ontouchstart' in window) {
        document.body.classList.add('touch-device');
        
        // Make navigation more touch-friendly
        const navItems = document.querySelectorAll('.nav-links li');
        navItems.forEach(item => {
            item.addEventListener('touchstart', function() {
                this.classList.add('touch-active');
            });
            
            item.addEventListener('touchend', function() {
                setTimeout(() => {
                    this.classList.remove('touch-active');
                }, 300);
            });
        });
    }
    
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
                
                // Update URL without page reload
                history.pushState(null, null, targetId);
            }
        });
    });
    
    // Table of contents active state
    const tocLinks = document.querySelectorAll('.table-of-contents a');
    if (tocLinks.length > 0) {
        const sections = document.querySelectorAll('section[id]');
        
        window.addEventListener('scroll', function() {
            let current = '';
            
            sections.forEach(section => {
                const sectionTop = section.offsetTop;
                const sectionHeight = section.clientHeight;
                if (pageYOffset >= sectionTop - 100) {
                    current = section.getAttribute('id');
                }
            });
            
            tocLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === '#' + current) {
                    link.classList.add('active');
                }
            });
        });
    }
    
    // Initialize search functionality if search form exists
    const searchForm = document.getElementById('search-form');
    if (searchForm) {
        searchForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const searchTerm = document.getElementById('search-input').value.trim().toLowerCase();
            if (searchTerm.length < 2) {
                alert('Please enter at least 2 characters to search');
                return;
            }
            
            // Redirect to search results page with query parameter
            window.location.href = 'search-results.html?q=' + encodeURIComponent(searchTerm);
        });
    }
    
    // Handle search results page if we're on it
    if (window.location.pathname.includes('search-results.html')) {
        const urlParams = new URLSearchParams(window.location.search);
        const searchTerm = urlParams.get('q');
        
        if (searchTerm) {
            document.getElementById('search-term').textContent = searchTerm;
            document.getElementById('search-input').value = searchTerm;
            performSearch(searchTerm);
        }
    }
    
    // Print button functionality
    const printButtons = document.querySelectorAll('.print-button');
    if (printButtons.length > 0) {
        printButtons.forEach(button => {
            button.addEventListener('click', function() {
                window.print();
            });
        });
    }
    
    // Responsive image handling
    const images = document.querySelectorAll('img');
    images.forEach(img => {
        if (!img.hasAttribute('loading')) {
            img.setAttribute('loading', 'lazy');
        }
        if (!img.hasAttribute('alt') && !img.classList.contains('decoration')) {
            img.setAttribute('alt', 'Boarding tutor guide image');
        }
    });
    
    // Add viewport check for animations
    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    if (animatedElements.length > 0) {
        const checkIfInView = () => {
            animatedElements.forEach(element => {
                const elementTop = element.getBoundingClientRect().top;
                const elementVisible = 150;
                
                if (elementTop < window.innerHeight - elementVisible) {
                    element.classList.add('active');
                }
            });
        };
        
        window.addEventListener('scroll', checkIfInView);
        checkIfInView(); // Check on initial load
    }
});

// Search functionality
function performSearch(searchTerm) {
    // This is a simplified search implementation
    // In a real implementation, you would use a search index or API
    
    const resultsContainer = document.getElementById('search-results');
    if (!resultsContainer) return;
    
    // Clear previous results
    resultsContainer.innerHTML = '<p>Searching...</p>';
    
    // Simulate search delay
    setTimeout(() => {
        // Get search data (in a real implementation, this would be loaded from a JSON file or API)
        fetch('js/search-data.json')
            .then(response => response.json())
            .then(data => {
                const results = data.filter(item => {
                    return item.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           item.content.toLowerCase().includes(searchTerm.toLowerCase());
                });
                
                displaySearchResults(results, searchTerm);
            })
            .catch(error => {
                resultsContainer.innerHTML = '<p>Error loading search data. Please try again later.</p>';
                console.error('Search error:', error);
            });
    }, 500);
}

function displaySearchResults(results, searchTerm) {
    const resultsContainer = document.getElementById('search-results');
    
    if (results.length === 0) {
        resultsContainer.innerHTML = `<p>No results found for "${searchTerm}".</p>
                                     <p>Try using different keywords or check your spelling.</p>`;
        return;
    }
    
    let html = `<p>Found ${results.length} result${results.length === 1 ? '' : 's'} for "${searchTerm}":</p>
                <div class="search-results-list">`;
    
    results.forEach(result => {
        // Highlight the search term in the excerpt
        let excerpt = result.excerpt || '';
        if (!excerpt) {
            excerpt = result.content.substring(0, 150) + '...';
        }
        
        const highlightedExcerpt = excerpt.replace(
            new RegExp(searchTerm, 'gi'),
            match => `<mark>${match}</mark>`
        );
        
        html += `<div class="search-result-item">
                    <h3><a href="${result.url}">${result.title}</a></h3>
                    <p>${highlightedExcerpt}</p>
                    <a href="${result.url}" class="btn">View</a>
                </div>`;
    });
    
    html += '</div>';
    resultsContainer.innerHTML = html;
}
