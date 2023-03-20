#!/usr/bin/env node
const iconsData = require("../lib/build/data.json");
const fse = require("fs-extra");
const { join, resolve } = require("path");

const srcDir = resolve(__dirname, "../src/__generated__");
const iconsFile = join(srcDir, "icons.js");
const typesFile = join(srcDir, "icons.d.ts");

const GENERATED_HEADER = "/* THIS FILE IS GENERATED. DO NOT EDIT IT. */";

function pascalCase(str) {
  return str.replace(/(^|-)([a-z])/g, (_, __, c) => c.toUpperCase());
}

const icons = Object.entries(iconsData)
  .map(([key, icon]) => {
    const name = pascalCase(key);
    const iconName = `${name}Icon`;
    const code = `function ${iconName}(props) {
  const svgDataByHeight = ${JSON.stringify(icon.heights)}
  const name = '${name}';
  return <svg {...getSvgProps({...props, svgDataByHeight, name })} />
}

${iconName}.defaultProps = {
  size: 'small'
}
`;

    return {
      key,
      iconName,
      icon,
      code,
    };
  })
  .sort((a, b) => a.key.localeCompare(b.key));

function writeIcons(file) {
  const count = icons.length;
  const code = `${GENERATED_HEADER}
import React from 'react'
import getSvgProps from '../get-svg-props'

${icons.map(({ code }) => code).join("\n")}

export {
  ${icons.map(({ iconName }) => iconName).join(",\n  ")}
}`;
  return fse.writeFile(file, code, "utf8").then(() => {
    console.warn("wrote %s with %d exports", file, count);
    return icons;
  });
}

function writeTypes(file) {
  const count = icons.length;
  const code = `${GENERATED_HEADER}
import * as React from 'react'

type Size = 'small' | 'medium' | 'large'

interface IconProps {
  'aria-label'?: string
  size?: number | Size
}

type Icon = React.FC<IconProps>

${icons.map(({ iconName }) => `declare const ${iconName}: Icon`).join("\n")}

export {
  Icon,
  IconProps,
  ${icons.map(({ iconName }) => iconName).join(",\n  ")}
}`;
  return fse.writeFile(file, code, "utf8").then(() => {
    console.warn("wrote %s with %d exports", file, count);
    return icons;
  });
}

fse
  .mkdirs(srcDir)
  .then(() => writeIcons(iconsFile))
  .then(() => writeTypes(typesFile))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
