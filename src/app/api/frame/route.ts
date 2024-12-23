export async function POST(req: Request) {
  console.log('Frame API called');
  try {
    const body = await req.json();
    console.log('Frame interaction:', body);

    return new Response(JSON.stringify({
      frames: [{
        version: 'vNext',  // Change this to vNext
        image: "https://gramafund.vercel.app/image.png",
        buttons: [
          {
            label: "View Posts",
            action: "link",
            target: "https://gramafund.vercel.app/posts"
          },
          {
            label: "Create Post",
            action: "post_redirect",
            target: "https://gramafund.vercel.app/posts?openModal=true"
          }
        ]
      }]
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      }
    });
  } catch (error) {
    console.error('Frame API error:', error);
    return new Response('Error processing frame', { status: 500 });
  }
}