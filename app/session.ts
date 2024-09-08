import { createCookieSessionStorage } from "@remix-run/node";

const SESSION_SECRET = process.env.SECCION_SECRET;

if (!SESSION_SECRET) {
  throw new Error("ENV varaible SESSION_SECRET must be defined");
}

export const { commitSession, destroySession, getSession } =
  createCookieSessionStorage({
    cookie: {
      name: "work-journal-session",
      secrets: [SESSION_SECRET],
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    },
  });
