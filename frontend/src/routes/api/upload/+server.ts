// start new upload 

export const POST = async ({ request }) => {
    const data = await request.json();

    if (!data?.id || !data.size) {
        return new Response("invalid upload data", { status: 400 });
    }

    return new Response("", { status: 200 });
};