const pfp = document.getElementById("pfp");
const container = document.querySelector(".container");
const popup = document.querySelector(".popup-overlay");

container.addEventListener("click", (event) => {
    if (event.target.id == "pfp") {
        popup.style.display = "flex";
    }
});