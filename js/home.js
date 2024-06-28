const mealList = document.getElementById('meal');
const mealDetailsContent = document.querySelector('.meal-details-content');
const recipeCloseBtn = document.getElementById('recipe-close-btn');

const fetchRandomRecipes = async function() {
    try {
        const response = await fetch("/api/random", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                numRecipes: 15
            })
        });
        const data = await response.json();
        return data.randomRecipes;
    } catch (error) {
        console.error('Error fetching random recipes:', error);
        return [];
    }
};

const getMealList = async function() {
    console.log("Fetching random recipes...");
    const meals = await fetchRandomRecipes();
    let html = "";

    if (meals.length > 0) {
        meals.forEach(meal => {
            html += `
                <div class = "meal-item" data-id = "${meal.id}">
                    <div class = "meal-img">
                        <img src = "${meal.thumbnail}" alt = "food">
                    </div>
                    <div class = "meal-name">
                        <h3>${meal.name}</h3>
                        <a href = "#" class = "recipe-btn">Get Recipe</a>
                    </div>
                </div>
            `;
        });
        mealList.classList.remove('notFound');
    } else {
        html = "Sorry, we didn't find any meal!";
        mealList.classList.add('notFound');
    }

    mealList.innerHTML = html;
};

const fetchUserPosts = async function() {
    try {
        const response = await fetch("/api/userposts", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                numPosts: 15
            })
        });
        const data = await response.json();
        return data.userPosts;
    } catch (error) {
        console.error('Error fetching user posts:', error);
        return [];
    }
};
const getUserPostsList = async function() {
    console.log("Fetching user posts...");
    const posts = await fetchUserPosts();
    console.log(posts);
};

// Get recipe of the meal
function getMealRecipe(e) {
    e.preventDefault();
    if (e.target.classList.contains('recipe-btn')) {
        let mealItem = e.target.parentElement.parentElement;
        fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${mealItem.dataset.id}`)
        .then(response => response.json())
        .then(data => mealRecipeModal(data.meals));
    }
}

// Create a modal
function mealRecipeModal(meal) {
    console.log(meal);
    meal = meal[0];
    let html = `
        <h2 class = "recipe-title">${meal.strMeal}</h2>
        <p class = "recipe-category">${meal.strCategory}</p>
        <div class = "recipe-instruct">
            <h3>Instructions:</h3>
            <p>${meal.strInstructions}</p>
        </div>
        <div class = "recipe-meal-img">
            <img src = "${meal.strMealThumb}" alt = "">
        </div>
        <div class = "recipe-link">
            <a href = "${meal.strYoutube}" target = "_blank">Watch Video</a>
        </div>
    `;
    mealDetailsContent.innerHTML = html;
    mealDetailsContent.parentElement.classList.add('showRecipe');
}

const getUserName = async function() {
    try {
        const response = await fetch("/api/getuser/", {
            method: "POST",
            headers: { "Content-Type": "application/json" }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log(data);
    } catch (error) {
        console.error('Error:', error);
    }
}


window.addEventListener('load', ()=>{
    getUserName();
    getUserPostsList();
    getMealList();
});
mealList.addEventListener('click', getMealRecipe);
recipeCloseBtn.addEventListener('click', () => {
    mealDetailsContent.parentElement.classList.remove('showRecipe');
});