import express from "express";
import axios from "axios";
import cheerio from "cheerio";
import {
  extractRows,
  generateTable,
  readFromFile,
  wait,
  writeToFile,
} from "./utils.js";
import cors from "cors";

const INIT_SEBI_FILE_STRUCTURE = {
  numberOfRecords: 0,
  records: [],
};

const app = express();
app.use(cors());

app.get("/mf-dist/:pincode", async (req, res) => {
  const pin = req.params.pincode;
  if (pin.length !== 6 || isNaN(pin)) {
    res.send("invalid pin");
    return;
  }
  // returns a html and the data is in a table, so google sheets can parse it nicely
  const { data } = await axios({
    method: "POST",
    baseURL: `https://www.amfiindia.com/modules/NearestFinancialAdvisorsDetails?nfaType=All&nfaARN=&nfaARNName=&nfaAddress=&nfaCity=&nfaPin=${pin}`,
  });
  res.send(data);
});

app.get("/sebi-advisors", async (_, res) => {
  // getting a html response
  // data is not in a table, so need to convert it to table
  let cursor = 0;
  // this tracks the pagination thing
  const existingFileData = readFromFile("./sebi.json");
  // i want to read from file because I don't want to scrape all pages on every request
  let fileObj = { ...INIT_SEBI_FILE_STRUCTURE };
  // representing the file.json
  if (existingFileData) {
    fileObj = JSON.parse(existingFileData);
    cursor = Math.floor(fileObj.numberOfRecords / 25);
    // if file already exists, then it takes the existing cursor on the file
  }
  try {
    while (true) {
      console.log({ cursor });
      let data;
      try {
        const response = await axios({
          method: "POST",
          baseURL: `https://www.sebi.gov.in/sebiweb/ajax/other/getintmfpiinfo.jsp?nextValue=0&next=n&intmId=13&contPer=&name=&regNo=&email=&location=&exchange=&affiliate=&alp=&doDirect=${cursor}&intmIds=`,
        });
        data = response.data;
      } catch (_) {
        await wait(1000);
        console.log("retrying in 1 second", cursor);
        continue;
      }
      // fetches docs, if any error occurs, wait for a second and try again
      const $ = cheerio.load(data);
      const paginationData = $(".pagination_inner");
      if (paginationData.text() === "No record(s) available.") {
        // send response
        const html = generateTable(fileObj.records);
        return res.send(html);
      }
      // check the number of records
      const totalNumberOfRecords = parseInt(
        paginationData.text().split(" ").slice(-2, -1)[0]
      );
      if (totalNumberOfRecords <= fileObj.numberOfRecords) {
        // send response
        const html = generateTable(fileObj.records);
        return res.send(html);
      }
      const dataNodes = [...$(".card-table-left")];
      const rows = extractRows(dataNodes);
      fileObj.records.push(...rows);
      fileObj.numberOfRecords += rows.length;
      // update the fileObj and write it to the file.json
      const fileData = JSON.stringify(fileObj);
      const hasWrittenToFile = writeToFile("./sebi.json", fileData);
      if (hasWrittenToFile) {
        // if successfully written, then increment cursor
        cursor++;
      }
    }
  } catch (err) {
    console.log(err);
    return res.send("something went wrong");
  }
});

app.get("/sebi-advisors/reset", async (_, res) => {
  const fileObj = { ...INIT_SEBI_FILE_STRUCTURE };
  const hasReset = await writeToFile("./sebi.json", JSON.stringify(fileObj));
  if (hasReset) {
    return res.status(200).send("Successfully reset");
  }
  return res.status(200).send("Cannot reset:");
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`listening on port ${PORT}`);
});
