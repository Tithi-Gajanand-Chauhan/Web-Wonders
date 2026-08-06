require("dotenv").config();

const axios = require("axios");

async function test() {
  try {
    const res = await axios.get(
      "https://api.themoviedb.org/3/movie/popular",
      {
        headers: {
          Authorization: `Bearer ${process.env.TMDB_TOKEN}`,
          accept: "application/json",
        },
      }
    );

    console.log("SUCCESS");
    console.log(res.data.results.length);
  } catch (err) {
    console.log(err.code);
    console.log(err.message);

    if (err.response) {
      console.log(err.response.status);
      console.log(err.response.data);
    }
  }
}

test();