import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const existingToken = cookieStore.get("token").value;

    // Check if the token exists for authentication
    if (!existingToken) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    // console.log(existingToken);

    // Fetch all portfolio items from the backend
    const backendResponse = await fetch("https://project-backend-ge64.onrender.com/api/v1/portfolios/all", {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${existingToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!backendResponse.ok) {
      const errorData = await backendResponse.json();
      return NextResponse.json(
        { error: errorData.error || "Failed to fetch portfolio items" },
        { status: backendResponse.status }
      );
    }

    const data = await backendResponse.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const cookieStore = await cookies();
    const existingToken = cookieStore.get("token").value;

    // Check if the token exists for authentication
    if (!existingToken) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();

    // console.log(body);


    // Send the new portfolio item to the backend
    const backendResponse = await fetch("https://project-backend-ge64.onrender.com/api/v1/portfolios/me", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${existingToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!backendResponse.ok) {
      const errorData = await backendResponse.json();
      return NextResponse.json(
        { error: errorData.error || "Failed to add portfolio item" },
        { status: backendResponse.status }
      );
    }

    const newItem = await backendResponse.json();
    return NextResponse.json(newItem, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// Handle OPTIONS request for CORS
export async function OPTIONS() {
  return NextResponse.json(
    {},
    {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      }
    }
  );
}
