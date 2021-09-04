import fs from "fs";
import cheerio from "cheerio";
/**
 *
 * @param {Element[]} dataNodes
 * @returns {object[]} array of columns in a map
 */
export const extractRows = (dataNodes) => {
  const rows = [];
  // cheerio fuckery
  dataNodes.forEach((d) => {
    let obj = {};
    // takes all children in a data card
    d.children.forEach((c) => {
      // .card-view
      // generates the map
      const child = cheerio.load(c);
      [...child(".card-view")].forEach((kv) => {
        const kvC = cheerio.load(kv);
        const k = kvC(".title").text();
        const v = kvC(".value").text();
        obj[k] = v;
      });
    });
    // append to array (deep copy the object just to be careful)
    rows.push(Object.assign({}, obj));
    obj = {};
  });
  return rows;
};

/**
 *
 * @param {string} path
 * @returns {string | null} returns data string if file exists or null
 */
export const readFromFile = (path) => {
  try {
    if (fs.existsSync(path)) {
      const data = fs.readFileSync(path, {
        encoding: "utf8",
      });
      return data;
    }
    return null;
  } catch (_) {
    return null;
  }
};

/**
 *
 * @param {string} path
 * @param {string} data
 * @returns {true | null} true if successfully written else null
 */
export const writeToFile = (path, data) => {
  try {
    fs.writeFileSync(path, data, {
      encoding: "utf8",
    });
    return true;
  } catch (err) {
    return null;
  }
};

/**
 * waits for milliseconds
 * @param {number} duration
 * @returns hey!
 */
export const wait = (duration) => {
  return new Promise((resolve, _) => {
    setTimeout(() => {
      resolve("hey!");
    }, duration);
  });
};

export const generateTable = (dataArr) => {
  const columns = dataArr.reduce((final, curr) => {
    const keysFromCurrObj = Object.keys(curr);
    const keys = new Set([...final, ...keysFromCurrObj]);
    return [...keys];
  }, []);
  const formattedDataArr = dataArr.map((data) => {
    columns.forEach((col) => {
      if (!data[col]) {
        data[col] = "";
      }
    });
    return data;
  });
  let html = `<html>
    <body>
      <table>
        <tr>`;
  html += columns.reduce(
    (finalHtml, currCol) => finalHtml + `<th>${currCol}</th>`,
    ""
  );
  html += `</tr>`;
  formattedDataArr.forEach((data) => {
    html += `<tr>`;
    columns.forEach((col) => {
      html += `<td>${data[col]}</td>`;
    });
    html += `</tr>`;
  });
  html += `</table></body></html>`;
  return html;
};
