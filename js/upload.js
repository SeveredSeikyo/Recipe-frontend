// public/js/upload.js
const titleEl=document.getElementById("title");
const descriptionEl=document.getElementById("description");
const imageEl=document.getElementById("image");
document.getElementById('uploadForm').addEventListener('submit', async (event) => {
    console.log("Inside");
    event.preventDefault();

    const form = event.target;
    const formData = new FormData(form);

    const file = formData.get('image');
    const title = formData.get('title');
    const description = formData.get('description');

    const payload = {
        title,
        description,
        image: file,
    };

    try {
        const response = await fetch('/api/post', {
            method: 'POST',
            body: formData, // Use FormData to send image and metadata
        });

        const result = await response.json();
        if (response.ok) {
            alert('post uploaded successfully!');
            titleEl.value="";
            descriptionEl.value="";
            imageEl.value="";
            console.log(result);
        } else {
            alert('Error uploading image');
            console.error(result);
        }
    } catch (error) {
        console.error('Error:', error);
    }
});
