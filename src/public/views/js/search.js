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

const update_div = (result) => {
    if (!result.length) {
        div.innerHTML = `<h1>nenhuma media foi encontrada com este nome :(</h1>`;
        return;
    }
    
    div.innerHTML = "";
    result.map((a, i) => {
        const is_mp4 = a.format == "mp4";
        div.innerHTML += `
        <div class="result" id="${i}">
            <h1><a href="/media/${a._id}">${a.name}</a></h1>
            <img src="${is_mp4 ? "https://w7.pngwing.com/pngs/314/584/png-transparent-computer-icons-video-display-resolution-others-angle-text-rectangle.png" : "data:image/png;base64, " + a.data }" alt="">
        </div>`
    });
};

searchIcon.addEventListener("click", async () => {
    if (searchInput.value === "") {
        return;
    }

    const response = await fetch("http://localhost:8080/api/search/" + searchInput.value);
    const json = await response.json();

    update_div(json);
});