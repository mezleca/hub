const input = document.getElementById("name");
const label = document.querySelector(".formlabel");
const file = document.querySelector(".input-file");

input.addEventListener("input", (event) => {
    if (event.target.value != "") {
        label.style.display = "none";
    }
    else {
        label.style.display = "block";
    }
});

file.addEventListener("change", (event) => {
    const aa = document.querySelector(".file-text");

    aa.innerText = `Arquivo Selecionado: ${event.target.files[0].name}`;
});
