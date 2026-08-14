import { describe, expect, it } from "vitest";
import { uoaUndergraduateCourses } from "@/lib/course-catalog";

describe("UoA undergraduate COMPSCI course catalogue", () => {
  it("contains every 2026 BSc COMPSCI course entry", () => {
    expect(uoaUndergraduateCourses.map((course) => course.code)).toEqual([
      "COMPSCI 101", "COMPSCI 110", "COMPSCI 111", "COMPSCI 120", "COMPSCI 130",
      "COMPSCI 210", "COMPSCI 215", "COMPSCI 220", "COMPSCI 225", "COMPSCI 230", "COMPSCI 235", "COMPSCI 289", "COMPSCI 290",
      "COMPSCI 313", "COMPSCI 315", "COMPSCI 316", "COMPSCI 320", "COMPSCI 331", "COMPSCI 335", "COMPSCI 340", "COMPSCI 345",
      "COMPSCI 350", "COMPSCI 351", "COMPSCI 361", "COMPSCI 367", "COMPSCI 369", "COMPSCI 373", "COMPSCI 380", "COMPSCI 380A",
      "COMPSCI 380B", "COMPSCI 389", "COMPSCI 390", "COMPSCI 391", "COMPSCI 392", "COMPSCI 393", "COMPSCI 399",
    ]);
  });

  it("uses official titles for representative courses at every stage", () => {
    expect(uoaUndergraduateCourses.find((course) => course.code === "COMPSCI 110")?.name).toBe("Introduction to Computer Systems");
    expect(uoaUndergraduateCourses.find((course) => course.code === "COMPSCI 235")?.name).toBe("Software Development Methodologies");
    expect(uoaUndergraduateCourses.find((course) => course.code === "COMPSCI 399")?.name).toBe("Capstone: Computer Science");
  });

  it("retains the three unique legacy mappings for database upgrades", () => {
    expect(uoaUndergraduateCourses.filter((course) => course.legacyCode).map((course) => course.legacyCode)).toEqual([
      "COMP101", "COMP201", "COMP301",
    ]);
  });
});
