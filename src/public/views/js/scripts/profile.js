const pfp = document.getElementById("pfp");
const container = document.querySelector(".container");
const popup = document.querySelector(".popup-overlay");

if (pfp && container && popup) {

    const profile = window.location.pathname.split("/");
    const profile_name = profile[profile.length - 1];

    const user_name = document.getElementById("user_name");

    if (profile_name == user_name.innerText) {
        container.addEventListener("click", (event) => {
            console.log(window.location.pathname)
            if (event.target.id == "pfp") {
                popup.style.display = "flex";
            }
        });
    } else {
        console.log("Usuario invalido");
    }
}