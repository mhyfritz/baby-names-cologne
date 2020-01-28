#! /usr/bin/env node

const fs = require("fs");
const path = require("path");
const { promisify } = require("util");
const readDir = promisify(fs.readdir);
const readFile = promisify(fs.readFile);
const { csvParse } = require("d3-dsv");
const groupBy = require("lodash.groupby");

const INPUT_DIRECTORY = path.join(__dirname, "src");
const OUTPUT_FILE = path.join(__dirname, "dist", "data.json");

main();

async function main() {
  const result = [];
  for (const file of await readDir(INPUT_DIRECTORY)) {
    result.push(...(await processFile(file)));
  }
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(result));
}

async function processFile(fileName) {
  const year = Number.parseInt(fileName.match(/\d+/)[0], 10);
  const content = await readFile(path.join(INPUT_DIRECTORY, fileName), "utf8");
  const parsed = csvParse(content);
  const byGender = groupBy(parsed, "geschlecht");
  const male = massage(byGender.m, "male", year);
  const female = massage(byGender.w, "female", year);
  return male.concat(female);
}

function massage(data, gender, year) {
  // collapse names across "positions"
  const collapsed = Object.values(groupBy(data, "vorname")).map(rec => ({
    count: rec
      .map(x => Number.parseInt(x.anzahl, 10))
      .reduce((a, b) => a + b, 0),
    gender,
    name: rec[0].vorname,
    year
  }));

  return Object.entries(groupBy(collapsed, "count"))
    .sort((a, b) => +b[0] - +a[0])
    .map(([, recs], i) => recs.map(rec => ({ ...rec, rank: i + 1 })))
    .reduce((acc, cur) => [...acc, ...cur], []);
}
