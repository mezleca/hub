import { API_ENDPOINT } from "$env/static/private";

export const POST = async ({ request }) => {
    const buffer = await request.arrayBuffer();
    const id = request.headers.get("X-ID");

    if (!buffer || !id) {
        return new Response("invalid payload", { status: 401 });
    }

    const result = await fetch(`${API_ENDPOINT}/upload/update`, {
        method: "POST",
        headers: {
            "X-ID": id,
        },
        body: buffer
    });

    return result;
};