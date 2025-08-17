<script lang="ts">
    import { upload_manager } from "$lib/upload";

    // types
    import type { NewUpload, Upload } from "$lib/types/upload";

    $: pending_uploads = upload_manager.uploads;
    $: is_uploading = upload_manager.uploading;
    
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

        // @TODO: move all of this to manager
        // create new upload request
        const new_upload: NewUpload = {
            file_name: file.name,
            size: file.size
        };

        const new_upload_response = await fetch("/api/upload-new", { 
            method: "POST", 
            body: JSON.stringify(new_upload) 
        });

        if (new_upload_response.status != 200) {
            console.log("failed to create new upload", await new_upload_response.text())
            return false;
        }

        const upload: Upload = await new_upload_response.json();

        // add new upload to manager
        upload.buffer = file;
        upload_manager.add(upload);
    };
</script>

<div class="container">
    <div class="uploads">
        <button onclick={() => upload_manager.stop()}>stop uploads</button>
        {#each $pending_uploads as upload}
            <div class="upload pending">
                <h1>{upload.file_name}</h1>
                <h2>{upload.size / upload.total_size * 100} %</h2>
                <p>status: {upload.status}</p>
                <button onclick={() => upload_manager.remove(upload.id)}>remove</button>
            </div>
        {/each}
    </div>
    
    <br>
    <br>

    {#if !$is_uploading}
        <button onclick={() => upload_manager.process()}>start uploading</button>
    {/if}

    <form class="upload-container" method="post" onsubmit={submit_upload}>
        <label for="file"></label>
        <input bind:this={file_input} type="file" name="file" id="" multiple={false} required>
        <input type="submit" value="submit">
    </form>
</div>