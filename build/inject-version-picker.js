const { execFileSync } = require("child_process");
const fs = require("fs");
const [_node, _script, ...args] = process.argv;

let CURRENT_VERSION = args.find((arg) => arg.startsWith("--current="));
let VERSIONS = args.find((arg) => arg.startsWith("--versions="));
let BUILD_PATH = args.find((arg) => arg.startsWith("--path="));

if (!CURRENT_VERSION || !VERSIONS || !BUILD_PATH) {
  console.error(
    `
      Invalid call format! Use the following instead: 
      
      node build/inject-version-picker.js --current=v6 --versions=v3,v4,v5,v6 --path=esdocs/
    `
  );
  process.exit(1);
} else {
  CURRENT_VERSION = CURRENT_VERSION.replace("--current=", "");
  VERSIONS = VERSIONS.replace("--versions=", "").split(",");
  BUILD_PATH = BUILD_PATH.replace("--path=", "");
}

console.info(
  `Injecting version picker into ${BUILD_PATH} for current version ${CURRENT_VERSION} ...`
);

findHtmlFiles(BUILD_PATH).forEach(injectVersionPicker);

/////////////
// Helpers //
/////////////

function buildVersionPicker() {
  function buildVersionEntry(version) {
    return `
      <li>
        <a href="/${version}\">Switch to ${version}</a>
      </li>
    `;
  }

  const css = `
    <style>
      #version-picker {
        cursor: pointer;
      }
      
      #version-picker:hover ul {
        display: block;
      }

      #version-picker ul {
        display: none;
        z-index: 100;
        background: white;
        padding: 0;
        list-style-type: none;
        border: 1px solid #ddd;
      }

      #version-picker ul li {
        list-style-type: none;
        padding: 0 10px;
      }

      #version-picker ul li:hover {
        background: #eee;
      }
    </style>
  `;

  const html = `
    <div id="version-picker">
      Docs ${CURRENT_VERSION}
      <ul>
        ${VERSIONS.map(buildVersionEntry).join("")}    
      </ul>
    </div>
    ${css}
  `;

  return html
    .split("\n")
    .map((line) => line.trim())
    .join("");
}

function findHtmlFiles(path) {
  const fileList = execFileSync("find", [path]).toString();

  return fileList.split("\n").filter((file) => file.endsWith(".html"));
}

function injectVersionPicker(file) {
  const fileContents = fs.readFileSync(file).toString();
  const versionPicker = buildVersionPicker();

  console.info(
    `Injecting version picker for ${CURRENT_VERSION} into ${file} ...`
  );

  const newFileContents = fileContents.replace(
    /<\/header>/s,
    `${versionPicker}</header>`
  );

  fs.writeFileSync(file, newFileContents);
}
