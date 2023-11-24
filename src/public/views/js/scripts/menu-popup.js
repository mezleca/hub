const popupers_button = document.getElementById("popup-menu");
const popupers = document.querySelector(".menu-popup");

popupers_button.addEventListener("click", (event) => {
    if (popupers.style.display == "none") {
        popupers_button.innerText = "▲";
        popupers.style.display = "flex";
    }
    else {
        popupers_button.innerText = "▼";
        popupers.style.display = "none";
    }
});