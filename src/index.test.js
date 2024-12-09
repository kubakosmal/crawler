const {
  findLiTags,
  countLiTags,
  findUlTag,
  findLargestUl,
  analyze,
} = require("./index");

describe("HTML List Analysis", () => {
  describe("findLiTags", () => {
    test("finds li tag in simple string", () => {
      const html = "<li>test</li>";
      expect(findLiTags(html)).toEqual({
        nextIndex: 4,
        found: true,
      });
    });

    test("returns null when no li tags present", () => {
      const html = "<p>no lists here</p>";
      expect(findLiTags(html)).toBeNull();
    });
  });

  describe("countLiTags", () => {
    test("counts multiple li tags", () => {
      const html = "<li>one</li><li>two</li><li>three</li>";
      expect(countLiTags(html)).toBe(3);
    });

    test("returns 0 when no li tags present", () => {
      const html = "<p>no lists here</p>";
      expect(countLiTags(html)).toBe(0);
    });
  });

  describe("findUlTag", () => {
    test("finds ul tag and its content", () => {
      const html = "<ul><li>one</li><li>two</li></ul>";
      expect(findUlTag(html, 0)).toEqual({
        content: "<li>one</li><li>two</li>",
        nextIndex: html.length,
      });
    });

    test("returns null when no ul tags present", () => {
      const html = "<div>no lists here</div>";
      expect(findUlTag(html, 0)).toBeNull();
    });
  });

  describe("findLargestUl", () => {
    test("finds largest ul when multiple present", () => {
      const html = `
        <ul><li>one</li></ul>
        <ul><li>one</li><li>two</li><li>three</li></ul>
        <ul><li>one</li><li>two</li></ul>
      `;
      expect(findLargestUl(html)).toBe(3);
    });

    test("returns 0 when no ul tags present", () => {
      const html = "<div>no lists here</div>";
      expect(findLargestUl(html)).toBe(0);
    });
  });

  describe("analyze", () => {
    test("throws error for invalid URL", async () => {
      await expect(analyze("not-a-url")).rejects.toThrow();
    });
  });
});
