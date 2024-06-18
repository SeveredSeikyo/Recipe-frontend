const randomChoice=async function(){
    fetch("/api/random",{
        method:"POST",
        headers:{
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            "numRecipes": 15
        })
    })
    .then(response => response.json())
    .then(data => console.log(data));
};
window.addEventListener('load',randomChoice);