const menuEl=document.getElementById("menuIcon");
const menuList=document.getElementById("menuList");
menuEl.addEventListener("click",()=>{
    menuList.classList.toggle("menu-list-display");
});