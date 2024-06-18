const searchForm = document.getElementById("searchForm");
const searchEl = document.getElementById("searchInput");

// Define the searchRecipe function outside of the event listener
const searchRecipe = async (query) => {
    try {
        // Construct the API endpoint URL with the search query
        const url = `https://www.themealdb.com/api/json/v1/1/search.php?s=${query}`;

        // Fetch data from the API
        const response = await fetch(url);
        
        // Check if the response is successful
        if (!response.ok) {
            throw new Error('Failed to fetch recipe data');
        }

        // Parse the response JSON data
        const data = await response.json();
        
        // Extract recipe details from the response
        const recipes = data.meals.map(meal => ({
            id: meal.idMeal,
            name: meal.strMeal,
            category: meal.strCategory,
            area: meal.strArea,
            instructions: meal.strInstructions,
            thumbnail: meal.strMealThumb,
            tags: meal.strTags ? meal.strTags.split(',') : [],
            ingredients: getIngredients(meal),
            youtube: meal.strYoutube,
        }));

        return recipes;
    } catch (error) {
        console.error('Error fetching recipe data:', error.message);
        return null;
    }
};

// Helper function to extract ingredients from the meal object
const getIngredients = (meal) => {
    const ingredients = [];
    for (let i = 1; i <= 20; i++) {
        if (meal[`strIngredient${i}`]) {
            ingredients.push({
                ingredient: meal[`strIngredient${i}`],
                measure: meal[`strMeasure${i}`],
            });
        } else {
            break;
        }
    }
    return ingredients;
};

// Add event listener to the form
searchForm.addEventListener("submit", async function(e) {
    e.preventDefault(); // Prevent the default form submission
    const query = searchEl.value;
    console.log("Search Input:", query);

    // Call the searchRecipe function and handle the response
    try {
        const recipes = await searchRecipe(query);
        console.log("Recipes:", recipes);
        // Handle the retrieved recipes here
        recipes.forEach(recipe => {
            console.log(recipe);
        });
    } catch (error) {
        console.error('Error:', error);
    }
    
});
