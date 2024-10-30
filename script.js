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
    