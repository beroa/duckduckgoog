const http = require("http");
const url = require("url");

const port = process.env.PORT || 3000;
const customBangs = {
  "!pgs": "https://www.pgstats.com/search?terms=",
  "!sgg": "https://www.start.gg/search/all?query=",
  "!bda": "https://bdolytics.com/en/NA/alchemy/market?q=",
  "!bdc": "https://bdolytics.com/en/NA/cooking/market?q=",
  "!bdp": "https://bdolytics.com/en/NA/processing/market?q=",
};

const server = http.createServer((req, res) => {
  const request = url.parse(req.url, true);

  if (req.method !== "GET" || request.pathname !== "/" || !request.query.q) {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Search query required. Use /?q=your+search\n");
    return;
  }

  const query = request.query.q;
  const encodedQuery = encodeURIComponent(query);
  const bang = query.split(" ")[0].toLowerCase();
  const normalizedQuery = query.trim().toLowerCase();
  const isTimerSearch =
    normalizedQuery === "timer" ||
    /^\d+(?:\.\d+)?\s*(?:seconds?|minutes?|hours?|days?|weeks?|months?|years?)\s+timer$/.test(normalizedQuery) ||
    /^\d+:\d{2}(?::\d{2})?\s+timer$/.test(normalizedQuery);
  const isStocksSearch = /^\S+\s+stocks?$/.test(normalizedQuery);
  let destination;

  if (isTimerSearch || isStocksSearch) {
    destination = "https://www.google.com/search?q=" + encodedQuery;
  } else if (customBangs[bang]) {
    destination = customBangs[bang] + encodeURIComponent(query.substring(query.indexOf(" ") + 1).trim());
  } else if (request.query.searchengine) {
    const searchEngine = request.query.searchengine;
    if (/^https?:\/\//i.test(searchEngine) && searchEngine.includes("%q")) {
      destination = searchEngine.replace(/%q/g, encodedQuery);
    } else {
      destination = "https://www.google.com/search?q=" + encodedQuery;
    }
  } else if (request.query.google) {
    destination = "https://" + request.query.google + "/search?q=" + encodedQuery;
  } else {
    destination = "https://duckduckgo.com/?q=" + encodedQuery;
  }

  res.writeHead(302, { Location: destination });
  res.end();
});

server.listen(port, () => {
  console.log("Search redirect server listening on port " + port);
});
