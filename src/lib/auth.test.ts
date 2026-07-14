import { describe, test, expect } from "vitest";
import { sessionFromSupabaseUser } from "./auth";
import type { User } from "@supabase/supabase-js";

describe("sessionFromSupabaseUser", () => {
  test("should build session using metadata full_name and default values", () => {
    const mockUser = {
      id: "uuid-1234",
      email: "JANE@EXAMPLE.COM",
      user_metadata: {
        full_name: "Jane Doe",
        phone: "+91 99887 76655",
        city: "Mumbai",
      },
    } as unknown as User;

    const session = sessionFromSupabaseUser(mockUser);

    expect(session.id).toBe("uuid-1234");
    expect(session.name).toBe("Jane Doe");
    expect(session.email).toBe("jane@example.com");
    expect(session.phone).toBe("9988776655");
    expect(session.city).toBe("Mumbai");
    expect(session.activeView).toBe("personal");
  });

  test("should fallback to email prefix if full name is missing", () => {
    const mockUser = {
      id: "uuid-5678",
      email: "developer.rahul@gmail.com",
    } as unknown as User;

    const session = sessionFromSupabaseUser(mockUser);

    expect(session.name).toBe("developer.rahul");
  });
});
