import { NextResponse } from 'next/server';

export const revalidate = 3600;

export async function GET() {
  try {
    const appUrl = process.env.HOST || "https://gramafund.vercel.app";

    const config = {
      accountAssociation: {
        header: "eyJmaWQiOjg2MDc4MywidHlwZSI6ImN1c3RvZHkiLCJrZXkiOiIweDdDODM2NEJDREMzMzJmMDIwRjY0QjU2M0NmYTkzNzAzMDI2ZGY3NzEifQ",
        payload: "eyJkb21haW4iOiJncmFtYWZ1bmQudmVyY2VsLmFwcCJ9",
        signature: "MHhiMGNjOTRkNWNiMzg3Y2I5ZDI1YjRjMTkxMzM5MDBkZDZkZTViODYzNzMzMTEwZjExMjQ3OGY2MTcxYjMwZGM2NmRkYjIwMGY2NWM3ZWE5MTQ0MDk1Mjc4YzE3OGRmNTgxNzJmYmFkZGRiODQxMDU2MzkwYzE2ZmE1N2I5NmQ1MzFj"
      },
      frame: {
        version: "1",
        name: "Gramafund",
        iconUrl: `${appUrl}/icon.png`,
        homeUrl: `${appUrl}/frame`,
        imageUrl: `${appUrl}/image.png`,
        buttonTitle: "All posts",
        splashImageUrl: `${appUrl}/image.png`,
        splashBackgroundColor: "#131313"
      }
    };

    return NextResponse.json(config, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=3600',
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error serving farcaster manifest:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

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