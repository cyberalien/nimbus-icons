#!/usr/bin/env node
/* eslint-env node */
const fs = require("fs-extra");
const path = require("path");
const globby = require("globby");
const cheerio = require("cheerio");
const trimNewlines = require("trim-newlines");
const yargs = require("yargs");
const merge = require("lodash.merge");

// This script generates a JSON file that contains
// information about input SVG files.

const { argv } = yargs
  .usage("Usage: $0 --input <input filepaths> --output <output filepath>")
  .example("$0 --input icons/**/*.svg --output build/data.json")
  .option("input", {
    alias: "i",
    type: "array",
    demandOption: true,
    describe: "Input SVG files",
  })
  .option("output", {
    alias: "o",
    type: "string",
    describe:
      "Ouput JSON file. Defaults to stdout if no output file is provided.",
  });

// The `argv.input` array could contain globs (e.g. "**/*.svg").
const filepaths = globby.sync(argv.input);
const svgFilepaths = filepaths.filter(
  (filepath) => path.parse(filepath).ext === ".svg"
);

if (svgFilepaths.length === 0) {
  // eslint-disable-next-line no-console
  console.error("No input SVG file(s) found");
  process.exit(1);
}

let exitCode = 0;

const icons = svgFilepaths.map((filepath) => {
  try {
    const filename = path.parse(filepath).base;
    const filenamePattern = /(.+).svg$/;

    if (!filenamePattern.test(filename)) {
      throw new Error(
        `${filename}: Invalid filename. Please use kebab case (e.g. exclamation-circle.svg).`
      );
    }

    const [, name] = filename.match(filenamePattern);
    const svg = fs.readFileSync(path.resolve(filepath), "utf8");
    const svgElement = cheerio.load(svg)("svg");
    const svgViewBox = svgElement.attr("viewBox");
    let [, , widthAlt, heightAlt] = svgViewBox.split(" ");

    let svgWidth = parseInt(
      svgElement.attr("width") ? svgElement.attr("width") : widthAlt
    );
    let svgHeight = parseInt(
      svgElement.attr("height") ? svgElement.attr("height") : heightAlt
    );

    const svgPath = trimNewlines(svgElement.html()).trim();

    if (!svgWidth) {
      throw new Error(`${filename}: Missing width attribute.`);
    }

    if (!svgHeight) {
      throw new Error(`${filename}: Missing height attribute.`);
    }

    if (!svgViewBox) {
      throw new Error(`${filename}: Missing viewBox attribute.`);
    }

    const viewBoxPattern = /0 0 ([0-9]+) ([0-9]+)/;

    if (!viewBoxPattern.test(svgViewBox)) {
      throw new Error(
        `${filename}: Invalid viewBox attribute. The viewBox attribute should be in the following format: "0 0 <width> <height>"`
      );
    }

    const [, viewBoxWidth, viewBoxHeight] = svgViewBox.match(viewBoxPattern);

    if (svgWidth !== parseInt(viewBoxWidth)) {
      throw new Error(
        `${filename}: width attribute and viewBox width do not match.`
      );
    }

    if (svgHeight !== parseInt(viewBoxHeight)) {
      throw new Error(
        `${filename}: height attribute and viewBox height do not match.`
      );
    }

    return {
      name,
      width: svgWidth,
      height: svgHeight,
      path: svgPath,
    };
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);
    // Instead of exiting immediately, we set exitCode to 1 and continue
    // iterating through the rest of the SVGs. This allows us to identify all
    // the SVGs that have errors, not just the first one. An exit code of 1
    // indicates that an error occured.
    // Reference: https://nodejs.org/api/process.html#process_exit_codes
    exitCode = 1;
    return null;
  }
});

// Exit early if any errors occurred.
if (exitCode !== 0) {
  process.exit(exitCode);
}

const iconsByName = icons.reduce(
  (acc, icon) =>
    merge(acc, {
      [icon.name]: {
        name: icon.name,
        keywords: icon.keywords,
        heights: {
          [icon.height]: {
            width: icon.width,
            path: icon.path,
          },
        },
      },
    }),
  {}
);

if (argv.output) {
  fs.outputJsonSync(path.resolve(argv.output), iconsByName);
} else {
  process.stdout.write(JSON.stringify(iconsByName));
}
