const views_count = document.getElementById("views");
const player = document.getElementById("video");

if (views_count && player) {

    let played = false;

    const execute_v = async () => {
        try { 
            const _id = document.querySelector(".video-player").id;
            const response = await fetch("/api/view/" + _id, {
                method: "POST",
            });
    
            const json = await response.json();
            if (json.msg === "success") {
                return;
            }
    
            console.error(json.reason);
    
        } catch(err) {
            console.log(err);
        }
    };
    
    player.addEventListener("play", async () => {
        
        if (played) {
            return;
        }
    
        const interval = setInterval(async () => {
    
            await execute_v();
            clearInterval(interval);
            
        }, 1000 * 3); // 3 segundos
    
        played = true;
    });
}