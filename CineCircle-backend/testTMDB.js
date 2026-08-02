require("dotenv").config();

const tmdb = require("./src/service/tmdbService");


async function test(){

 const movies =
 await tmdb.getPopularMovies(1);


 console.log(
   movies.results.slice(0,5)
 );

}


test();