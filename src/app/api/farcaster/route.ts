export async function GET() {
  return new Response(
    JSON.stringify({
      accountAssociation: {
        header: "eyJmaWQiOjg2MDc4MywidHlwZSI6ImN1c3RvZHkiLCJrZXkiOiIweDdDODM2NEJDREMzMzJmMDIwRjY0QjU2M0NmYTkzNzAzMDI2ZGY3NzEifQ",
        payload: "eyJkb21haW4iOiJncmFtYWZ1bmQudmVyY2VsLmFwcCJ9",
        signature: "MHhiMGNjOTRkNWNiMzg3Y2I5ZDI1YjRjMTkxMzM5MDBkZDZkZTViODYzNzMzMTEwZjExMjQ3OGY2MTcxYjMwZGM2NmRkYjIwMGY2NWM3ZWE5MTQ0MDk1Mjc4YzE3OGRmNTgxNzJmYmFkZGRiODQxMDU2MzkwYzE2ZmE1N2I5NmQ1MzFj"
      },
      frame: {
        version: "1",
        name: "Gramafund",
        iconUrl: "https://gramafund.vercel.app/image.png",
        homeUrl: "https://gramafund.vercel.app/posts",
        imageUrl: "https://gramafund.vercel.app/image.png",
        buttonTitle: "All posts",
        splashImageUrl: "https://gramafund.vercel.app/image.png",
        splashBackgroundColor: "#131313"
      }
    }),
    {
      headers: {
        'content-type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=3600'
      },
    }
  );
}

// Add OPTIONS handler for CORS
export async function OPTIONS() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Cache-Control': 'public, max-age=3600'
    },
  });
}