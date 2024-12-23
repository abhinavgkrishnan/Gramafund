export const runtime = "edge";

export async function HEAD() {
  return new Response(null, {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

export async function POST(req: Request) {
  console.log("Frame API called");
  try {
    const body = await req.json();
    console.log("Frame interaction:", body);

    return new Response(
      JSON.stringify({
        frames: [
          {
            version: "vNext",
            image: "https://gramafund.vercel.app/image.png",
            buttons: [
              {
                label: "View Posts",
                action: "link",
                target: "https://gramafund.vercel.app/posts",
              },
              {
                label: "Create Post",
                action: "post_redirect",
                target: "https://gramafund.vercel.app/posts?openModal=true",
              },
            ],
          },
        ],
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Cache-Control": "no-store",
        },
      },
    );
  } catch (error) {
    console.error("Frame API error:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }
}
