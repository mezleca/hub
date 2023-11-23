const icons = document.querySelector(".icons");
const texts = document.querySelector(".texts");
const resto = document.querySelector(".resto");

if (icons && resto && texts) {
    resto.addEventListener("mouseover", () => {
        icons.style.display = "none";
        texts.style.display = "flex";
    });
    
    resto.addEventListener("mouseout", () => {
        icons.style.display = "flex";
        texts.style.display = "none";
    });
}