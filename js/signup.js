const sign_in_btn=document.getElementById("sign-in-btn");
const sign_up_btn=document.getElementById("sign-up-btn");
const sign_in_btn2=document.getElementById("sign-in-btn2");
const sign_up_btn2=document.getElementById("sign-up-btn2");
const container_one=document.querySelector(".container-one");
const container_two=document.querySelector(".container-two");
const loginBtn=document.getElementById("loginBtn");
const signUpBtn=document.getElementById("signUpBtn");
sign_up_btn.addEventListener("click",()=>{
    container_one.classList.toggle("d-none");
    container_two.classList.toggle("d-none");
});
sign_in_btn.addEventListener("click",()=>{
    container_one.classList.toggle("d-none");
    container_two.classList.toggle("d-none");
});

sign_up_btn2.addEventListener("click",()=>{
    container_one.classList.toggle("d-none");
    container_two.classList.toggle("d-none");
});
sign_in_btn2.addEventListener("click",()=>{
    container_one.classList.toggle("d-none");
    container_two.classList.toggle("d-none");
});
loginBtn.addEventListener("submit",async function(event){
    event.preventDefault();
    const username=document.getElementById("loginUser").value;
    const password=document.getElementById("loginPassword").value;
    const response=await fetch('/signin',{
        method:"POST",
        headers:{
            'content-type':'application/json'
        },
        body:JSON.stringify({
            username,password
        })
    });
    if(response.ok){
        alert("Successfully signed up");
    }
    else{
        alert("Failed to sign up");
    }
});

signUpBtn.addEventListener("submit",async function(event){
    event.preventDefault();
    console.log("Inside SignUp");
    const username=document.getElementById("signUpUser").value;
    const password=document.getElementById("signUpPassword").value;
    const email=document.getElementById("signUpEmail").value
    const response=await fetch('/signup',{
        method:"POST",
        headers:{
            'content-type':'application/json'
        },
        body:JSON.stringify({
            username,email,password
        })
    });
    if(response.ok){
        alert("Successfully signed up");
    }
    else{
        alert("Failed to sign up");
    }
});
