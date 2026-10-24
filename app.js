const http = require("http");
const url = require("url");

const port = process.env.PORT || 3000;
const customBangs = {
  "!pgs": "https://www.pgstats.com/search?terms=",
  "!sgg": "https://www.start.gg/search/all?query=",
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
  const bang = query.split(" ")[0];
  let destination = "https://duckduckgo.com/?q=" + encodedQuery;

  if (/^(?:timer|\d+(?:\.\d+)?\s*(?:seconds?|minutes?|hours?|days?|weeks?|months?|years?)\s+timer)$/i.test(query.trim())) {
    destination = "https://www.google.com/search?q=" + encodedQuery;
  } else if (customBangs[bang]) {
    destination = customBangs[bang] + encodeURIComponent(query.substring(bang.length).trim());
  }

  res.writeHead(302, { Location: destination });
  res.end();
});

server.listen(port, () => {
  console.log("Search redirect server listening on port " + port);
});
