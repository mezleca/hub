const searchInput = document.getElementById("search");
const searchIcon = document.querySelector(".search-icon");
const div = document.querySelector(".results");

searchInput.addEventListener("input", function() {
    if (searchInput.value === "") {
        searchIcon.style.display = "none";
    } else {
        searchIcon.style.display = "block";
    }
});

searchIcon.addEventListener("click", () => {
    if (searchInput.value === "") {
        return;
    }

    window.location.href = "http://localhost:8080/search/" + searchInput.value;
});