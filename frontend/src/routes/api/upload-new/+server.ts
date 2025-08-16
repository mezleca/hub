import { API_ENDPOINT } from "$env/static/private";

export const POST = async ({ request }) => {
    const data = await request.text();
    const result = await fetch(`${API_ENDPOINT}/upload/new`, {
        method: "POST",
        body: data
    });

    return result;
};