var express = require("express"),
  http = require("http");

var app = express();

app.configure(function () {
  app.set("port", process.env.PORT || 3000);
  app.set("view engine", "jade");
  app.use(express.favicon(__dirname + "/public/images/favicon.ico"));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + "/public"));
});

app.configure("development", function () {
  app.use(express.errorHandler());
  app.use(express.logger("dev"));
});

app.configure("production", function () {
  app.use(express.errorHandler());
  app.use(express.logger());
});

app.get("/", function (req, res) {
  if (req.query["q"]) {
    query = req.query["q"];
    encQuery = encodeURIComponent(query);
    if (query.match(/![A-Za-z0-9]+/) || query.substring(0, 2) === "! " || query.substring(0, 1) === "\\") {
      const customs = {
        "!pgs": "https://www.pgstats.com/search?terms=",
        "!sgg": "https://www.start.gg/search/all?query=",
      };
      if (Object.keys(customs).some((s) => query.startsWith(s))) {
        const prefix = query.split(" ")[0];
        const terms = query.substring(prefix.length + 1);
        res.redirect(customs[prefix] + terms);
        return;
      } else {
        console.log("Queried DuckDuckGo");
        res.redirect("https://duckduckgo.com?q=" + encQuery);
      }
    } else if (req.query["searchengine"]) {
      console.log("Queried custom search engine");
      searchEngine = req.query["searchengine"];
      if (searchEngine.search() != -1 && (searchEngine.lastIndexOf("http://", 0) === 0 || searchEngine.lastIndexOf("https://", 0) === 0)) {
        customSearchURL = searchEngine.replace(/%q/g, encQuery);
        res.redirect(customSearchURL);
      } else {
        console.log("Error in search engine syntax. Using Google.");
        res.redirect("https://www.google.com/search?q=" + encQuery);
      }
    } else {
      console.log("Queried Google");
      if (req.query["google"]) {
        res.redirect("https://" + req.query["google"] + "/search?q=" + encQuery);
      } else {
        res.redirect("https://www.google.com/search?q=" + encQuery);
      }
    }
  }
  res.render("index");
});

app.get("/browser", function (req, res) {
  res.render("browser");
});

app.get("/privacy", function (req, res) {
  res.render("privacy");
});

http.createServer(app).listen(app.get("port"), function () {
  console.log("Express server listening on port " + app.get("port"));
});
