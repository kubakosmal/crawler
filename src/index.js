const { URL } = require("node:url");
const { get } = require("node:https");

const createRequestOptions = (url) => {
  const { hostname, pathname, search } = url;
  return {
    hostname,
    path: pathname + search,
    method: "GET",
    headers: {
      "User-Agent": "Mozilla/5.0 (compatible; WebScraper/1.0)",
    },
  };
};

const fetchWebPage = async (url) => {
  return new Promise((resolve, reject) => {
    try {
      const parsedUrl = new URL(url);
      const options = createRequestOptions(parsedUrl);

      const req = get(options, (res) => {
        const { statusCode } = res;

        if (statusCode !== 200) {
          reject(new Error(`HTTP error! status: ${statusCode}`));
          return;
        }

        const chunks = [];
        res.setEncoding("utf8");
        res.on("data", (chunk) => chunks.push(chunk));
        res.on("end", () => resolve(chunks.join("")));
      });

      req.on("error", reject);
      req.setTimeout(10000, () => {
        req.destroy();
        reject(new Error("Request timeout"));
      });
      req.end();
    } catch (error) {
      reject(error);
    }
  });
};

const findLiTags = (content, startIndex = 0) => {
  const liStart = content.indexOf("<li", startIndex);
  if (liStart === -1) return null;

  const liEnd = content.indexOf(">", liStart);
  if (liEnd === -1) return null;

  return {
    nextIndex: liEnd + 1,
    found: true,
  };
};

const countLiTags = (content) => {
  const countTags = (index, count) => {
    const result = findLiTags(content, index);
    if (!result) return count;
    return countTags(result.nextIndex, count + 1);
  };

  return countTags(0, 0);
};

const findUlTag = (html, startIndex) => {
  const ulStart = html.indexOf("<ul", startIndex);
  if (ulStart === -1) return null;

  const ulOpenEnd = html.indexOf(">", ulStart);
  if (ulOpenEnd === -1) return null;

  const ulEnd = html.indexOf("</ul>", ulOpenEnd);
  if (ulEnd === -1) return null;

  return {
    content: html.slice(ulOpenEnd + 1, ulEnd),
    nextIndex: ulEnd + 5,
  };
};

const findLargestUl = (html) => {
  const lowerHtml = html.toLowerCase();

  const findLargest = (currentIndex, maxCount) => {
    const result = findUlTag(lowerHtml, currentIndex);
    if (!result) return maxCount;

    const liCount = countLiTags(result.content);
    return findLargest(result.nextIndex, Math.max(maxCount, liCount));
  };

  return findLargest(0, 0);
};

const analyze = async (url) => {
  try {
    const html = await fetchWebPage(url);
    return findLargestUl(html);
  } catch (error) {
    throw new Error(`Failed to analyze webpage: ${error.message}`);
  }
};

const main = async () => {
  const url = process.argv.at(-1);

  if (!url?.startsWith("http")) {
    console.error("Please provide a URL as an argument");
    console.error("Usage: scraper <url>");
    console.error("Example: scraper https://example.com");
    process.exit(1);
  }

  try {
    console.log("Analyzing webpage...");
    const count = await analyze(url);
    console.log(`The largest unordered list contains ${count} items`);
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
};

if (require.main === module) {
  main();
}

module.exports = {
  findLiTags,
  countLiTags,
  findUlTag,
  findLargestUl,
  analyze,
};
