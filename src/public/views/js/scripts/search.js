const searchInput = document.getElementById("search");
const searchIcon = document.querySelector(".search-icon");

if (searchInput && searchIcon) {

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
    
        window.location.href = "/search/" + searchInput.value;
    });
}