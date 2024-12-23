export async function POST(req: Request) {
  // If you need to use the request body:
  const body = await req.json();
  console.log('Frame interaction:', body);

  return new Response(JSON.stringify({
    frames: [{
      version: '1',
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
  }));
}