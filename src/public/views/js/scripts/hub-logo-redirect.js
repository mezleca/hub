const logo_index = document.getElementById("logo_index");

if (logo_index) {
    logo_index.addEventListener("click", () => {
        window.location.href = "/media/";
    });
}