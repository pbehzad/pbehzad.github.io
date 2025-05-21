// Store all projects globally after fetching
let allProjects = [];
let currentPortfolioFilter = 'all'; // To keep track of the current filter

// Function to show the selected section and hide the others
function showSection(event, sectionId) {
    if (event && typeof event.preventDefault === 'function') {
        event.preventDefault();
    }

    const sections = document.querySelectorAll('.section');
    const navLinks = document.querySelectorAll('nav ul li a');

    let sectionFound = false;
    sections.forEach(section => {
        if (section.id === sectionId) {
            section.classList.add('visible');
            sectionFound = true;
        } else {
            section.classList.remove('visible');
        }
    });

    if (!sectionFound && sectionId !== 'home') {
        const homeSection = document.getElementById('home');
        if (homeSection) {
            homeSection.classList.add('visible');
            sectionId = 'home';
        } else if (sections.length > 0) {
            sections[0].classList.add('visible');
            sectionId = sections[0].id;
        }
    }

    navLinks.forEach(link => {
        const linkHref = link.getAttribute('href');
        const linkSectionId = linkHref && linkHref.startsWith('#') ? linkHref.substring(1) : null;
        if (linkSectionId === sectionId) {
            link.classList.add('active-nav-link');
        } else {
            link.classList.remove('active-nav-link');
        }
    });

    if ((sectionFound || sectionId === 'home') && window.location.hash !== `#${sectionId}`) {
        window.location.hash = sectionId;
    }
}

// Function to load About content
function loadAboutContent() {
    const aboutContentDiv = document.getElementById('about-content');
    if (aboutContentDiv) {
        fetch('about.html')
            .then(response => response.ok ? response.text() : Promise.reject('Failed to load about.html'))
            .then(data => { aboutContentDiv.innerHTML = data; })
            .catch(error => console.error('Error loading About content:', error));
    }
}

// Function to fetch projects.json
async function fetchProjects() {
    if (allProjects.length > 0) {
        return allProjects;
    }
    try {
        const response = await fetch('projects.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        allProjects = await response.json();
        console.log("Projects loaded:", allProjects);
        return allProjects;
    } catch (error) {
        console.error("Could not fetch or parse projects.json:", error);
        allProjects = [];
        return [];
    }
}

// Function to create image element or placeholder
function createImageElement(project) {
    if (project.imageUrl) {
        return `<img src="${project.imageUrl}" alt="${project.title}" onerror="this.parentElement.innerHTML = '<span>${project.imagePlaceholder || project.title} (Image not found)</span>'; this.parentElement.classList.add('img-placeholder-error');">`;
    } else {
        return `<div class="img-placeholder"><span>${project.imagePlaceholder || project.title}</span></div>`;
    }
}

// Function to display projects on the Portfolio section (wide cards)
function displayPortfolioProjects(projectsToDisplay) {
    const portfolioGrid = document.getElementById('portfolio-grid-content');
    if (!portfolioGrid) return;
    portfolioGrid.innerHTML = '';

    console.log("Displaying portfolio projects:", projectsToDisplay);

    if (projectsToDisplay.length === 0) {
        if (currentPortfolioFilter !== 'all') {
            portfolioGrid.innerHTML = `<p>No projects in category '${currentPortfolioFilter}' are marked for portfolio overview.</p>`;
        } else {
            portfolioGrid.innerHTML = `<p>No projects marked for portfolio overview. Add projects with "showInPortfolio": true in projects.json.</p>`;
        }
        return;
    }

    const categorizedProjects = {};
    projectsToDisplay.forEach(project => {
        if (!categorizedProjects[project.category]) {
            categorizedProjects[project.category] = [];
        }
        categorizedProjects[project.category].push(project);
    });
    console.log("Categorized for display (Portfolio):", categorizedProjects);

    const categoryOrder = ['Composition', 'Audio Engineering', 'Engraving (ZSCORE)', 'Audio Programming', 'Texts'];
    const sortedCategories = categoryOrder.filter(cat => categorizedProjects[cat] && categorizedProjects[cat].length > 0);
    Object.keys(categorizedProjects).forEach(cat => {
        if (!sortedCategories.includes(cat) && categorizedProjects[cat] && categorizedProjects[cat].length > 0) {
            sortedCategories.push(cat);
        }
    });

    sortedCategories.forEach(category => {
        const categoryHeading = document.createElement('h3');
        categoryHeading.classList.add('portfolio-category-heading');
        categoryHeading.textContent = category;
        portfolioGrid.appendChild(categoryHeading);

        categorizedProjects[category].forEach(project => {
            const item = document.createElement('div');
            item.classList.add('portfolio-item');
            // Image is outside the new "portfolio-item-content" div
            item.innerHTML = `
                ${createImageElement(project)} 
                <div class="portfolio-item-content">
                    <h3>${project.title}</h3>
                    <p>${project.description || 'No description available.'}</p>
                    <div class="tags">
                        ${project.tags ? project.tags.map(tag => `<span class="tag">${tag}</span>`).join('') : ''}
                    </div>
                    ${project.detailsLink ? `<a href="${project.detailsLink}" class="portfolio-link" ${project.detailsLink.startsWith('http') || project.detailsLink.startsWith('JSprojects') ? 'target="_blank" rel="noopener noreferrer"' : `onclick="showProjectDetails('${project.id}')"`}>View Details</a>` : ''}
                </div>
            `;
            portfolioGrid.appendChild(item);
        });
    });
}

// Filter portfolio items by category
function filterPortfolio(category) {
    console.log(`Filtering portfolio by: ${category}`);
    currentPortfolioFilter = category;
    const filterButtons = document.querySelectorAll('.category-filters .filter-btn');

    filterButtons.forEach(button => {
        if (button.dataset.category === category) {
            button.classList.add('active');
        } else {
            button.classList.remove('active');
        }
    });

    const overviewProjects = allProjects.filter(project => project.showInPortfolio === true);
    console.log("Overview projects (showInPortfolio:true):", overviewProjects.length, overviewProjects);

    let projectsToDisplay;
    if (category === 'all') {
        projectsToDisplay = overviewProjects;
    } else {
        projectsToDisplay = overviewProjects.filter(project => project.category === category);
    }
    console.log(`Projects to display for category '${category}':`, projectsToDisplay.length, projectsToDisplay);
    displayPortfolioProjects(projectsToDisplay);
}

// Function to display compositions in a list view
function displayCompositionsList(projects) {
    const compositionListContent = document.getElementById('composition-list-content');
    if (!compositionListContent) return;

    const compositions = projects.filter(project => project.category === 'Composition');
    compositionListContent.innerHTML = '';

    if (compositions.length === 0) {
        compositionListContent.innerHTML = "<p>No compositions to display yet.</p>";
        return;
    }

    const ul = document.createElement('ul');
    compositions.sort((a, b) => b.year - a.year);
    compositions.forEach(comp => {
        const li = document.createElement('li');
        li.classList.add('composition-list-item');

        let titleHtml;
        if (comp.detailsLink) {
            const isExternalOrTool = comp.detailsLink.startsWith('http') || comp.detailsLink.startsWith('JSprojects');
            const linkTarget = isExternalOrTool ? 'target="_blank" rel="noopener noreferrer"' : '';
            titleHtml = `<h3><a href="${comp.detailsLink}" class="title-link-no-style" ${linkTarget}>${comp.title}</a></h3>`;
        } else {
            titleHtml = `<h3>${comp.title}</h3>`;
        }

        li.innerHTML = `
            ${titleHtml}
            <p class="composition-meta">Year: ${comp.year} | Instruments: ${comp.instruments || 'N/A'}</p>
            <p>${comp.description || 'No description available.'}</p>
        `;
        ul.appendChild(li);
    });
    compositionListContent.appendChild(ul);
}

// Function to display ZSCORE projects (wide card style)
function displayZscoreProjects(projects) {
    const zscoreGridContent = document.getElementById('zscore-grid-content');
    if (!zscoreGridContent) return;

    const zscoreProjects = projects.filter(project => project.category === 'Engraving (ZSCORE)');
    zscoreGridContent.innerHTML = '';

    if (zscoreProjects.length === 0) {
        zscoreGridContent.innerHTML = "<p>No ZSCORE projects to display yet.</p>";
        return;
    }

    zscoreProjects.forEach(project => {
        const item = document.createElement('div');
        item.classList.add('portfolio-item');
        item.innerHTML = `
            ${createImageElement(project)}
            <div class="portfolio-item-content">
                <h3>${project.title}</h3>
                <p>${project.description || 'No description available.'}</p>
                <div class="tags">
                    ${project.tags ? project.tags.map(tag => `<span class="tag">${tag}</span>`).join('') : ''}
                </div>
                ${project.detailsLink ? `<a href="${project.detailsLink}" class="portfolio-link" ${project.detailsLink.startsWith('http') || project.detailsLink.startsWith('JSprojects') ? 'target="_blank" rel="noopener noreferrer"' : `onclick="showProjectDetails('${project.id}')"`}>View Details</a>` : ''}
            </div>
        `;
        zscoreGridContent.appendChild(item);
    });
}

// Function to display Text entries (list style)
function displayTextEntries(projects) {
    const textsContent = document.getElementById('texts-content');
    if (!textsContent) return;

    const textEntries = projects.filter(project => project.category === 'Texts');
    textsContent.innerHTML = '';

    if (textEntries.length === 0) {
        textsContent.innerHTML = "<p>No texts or essays to display yet.</p>";
        return;
    }

    const ul = document.createElement('ul');
    textEntries.sort((a, b) => b.year - a.year);
    textEntries.forEach(entry => {
        const li = document.createElement('li');
        li.classList.add('text-entry-item');
        let titleHtml;
        if (entry.detailsLink) {
            const isExternalOrTool = entry.detailsLink.startsWith('http') || entry.detailsLink.startsWith('JSprojects');
            const linkTarget = isExternalOrTool ? 'target="_blank" rel="noopener noreferrer"' : '';
            titleHtml = `<h3><a href="${entry.detailsLink}" class="title-link-no-style" ${linkTarget}>${entry.title}</a></h3>`;
        } else {
            titleHtml = `<h3>${entry.title}</h3>`;
        }

        li.innerHTML = `
            ${titleHtml}
            <p class="text-meta">Year: ${entry.year} | Type: ${entry.type || 'N/A'} ${entry.publication ? `| Publication: <span class="publication">${entry.publication}</span>` : ''}</p>
            <p>${entry.description || 'No description available.'}</p>
            <div class="tags">
                ${entry.tags ? entry.tags.map(tag => `<span class="tag">${tag}</span>`).join('') : ''}
            </div>
        `;
        ul.appendChild(li);
    });
    textsContent.appendChild(ul);
}

// Function to display tools (card style)
function displayTools(projects) {
    const toolsGridContent = document.getElementById('tools-grid-content');
    if (!toolsGridContent) return;

    const tools = projects.filter(project => project.category === 'Audio Programming' && project.tags && project.tags.includes('Tool'));
    toolsGridContent.innerHTML = '';

    if (tools.length === 0) {
        toolsGridContent.innerHTML = "<p>No tools to display yet.</p>";
        return;
    }

    tools.forEach(tool => {
        const item = document.createElement('div');
        item.classList.add('portfolio-item');
        item.innerHTML = `
            ${createImageElement(tool)}
            <div class="portfolio-item-content">
                <h3>${tool.title}</h3>
                <p>${tool.description || 'No description available.'}</p>
                <div class="tags">
                    ${tool.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                </div>
                ${tool.detailsLink ? `<a href="${tool.detailsLink}" class="portfolio-link" target="_blank" rel="noopener noreferrer">Launch Tool</a>` : ''}
            </div>
        `;
        toolsGridContent.appendChild(item);
    });
}

function showProjectDetails(projectId) {
    console.log("Show details for project ID:", projectId);
    const project = allProjects.find(p => p.id === projectId);
    if (project && project.detailsLink && !project.detailsLink.startsWith('http') && !project.detailsLink.startsWith('JSprojects')) {
        alert(`Navigating to details for: ${project.title}. Implement actual navigation or modal here.`);
    } else if (project && project.detailsLink) {
         alert(`Details for '${project.title}' would be shown here or on its dedicated page.`);
    } else {
        alert("No details link available for this project.");
    }
}

document.addEventListener('DOMContentLoaded', async function() {
    loadAboutContent();
    await fetchProjects();

    if (document.getElementById('portfolio-grid-content')) {
        filterPortfolio(currentPortfolioFilter);
    }
    displayCompositionsList(allProjects);
    displayTools(allProjects);
    displayZscoreProjects(allProjects);
    displayTextEntries(allProjects);

    const navLinks = document.querySelectorAll('nav ul li a');
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href && href.startsWith('#')) {
            link.addEventListener('click', function(event) {
                const sectionId = this.getAttribute('href').substring(1);
                showSection(event, sectionId);
            });
        }
    });

    const filterButtons = document.querySelectorAll('.category-filters .filter-btn');
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            filterPortfolio(this.dataset.category);
        });
    });

    const hash = window.location.hash.substring(1);
    let sectionToDisplay = 'home';

    if (hash && document.getElementById(hash)) {
        sectionToDisplay = hash;
    }
    showSection(null, sectionToDisplay);
});

window.addEventListener('hashchange', function() {
    const hash = window.location.hash.substring(1);
    if (hash && document.getElementById(hash)) {
        showSection(null, hash);
    } else if (!hash) {
        showSection(null, 'home');
    }
});
