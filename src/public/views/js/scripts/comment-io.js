const comment_button = document.querySelector(".submit-comment");
const comment_input = document.querySelector(".comment-input-v");
const comments_div = document.querySelector(".comments");
const vid_post_id = document.querySelector(".video-player");
const piroca_len = document.querySelector(".piroca");
const user_name = document.querySelector("#user_name");

if (comment_button && comment_input && comments_div && vid_post_id && piroca_len && user_name) {
    
    const new_comment = async (content) => {

        const params = {
            content: content,
            id: vid_post_id.id
        };

        const options = {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json'
            },
            body: JSON.stringify(params)
        }; 

        const response = await fetch("/api/comment", options);
        const json = await response.json();

        if (!json.msg) {
            console.error(json);
            return window.location.reload();
        }

        if (json.msg != "success") {
            console.error(json);
            return window.location.reload();
        }

        const div = document.createElement("div");
        const user = document.createElement("a");
        const new_p = document.createElement("p");
        
        new_p.innerHTML = content;
        user.href = `/profile/${user_name.innerText}`;
        user.innerHTML = user_name.innerText;

        div.appendChild(user);
        div.appendChild(new_p);

        const comments_sssSSSsS = Number(piroca_len.innerText.split(" ")[0]);

        piroca_len.innerHTML = (comments_sssSSSsS + 1) + " comentarios";
        const no_comments = document.querySelector(".no_comments");

        if (no_comments) {
            comments_div.removeChild(no_comments);
        }

        comments_div.appendChild(div);
    };

    comment_button.addEventListener("click", async () => {

        if (!comment_input.value || comment_input.value.length > 64 || comment_input.value.length < 2) {
            return;
        }

        await new_comment(comment_input.value);
    });
}