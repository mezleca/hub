import { API_ENDPOINT } from "$env/static/private";

export const POST = async ({ request }) => {
    const id = request.headers.get("X-ID");

    if (!id) {
        return new Response("invalid payload", { status: 401 });
    }

    const result = await fetch(`${API_ENDPOINT}/upload/finish`, {
        method: "POST",
        headers: {
            "X-ID": id
        }
    });

    return result;
};