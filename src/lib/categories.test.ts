import { describe, test, expect } from "vitest";
import { getCategory } from "./categories";

describe("getCategory helper function", () => {
  test("should resolve correct category definition for 'rent'", () => {
    const category = getCategory("rent");
    
    expect(category).toBeDefined();
    expect(category?.label).toBe("Rent");
    expect(category?.world).toBe("residential");
  });

  test("should resolve correct details for 'pg'", () => {
    const category = getCategory("pg");
    
    expect(category?.label).toBe("PG / Hostel");
    expect(category?.world).toBe("residential");
  });

  test("should return undefined for a non-existent category slug", () => {
    const category = getCategory("invalid-slug");
    expect(category).toBeUndefined();
  });
});
