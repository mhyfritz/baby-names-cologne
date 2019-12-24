const fs = require("fs");
const path = require("path");
const { promisify } = require("util");
const readDir = promisify(fs.readdir);
const readFile = promisify(fs.readFile);
const { csvParse } = require("d3-dsv");
const groupBy = require("lodash.groupby");

const DIRNAME = path.join(__dirname, "cologne");

main();

async function main() {
  const result = [];
  for (const file of await readDir(DIRNAME)) {
    result.push(...(await processFile(file)));
  }
  console.log(JSON.stringify(result, null, 2));
}

async function processFile(fileName) {
  const year = Number.parseInt(fileName.match(/\d+/)[0], 10);
  const content = await readFile(path.join(DIRNAME, fileName), "utf8");
  const parsed = csvParse(content);
  const byGender = groupBy(parsed, "geschlecht");
  const male = massage(byGender.m, "male", year);
  const female = massage(byGender.w, "female", year);
  return male.concat(female);
}

function massage(data, gender, year) {
  return Object.values(groupBy(data, "vorname")).map(rec => ({
    count: rec
      .map(x => Number.parseInt(x.anzahl, 10))
      .reduce((a, b) => a + b, 0),
    gender,
    name: rec[0].vorname,
    year
  }));
}
