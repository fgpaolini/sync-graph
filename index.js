import { parse } from "node-html-parser";
import dotenv from "dotenv";
import axios from "axios";

// We need this since the username against which a sync will be
// performed is provided an .env input.
dotenv.config();

const res = await axios.get(
  `https://github.com/users/${process.env.GITHUB_USERNAME}/contributions`
);

// Gathers all the squares from GitHub contribution graph.
const allSquares = parse(res.data).querySelectorAll("[data-count]");

// We only want html elements of squares with 1+ commits/issues for that day.
const relevantContributions = allSquares
  .filter((value) => value._rawAttrs["data-count"] > 0)
  .map((filteredSquare) => {
    return {
      date: filteredSquare._rawAttrs["data-date"],
      count: filteredSquare._rawAttrs["data-count"],
    };
  });

let fullCommand = "";

relevantContributions.forEach((contribution) => {
  for (let i = 0; i < contribution.count; i++) {
    fullCommand += `GIT_AUTHOR_DATE=${contribution.date}T12:00:00 GIT_COMMITER_DATE=${contribution.date}T12:00:00 git commit --allow-empty -m "Rewriting History!" > /dev/null;`;
  }
});

console.log(fullCommand);
