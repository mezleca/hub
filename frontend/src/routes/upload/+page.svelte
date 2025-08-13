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
        const id = file.name;
        const size_kb = (await file.bytes()).byteLength / 1024;

        const data = await fetch("/api/upload/", { method: "POST", body: JSON.stringify({ type: "idk" }) });
        //console.log(data);
    };
</script>

<form class="upload-container" method="post" onsubmit={submit_upload}>
    <label for="file"></label>
    <input bind:this={file_input} type="file" name="file" id="" multiple={false} required>
    <input type="submit" value="submit">
</form>