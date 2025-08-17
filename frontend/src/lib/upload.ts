import { writable, get } from "svelte/store";
import { type UploadResult, UploadReason, type Upload } from "./types/upload";

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
const chunk_size = 1024 * 1024; 

const create_upload_result = () => {
    const result: UploadResult = {
        success: false,
        data: null as any,
        reason: UploadReason.UNKNOWN
    }
 
    return result;
};

class UploadManager {
    uploading = writable<boolean>(false);
    uploads = writable<Upload[]>([]);

    add(new_upload: Upload) {
        this.uploads.update((uploads) => [...uploads, new_upload]);
    }

    async update(upload: Upload) {
        const result = create_upload_result();
        
        if (!upload.buffer) {
            result.reason = UploadReason.NO_BUFFER;
            return result;
        }

        const size = upload.buffer.size;
        const end = Math.min(upload.size + chunk_size, size);
        const next_chunk = upload.buffer.slice(upload.size, end);

        const response = await fetch("/api/upload-update", {
            method: "POST",
            headers: {
                "Content-Type": "application/octet-stream",
                "X-ID": upload.id
            },
            body: next_chunk
        });

        // @TODO: return reason from on api
        if (response.status != 200) {
            result.reason = UploadReason.UNKNOWN;
            console.log("failed to update upload", await response.text());
            return result;
        }

        result.success = true;
        result.data = await response.json();

        // update store
        this.uploads.update((all) => all.map((u) => {
            if (u.id != upload.id) {
                return u;
            }

            Object.assign(u, result.data);
            return u;
        }));

        return result;
    }

    async process() {
        if (get(this.uploading) ) {
            console.log("already uploading");
            return;
        }

        if (get(this.uploads).length == 0) {
            return;
        }

        this.uploading.set(true);
        console.log("starting upload");

        // i dont think youtube allows you to upload multiple stuff at the same time so
        while (get(this.uploading)) {
            const upload = get(this.uploads)[0];

            if (!upload) {
                console.log("breaking cuz no pending uploads");
                break;
            }

            if (!upload.buffer) {
                console.log("missing buffer property on current upload");
                break;
            }

            // update progress
            const result = await this.update(upload);

            if (result.success) {
                // remove if finished
                if (result.data.status == "finished") {
                    console.log("removing finished updated");
                    await this.remove(result.data.id);
                    await wait(100);
                    continue;
                } else {
                    await wait(100);
                    continue;
                }
            }

            // retry again if we got a unknown error
            // @TODO: max 3 attempts (reset if we successfully upload something)
            if (result.reason == UploadReason.UNKNOWN) {
                await wait(200);
                continue;
            }

            // otherwise remove this upload
            if (result.reason == UploadReason.NO_BUFFER) {
                await this.remove(upload.id);
            }

            // no ideia how to handle SAME_BUFFER (api could return the ACTUAL progress? idk)
            // so for now lets just remove
            if (result.reason == UploadReason.SAME_BUFFER) {
                await this.remove(upload.id);
            }
        }

        // make sure we set this to false
        this.stop();
    }

    stop() {
        this.uploading.set(false);
    }

    async remove(id: string) {
        const remove_response = await fetch("/api/upload-finish", {
            method: "POST",
            headers: {
                "X-ID": id
            }
        });

        if (remove_response.status != 200) {
            console.log("failed to remove", await remove_response.text());
            this.stop();
            return;
        }

        this.uploads.update((all) => all.filter((u) => u.id != id));
    }
}

export const upload_manager = new UploadManager();