
const Main = require('./main');

const args = process.argv.slice(2);

let obj = new Main(args);

obj.run();

// downloadFromFile(args);

// // function downloadFromFile(args) {
// //     let fileName = args[0];
// //     const fromVersion = args[1];
// //     const toVersion = args[2];
    
// //     let fromFileName =fileName+'.'+fromVersion+'.zip';
    
// //     let fromDownloadURL = wpURL+fromFileName;
    
// //     let fromFilePath = path.join(downloadFolder, fromFileName);
    
// //     // Start the download
// //     downloadFile(fromDownloadURL, fromFilePath, (err) => {
// //         if (err) {
// //           console.error(`Error downloading the file: ${err}`);
// //           process.exit();
// //         } else {
// //           console.log(`File downloaded successfully to ${fromFilePath}`);
// //           downloadToFile(args);
// //         }
// //     });
// // }


// function extractFromFile(args) { 
//     let fileName = args[0];
//     const fromVersion = args[1];
//     const toVersion = args[2];
//     let fromFileName =fileName+'.'+fromVersion+'.zip';
    
//     let fromFilePath = path.join(downloadFolder, fromFileName);
    
// }

// function downloadFile (url, dest, callback) {
//     const file = fs.createWriteStream(dest);
//     https.get(url, (response) => {
//       if (response.statusCode !== 200) {
//         callback(`Failed to download file, status code: ${response.statusCode}`);
//         return;
//       }
      
//       response.pipe(file);
//       file.on('finish', () => {
//         file.close(callback);  // Close file and call callback
//       });
//     }).on('error', (err) => {
//       fs.unlink(dest); // Delete the file async. (But we don't check the result)
//       callback(err.message);
//     });
// }

// function unzipFile (zipFilePath, extractFolder) {
//     return new Promise((resolve, reject) => {
//       // Ensure the extraction folder exists
//       if (!fs.existsSync(extractFolder)){
//         fs.mkdirSync(extractFolder);
//       }
  
//       fs.createReadStream(zipFilePath)
//         .pipe(unzipper.Extract({ path: extractFolder }))
//         .on('close', () => {
//           console.log(`File successfully unzipped : ${zipFilePath}`);
//           resolve();
//         })
//         .on('error', (err) => {
//           console.error(`Error unzipping file: ${err}`);
//           reject(err);
//         });
//     });
//   };