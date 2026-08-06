require("dotenv").config();

fetch(
  "https://api.themoviedb.org/3/movie/popular",
  {
    headers:{
      Authorization:`Bearer ${process.env.TMDB_TOKEN}`,
      Accept:"application/json"
    }
  }
)
.then(res => res.json())
.then(data => console.log(data))
.catch(err => console.log(err));