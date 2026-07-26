const https = require("https");

https
  .get("https://api.themoviedb.org/3", (res) => {
    console.log("STATUS:", res.statusCode);
  })
  .on("error", (err) => {
    console.log("ERROR:");
    console.log(err);
  });