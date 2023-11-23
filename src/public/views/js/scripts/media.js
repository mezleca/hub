const posts_caralhudos = [...document.querySelectorAll(".post-caralhudo")];

if (posts_caralhudos) {
    posts_caralhudos.map((a) => {
        a.addEventListener("click", (event) => {
            const splitters = event.target.id.split("post_");
            const id = splitters[splitters.length - 1];
            window.location.href = "/media/post/" + id;
        });
    });
}