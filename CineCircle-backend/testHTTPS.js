require("dotenv").config();
const https = require("https");

const options = {
  hostname: "api.themoviedb.org",
  path: "/3/movie/popular",
  method: "GET",
  headers: {
    Authorization: `Bearer ${process.env.TMDB_TOKEN}`,
    Accept: "application/json",
  },
};

const req = https.request(options, (res) => {
  console.log("STATUS:", res.statusCode);

  let body = "";

  res.on("data", (chunk) => {
    body += chunk;
  });

  res.on("end", () => {
    console.log(body.substring(0, 300));
  });
});

req.on("error", (err) => {
  console.log(err);
});

req.end();