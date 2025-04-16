    "use server"
import { signIn } from "./auth";

// app/server-actions.ts
export async function  Googlesign() {
;
    await signIn("google");
  }
  