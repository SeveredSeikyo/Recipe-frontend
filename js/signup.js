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