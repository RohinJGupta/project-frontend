import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function PUT(request) {
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
    const { id, ...updateData } = body; // Assuming the body contains the item ID and the data to update

    console.log(id);
    console.log(body);
    // Update the portfolio item in the backend
    const backendResponse = await fetch(`https://project-backend-ge64.onrender.com/api/v1/items/me/${id}`, {
      method: "PUT",
      headers: {
        "Authorization": `Bearer ${existingToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updateData),
    });

    if (!backendResponse.ok) {
      const errorData = await backendResponse.json();
      return NextResponse.json(
        { error: errorData.error || "Failed to update portfolio item" },
        { status: backendResponse.status }
      );
    }

    const updatedItem = await backendResponse.json();
    return NextResponse.json(updatedItem, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
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
    const { id } = body; // Assuming the body contains the item ID to delete

    // console.log(id);

    // Delete the portfolio item in the backend
    const backendResponse = await fetch(`https://project-backend-ge64.onrender.com/api/v1/items/${id}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${existingToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!backendResponse.ok) {
      const errorData = await backendResponse.json();
      return NextResponse.json(
        { error: errorData.error || "Failed to delete portfolio item" },
        { status: backendResponse.status }
      );
    }

    return NextResponse.json({ message: "Portfolio item deleted successfully" }, { status: 200 });
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
        'Access-Control-Allow-Methods': 'PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      }
    }
  );
} 