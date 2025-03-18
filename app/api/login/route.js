import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request) {
  try {
    const cookieStore = cookies();
    const existingToken = cookieStore.get("token");

    // If a token already exists, redirect the user to the dashboard
    if (existingToken) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    // Parse the request body (username & password)
    const body = await request.json();

    // Forward the credentials to the Spring Boot backend
    const backendResponse = await fetch(process.env.BACKEND_LOGIN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: body.username,
        password: body.password,
      }),
    });

    if (!backendResponse.ok) {
      const errorData = await backendResponse.json();
      return NextResponse.json(
        { error: errorData.error || "Login failed" },
        { status: 401 }
      );
    }

    // Extract the JWT from the backend response
    const data = await backendResponse.json();
    const token = data.jwt;

    // Set the JWT as an HTTPOnly cookie
    const response = NextResponse.json({ success: true });
    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
