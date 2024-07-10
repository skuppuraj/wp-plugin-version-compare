const https = require("https");
const fs = require("fs");
const path = require('path');

const wpURL = 'https://downloads.wordpress.org/plugin/';
const downloadFolder = './downloads';


const args = process.argv.slice(2);

if (args.length <= 0) {
    console.log("Invalid args");
    return;
}
console.log(args);
// Create the download folder if it doesn't exist
if (!fs.existsSync(downloadFolder)){
    fs.mkdirSync(downloadFolder);
}

let fileName = args[0];
const fromVersion = args[1];
const toVersion = args[2];

let fromFileName =fileName+'.'+fromVersion+'.zip';

let fromDownloadURL = wpURL+fromFileName;

let fromFilePath = path.join(downloadFolder, fromFileName);

// Start the download
downloadFile(fromDownloadURL, fromFilePath, (err) => {
    if (err) {
      console.error(`Error downloading the file: ${err}`);
    } else {
      console.log(`File downloaded successfully to ${fromFilePath}`);
    }
});

toFileName =fileName+'.'+toVersion+'.zip';

let toDownloadURL = wpURL+toFileName;
let toFilePath = path.join(downloadFolder, toFileName);

downloadFile(toDownloadURL, toFilePath, (err) => {
    if (err) {
      console.error(`Error downloading the file: ${err}`);
    } else {
      console.log(`File downloaded successfully to ${toFilePath}`);
    }
});


function downloadFile (url, dest, callback) {
    const file = fs.createWriteStream(dest);
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        callback(`Failed to download file, status code: ${response.statusCode}`);
        return;
      }
      
      response.pipe(file);
      file.on('finish', () => {
        file.close(callback);  // Close file and call callback
      });
    }).on('error', (err) => {
      fs.unlink(dest); // Delete the file async. (But we don't check the result)
      callback(err.message);
    });
}
