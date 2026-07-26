require("dotenv").config();

const tmdbService = require("./src/service/tmdbService");


async function test(){

 const movies =
 await tmdbService.getHindiMovies(1,[28,35]);


 console.log(
 movies.results.length
 );

 console.log(
 movies.results[0].title
 );

}


test();