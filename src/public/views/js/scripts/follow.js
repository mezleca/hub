const follow_button = document.querySelector("#follow");
const profile_info = document.querySelector(".profile-info");
const url_penis = window.location.pathname.split("/");
const target_penis = url_penis[url_penis.length - 1];
const target_name = profile_info ? profile_info.children[0].innerText : target_penis;

if (follow_button) {

    const send_request = async (method) => {
        try {
            const url = "http://localhost:8080/api/user/follow/" + target_name + "/" + method;
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

            if (profile_info) {
                const followers_count = profile_info.children[1].innerText;
                profile_info.children[1].innerHTML = (Number(followers_count.split(" ")[0]) + 1) + " followers";
            }

            follow_button.innerText = "following";
            follow_button.style.backgroundColor = "#61dafb";
        }
        else if (method == 1) {
            const response = await send_request(method);
    
            if (response) {
                return console.log("Ocorreu um erro, code:", response);
            }

            if (profile_info) {
                const followers_count = profile_info.children[1].innerText;
                if (Number(followers_count.split(" ")[0]) > 0) {
                    profile_info.children[1].innerHTML = (Number(followers_count.split(" ")[0]) - 1) + " followers";
                }
            }
    
            follow_button.style.backgroundColor = "white";
    
            follow_button.innerText = "follow";
        }
    });
}