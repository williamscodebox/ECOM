import { getAuth } from "@hono/clerk-auth";
import { createMiddleware } from "hono/factory";
//import { CustomJwtSessionClaims } from "@repo/types";

export const shouldBeUser = createMiddleware<{
  Variables: {
    userId: string;
  };
}>(async (c, next) => {
  const auth = getAuth(c);
  console.log("Auth Info:", auth);

  if (!auth?.userId) {
    c.status(401);
    return c.json({ message: "Unauthorized" });
  }

  // c.set("userId", auth.userId);

  await next();
});

// export const shouldBeAdmin = createMiddleware<{
//   Variables: {
//     userId: string;
//   };
// }>(async (c, next) => {
//   const auth = getAuth(c);

//   if (!auth?.userId) {
//     return c.json({
//       message: "You are not logged in.",
//     });
//   }

//   const claims = auth.sessionClaims as CustomJwtSessionClaims;

//   if (claims.metadata?.role !== "admin") {
//     return c.json({ message: "Unauthorized!" });
//   }

//   c.set("userId", auth.userId);

//   await next();
// });
