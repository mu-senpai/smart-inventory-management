import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest, { params }: { params: any }) {
  return handleProxyRequest(request, params);
}

export async function POST(request: NextRequest, { params }: { params: any }) {
  return handleProxyRequest(request, params);
}

export async function PATCH(request: NextRequest, { params }: { params: any }) {
  return handleProxyRequest(request, params);
}

export async function PUT(request: NextRequest, { params }: { params: any }) {
  return handleProxyRequest(request, params);
}

export async function DELETE(request: NextRequest, { params }: { params: any }) {
  return handleProxyRequest(request, params);
}

async function handleProxyRequest(request: NextRequest, params: any) {
  try {
    // 1. Setup Parameters and Environment
    const resolvedParams = await params;
    const pathSegments = resolvedParams.path || [];
    const path = pathSegments.join("/");
    const backendUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://smart-inventory-server.vercel.app/api/v1";
    const targetUrl = `${backendUrl}/${path}${request.nextUrl.search}`;

    const cookieStore = await cookies();
    const token = cookieStore.get("accessToken")?.value;

    console.log(`[Proxy] Requesting: ${request.method} ${targetUrl}`);

    // 2. Handle Logout Logic
    if (path.includes("auth/logout")) {
      const logoutResponse = NextResponse.json({ success: true, message: "Logged out" });
      logoutResponse.cookies.delete("accessToken");
      return logoutResponse;
    }

    // 3. Prepare Headers for the Backend Request
    const headers = new Headers(request.headers);
    headers.delete("host");
    headers.delete("cookie"); // We strip incoming cookies to handle auth manually via 'token'
    headers.delete("referer");

    // If we have a token in our HttpOnly cookie, attach it to the backend request
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
      console.log("[Proxy] Authorization header attached from cookie.");
    }

    // 4. Build Fetch Options
    const fetchOptions: RequestInit = {
      method: request.method,
      headers: headers,
      redirect: "manual",
    };

    // Forward the body for mutation methods
    if (["POST", "PUT", "PATCH", "DELETE"].includes(request.method)) {
      const contentType = request.headers.get("content-type");
      if (contentType?.includes("application/json")) {
        const bodyText = await request.text();
        if (bodyText) fetchOptions.body = bodyText;
      } else {
        // Fallback for multipart/form-data or other types
        fetchOptions.body = await request.blob();
      }
    }

    // 5. Execute the Backend Request
    const res = await fetch(targetUrl, fetchOptions);

    // 6. Prepare Response Data and Headers for the Browser
    const responseData = await res.arrayBuffer();
    const responseHeaders = new Headers(res.headers);

    // Crucial: remove content-encoding to let Next.js handle the compression/decompression
    responseHeaders.delete('content-encoding');

    // Check if this is an authentication route
    const isAuthRoute = ["auth/login", "auth/demo-login"].some(p => path.includes(p));

    // 7. Intercept Successful Auth to Set the Cookie
    if (res.ok && isAuthRoute) {
      try {
        const bodyStr = new TextDecoder().decode(responseData);
        const json = JSON.parse(bodyStr);

        // Flexible extraction: handles json.token OR json.data.token
        const extractedToken = json.data?.token || json.token || json.accessToken;

        if (extractedToken) {
          console.log("[Proxy] Token extracted successfully. Setting HttpOnly cookie...");

          // Optional: Remove token from JSON so client-side JS never sees it
          if (json.data?.token) delete json.data.token;
          if (json.token) delete json.token;

          const modifiedBody = new TextEncoder().encode(JSON.stringify(json));

          responseHeaders.delete('content-length');

          // Create the response with the modified body
          const authResponse = new NextResponse(modifiedBody, {
            status: res.status,
            headers: responseHeaders,
          });

          // ATTACH COOKIE TO THE FINAL RESPONSE OBJECT
          authResponse.cookies.set("accessToken", extractedToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            path: "/",
            maxAge: 7 * 24 * 60 * 60, // 7 days
          });

          return authResponse;
        } else {
          console.warn("[Proxy] Auth route returned success but no token was found in the body.");
        }
      } catch (e) {
        console.error("[Proxy] Failed to parse auth response body:", e);
      }
    }

    // 8. Default Response for all other routes
    // Note: 304 Not Modified must not have a body
    if (res.status === 304) {
      return new NextResponse(null, {
        status: 304,
        headers: responseHeaders,
      });
    }

    return new NextResponse(responseData, {
      status: res.status,
      headers: responseHeaders,
    });

  } catch (error) {
    console.error("[Proxy Critical Error]:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error in Proxy" },
      { status: 500 }
    );
  }
}
