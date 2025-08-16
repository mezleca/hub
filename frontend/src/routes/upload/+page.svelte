<script lang="ts">

    let file_input: HTMLInputElement;

    const submit_upload = async (event: SubmitEvent) => {
        // prevent post
        event.preventDefault();

        if (!file_input) {
            console.error("failed to bind file_input");
            return;
        }

        const file = file_input.files?.item(0);
        
        if (!file) {
            console.log("failed to get file from form");
            return;
        }

        // get useful info
        const name: string = file.name;
        const size: number = Math.round((await file.bytes()).length);

        const data = { file_name: name, size };
        const new_upload_result = await fetch("/api/upload-new", { method: "POST", body: JSON.stringify(data) });
        const new_upload = await new_upload_result.json();

        console.log(new_upload, data);
    
        // test: upload 1mb at time
        const chunk_size = 1024 * 1024;

        for (let current = 0; current < size; current += chunk_size) {
            const end = Math.min(current + chunk_size, size);
            const chunk = await file.slice(current, end).arrayBuffer();
            
            console.log("trying to send", end - current, "bytes", chunk);

            const result = await fetch("/api/upload-update", {
                method: "POST",
                headers: {
                    "Content-Type": "application/octet-stream",
                    "X-ID": new_upload.id
                },
                body: chunk
            });

            if (result.status != 200) {
                console.log("failed to update upload", await result.text());
            }
            
            const update_result = await result.json();
            
            if (update_result.status == "finished") {
                console.log("finished uploading", update_result);
                break;
            }
        }
    };
</script>

<form class="upload-container" method="post" onsubmit={submit_upload}>
    <label for="file"></label>
    <input bind:this={file_input} type="file" name="file" id="" multiple={false} required>
    <input type="submit" value="submit">
</form>