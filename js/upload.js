// public/js/upload.js

const titleEl = document.getElementById("title");
const descriptionEl = document.getElementById("description");
const imageEl = document.getElementById("image");
const postItemContainer = document.getElementById("postItemContainer");
const uploadForm = document.getElementById("uploadForm");

uploadForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const form = event.target;
    const formData = new FormData(form);

    try {
        const response = await fetch('/api/post', {
            method: 'POST',
            body: formData, // Use FormData to send image and metadata
        });

        const result = await response.json();
        if (response.ok) {
            // Clear form fields
            titleEl.value = "";
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
        const response = await fetch('/api/posts'); // Assuming this endpoint returns posts
        const posts = await response.json();
        
        // Clear existing posts
        postItemContainer.innerHTML = "";
        
        // Append new posts
        posts.forEach(post => {
            const postElement = document.createElement('div');
            postElement.classList.add('post-element','col-12','col-md-4','text-center');
            
            const title = document.createElement('h3');
            title.textContent = post.title;
            
            const description = document.createElement('p');
            description.textContent = post.description;
            
            const image = document.createElement('img');
            image.src = post.imageUrl;
            image.alt = post.title;
            image.classList.add("w-50");
            
            const date = document.createElement('p');
            date.textContent = post.formattedDate; // Assuming date is returned from the server
            
            postElement.appendChild(image);
            postElement.appendChild(title);
            postElement.appendChild(description);
            postElement.appendChild(date);
            
            postItemContainer.appendChild(postElement);
        });
    } catch (error) {
        console.error('Error fetching posts:', error);
    }
}

// Call loadPosts function when the page loads
window.addEventListener('load', loadPosts);
