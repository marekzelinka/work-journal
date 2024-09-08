import { invariant } from "@epic-web/invariant";
import { createCookieSessionStorage, redirect } from "@remix-run/node";

invariant(process.env.SESSION_SECRET, "SESSION_SECRET must be set");

export const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "__session",
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secrets: [process.env.SESSION_SECRET],
    secure: process.env.NODE_ENV === "production",
  },
});

export async function getSession(request: Request) {
  const cookie = request.headers.get("Cookie");

  return sessionStorage.getSession(cookie);
}

export async function getSignedAdmin(
  request: Request,
): Promise<boolean | undefined> {
  const session = await getSession(request);

  return session.data.isAdmin;
}

export async function requiredSignedAdmin(
  request: Request,
  redirectTo: string = new URL(request.url).pathname,
) {
  const isAdmin = await getSignedAdmin(request);
  if (!isAdmin) {
    const searchParams = new URLSearchParams([["redirectTo", redirectTo]]);
    throw redirect(`/login?${searchParams}`);
  }
  return isAdmin;
}

export async function createAdminSession({
  request,
  redirectTo,
}: {
  request: Request;
  redirectTo: string;
}) {
  const session = await getSession(request);
  session.set("isAdmin", true);

  return redirect(redirectTo, {
    headers: {
      "Set-Cookie": await sessionStorage.commitSession(session, {
        maxAge: 60 * 60 * 24 * 7, // 7 days
      }),
    },
  });
}

export async function logout(request: Request) {
  const session = await getSession(request);

  return redirect("/", {
    headers: {
      "Set-Cookie": await sessionStorage.destroySession(session),
    },
  });
}
