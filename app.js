"use strict";

const express = require("express");
const app = express();
const multer = require("multer");
// const fetch = require("node-fetch");
const Graph = require("@dagrejs/graphlib").Graph;
const fs = require("fs").promises;
const API_KEY = "k_ts7uim1l";

app.use(express.urlencoded({extended: true}));
app.use(multer().none());
app.use(express.json());

const SERVER_ERROR_CODE = "A server error has occurred!";

let g = new Graph({directed: true, compound: true, multigraph: false});

let allActors = new Set();

async function makeGraph() {

  let result = [];
  let actorMovie = new Map();
  let movieActor = new Map();

  let contents = await fs.readFile("data.txt", "utf8");
  let movies = contents.split("\n");

  for (let i = 0; i < movies.length; i++) {
    let movieJSON = JSON.parse(movies[i]);
    let movieTitle = movieJSON.title;
    for (let j = 0; j < movieJSON.cast.length; j++) {
      let actor = checkName(movieJSON.cast[j]);
      allActors.add(actor);

      if (!actorMovie.has(actor)) {
        let newSet = new Set();
        newSet.add(movieTitle);
        actorMovie.set(actor, newSet);
      } else {
        let currentSet = actorMovie.get(actor);
        currentSet.add(movieTitle);
      }

      if (!movieActor.has(movieTitle)) {
        let newSet = new Set();
        newSet.add(actor);
        movieActor.set(movieTitle, newSet)
      } else {
        let currentSet = movieActor.get(movieTitle);
        currentSet.add(actor);
      }

    }
  }

  console.log(actorMovie.get("Robert Downey Jr."));

  result.push(actorMovie);
  result.push(movieActor);


  let movieJSON = JSON.parse(movies[0]);
  let actor = movieJSON.cast[0];

  return movieJSON;

}

function checkName(actor) {
  let parenthesisRegex = "\(([^\)]+)\)";
  let name = actor;
  name = name.replace(/\(([^\)]+)\)/g, "");
  name = name.replace("[[", "");
  name = name.replace("]]", "");
  name = name.replace(/\|.*$/g, "");
  name = name.replace(/[ \t]+$/, "");
  return name;
}


app.get('/data', async function(req, res) {
  let response = await makeGraph();
  console.log(allActors.size);
  res.json(response);
});


/**
 * Return the response's result text if successful, otherwise
 * returns the rejected Promise result with an error status and corresponding text
 * @param {object} response - response to check for success/error
 * @return {object} - valid response if response was successful, otherwise rejected
 *                    Promise result
 */
async function statusCheck(response) {
  if (!response.ok) {
    throw new Error(await response.text());
  }
  return response;
}


app.use(express.static("public"));
const PORT = process.env.PORT || 8000;
app.listen(PORT);