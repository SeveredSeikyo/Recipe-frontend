const mealList = document.getElementById('meal');
const mealDetailsContent = document.querySelector('.meal-details-content');
const postResultsContainer = document.querySelector('.post-results');
const recipeCloseBtn = document.getElementById('recipe-close-btn');
const titleEl = document.getElementById("title");
const descriptionEl = document.getElementById("description");
const ingredientEl = document.getElementById("ingredients");
const imageEl = document.getElementById("image");
const uploadForm = document.getElementById("uploadForm");

/*uploadForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const form = event.target;
    const formData = new FormData(form);

    try {
        const response = await fetch('/api/post', {
            method: 'POST',
            body: formData,
        });

        const result = await response.json();
        if (response.ok) {
            // Clear form fields
            titleEl.value = "";
            ingredientEl.value = "";
            descriptionEl.value = "";
            imageEl.value = "";

            // Reload posts after successful upload
            loadPosts();

            console.log(result);
        } else {
            alert('Error uploading image');
            console.error(result);
        }
    } catch (error) {
        console.error('Error:', error);
    }
});

// Function to fetch and display posts
async function loadPosts() {
    try {
        const response = await fetch('/api/posts');
        const posts = await response.json();

        let html = "";
        if (posts.length > 0) {
            posts.forEach(post => {
                html += `
                    <div class="meal-item" data-id="${post.id}">
                        <div class="meal-img">
                            <img src="${post.imageUrl}" alt="food">
                        </div>
                        <div class="meal-name">
                            <h3>${post.title}</h3>
                            <a href="#" class="recipe-btn">Get Recipe</a>
                        </div>
                    </div>
                `;
            });
            mealList.classList.remove('notFound');
        } else {
            html = "Sorry, we didn't find any Post!";
            mealList.classList.add('notFound');
        }
        mealList.innerHTML = html; // Update the mealList content
    } catch (error) {
        console.error('Error fetching posts:', error);
    }
}

function mealRecipeModal(meal) {
    let post = meal[0];
    let html = `
        <h2 class="recipe-title">${post.title}</h2>
        <div class="recipe-instruct">
            <h3>Ingredients:</h3>
            <p>${post.ingredient}</p>
        </div>
        <div class="recipe-instruct">
            <h3>Directions:</h3>
            <p>${post.description}</p>
        </div>
        <div class="recipe-meal-img">
            <img src="${post.imageUrl}" alt="">
        </div>
    `;
    mealDetailsContent.innerHTML = html;
    mealDetailsContent.parentElement.classList.add('showRecipe');
}*/

uploadForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const form = event.target;
    const formData = new FormData(form);

    try {
        const response = await fetch('/api/post', {
            method: 'POST',
            body: formData,
        });

        const result = await response.json();
        if (response.ok) {
            // Clear form fields
            titleEl.value = "";
            ingredientEl.value = "";
            descriptionEl.value = "";
            imageEl.value = "";

            // Reload posts after successful upload
            loadPosts();

            console.log(result);
        } else {
            alert('Error uploading image');
            console.error(result);
        }
    } catch (error) {
        console.error('Error:', error);
    }
});

// Function to fetch and display posts
async function loadPosts() {
    try {
        const response = await fetch('/api/posts');
        const posts = await response.json();
        console.log(posts);
        let html = "";
        if (posts.length > 0) {
            posts.forEach(post => {
                html += `
                <div class="post-result">
                    <div class="post-title">
                        <h2>${post.title}</h2>
                        <p>${new Date(post.date).toLocaleDateString()}</p>
                    </div>
                    <div class="post-img">
                        <img src="${post.imageUrl}" alt="${post.title}">
                    </div>
                    <div class="post-ingredient expandable" data-full-text="${post.ingredients.replace(/\n/g, '<br>')}">
                        <p>${truncateText(post.ingredients)} <span class="more-link">..more</span></p>
                    </div>
                    <div class="post-description expandable" data-full-text="${post.description.replace(/\n/g, '<br>')}">
                        <p>${truncateText(post.description)} <span class="more-link">..more</span></p>
                    </div>
                </div>
                `;
            });
        } else {
            html = "<p>No posts available</p>";
        }

        postResultsContainer.innerHTML = html;

        // Add event listeners for "more" links
        document.querySelectorAll('.more-link').forEach(link => {
            link.addEventListener('click', (event) => {
                const parent = event.target.closest('.expandable');
                const fullText = parent.getAttribute('data-full-text');
                parent.innerHTML = `<p>${fullText} <span class="less-link">..less</span></p>`;

                // Add event listener for "less" link
                parent.querySelector('.less-link').addEventListener('click', (event) => {
                    parent.innerHTML = `<p>${truncateText(fullText)} <span class="more-link">..more</span></p>`;
                    parent.querySelector('.more-link').addEventListener('click', (event) => {
                        parent.innerHTML = `<p>${fullText} <span class="less-link">..less</span></p>`;
                    });
                });
            });
        });
    } catch (error) {
        console.error('Error fetching posts:', error);
    }
}

// Function to truncate text
function truncateText(text, length = 100) {
    if (text.length <= length) {
        return text;
    }
    return text.substring(0, length) + '...';
}

// Call loadPosts function when the page loads
window.addEventListener('load', () => {
    loadPosts();
});

/*mealList.addEventListener('click', getMealRecipe);
recipeCloseBtn.addEventListener('click', () => {
    mealDetailsContent.parentElement.classList.remove('showRecipe');
});*/