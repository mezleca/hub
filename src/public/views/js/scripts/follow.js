const follow_button = document.querySelector("#follow");
const profile_info = document.querySelector(".profile-info");

if (follow_button && profile_info) {

    const send_request = async (method) => {
        try {
            const url = "http://localhost:8080/api/user/follow/" + profile_info.children[0].innerText + "/" + method;
            const response = await fetch(url, {
                method: "post"
            });
            const json = await response.json();
    
            return json.code;
        }
        catch(err) {
            window.location.reload();
        }
    }
    
    follow_button.addEventListener("click" , async () => {
    
        if (follow_button.classList.contains("b1")) {
            return alert("Voce nao pode seguir voce mesmo!");
        }
    
        const method = follow_button.innerText == "follow" ? 0 : 1;
    
        if (method == 0) {
    
            const response = await send_request(method);
    
            if (response) {
                return console.log("Ocorreu um erro, code:", response);
            }
    
            const followers_count = profile_info.children[1].innerText;
            profile_info.children[1].innerHTML = (Number(followers_count.split(" ")[0]) + 1) + " followers";
            follow_button.innerText = "following";
            follow_button.style.backgroundColor = "#61dafb";
        }
        else if (method == 1) {
            const response = await send_request(method);
    
            if (response) {
                return console.log("Ocorreu um erro, code:", response);
            }
    
            const followers_count = profile_info.children[1].innerText;
            if (Number(followers_count.split(" ")[0]) > 0)
                profile_info.children[1].innerHTML = (Number(followers_count.split(" ")[0]) - 1) + " followers";
    
            follow_button.style.backgroundColor = "white";
    
            follow_button.innerText = "follow";
        }
    });
}