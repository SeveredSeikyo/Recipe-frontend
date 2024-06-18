document.addEventListener('DOMContentLoaded', () => {
    const searchForm=document.getElementById("searchForm");
    const searchEl = document.getElementById("searchInput");
    searchForm.addEventListener("submit", function(e) {
        e.preventDefault(); // Prevent the default form submission
        console.log("Form submitted");
        const searchInput = searchEl.value;
        console.log("Search Input:",searchInput);
        fetch('/api/search', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ query: searchInput })
        })
        .then(response => {
            console.log(response); // Log the raw response object
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            console.log('Success:', data);
            //Handle the response data here
        })
        .catch((error) => {
            console.error('Error:', error);
        });
    });
});
