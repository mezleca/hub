const file = document.querySelector(".input-file");

if (file) {
    file.addEventListener("change", (event) => {
        const aa = document.querySelector(".file-text");
    
        aa.innerText = `Arquivo Selecionado: ${event.target.files[0].name}`;
    });
}