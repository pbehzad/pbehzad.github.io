// Function to show the selected section and hide the others
function showSection(event, sectionId) {
    // Prevent the default anchor link action
    event.preventDefault();

    // Get all sections
    const sections = document.querySelectorAll('.section');
    
    // Loop through all sections
    sections.forEach(section => {
        if (section.id === sectionId) {
            // Show the clicked section
            section.classList.add('visible');
        } else {
            // Hide all other sections
            section.classList.remove('visible');
        }
    });
}
// Show Home section on page load by default
window.onload = function() {
    showSection('home');
};

function loadAboutContent() {
    fetch('about.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('about-content').innerHTML = data;
        })
        .catch(error => console.error('Error loading About content:', error));
}

// Call the function to load the content when the page loads
document.addEventListener('DOMContentLoaded', loadAboutContent);

fetch('compositions.json')
    .then(response => response.json())
    .then(data => {
        const compositionSection = document.getElementById('composition-section');
        data.forEach(item => {
            const div = document.createElement('div');
            div.classList.add('composition');

            div.innerHTML = `
                <h3>${item.title}</h3>
                <p>Date: ${item.date}</p>
                <p>${item.description}</p>
                <a href="${item.link}">View Composition</a>
            `;
            
            compositionSection.appendChild(div);
        });
    })
    .catch(error => console.error('Error loading compositions:', error));
    