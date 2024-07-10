const https = require("https");
const fs = require("fs");
const path = require('path');

const wpURL = 'https://downloads.wordpress.org/plugin/';
const downloadFolder = './downloads';
const extractFolder = './extracted';

class Main{

    constructor( args ){
        if (args.length <= 0) {
            console.log("Invalid args");
            process.exit();
        }
        this.fileName = args[0];
        this.fromVersion = args[1];
        this.toVersion = args[2];
    }

    createFolders(){
        // Create the download folder if it doesn't exist
        if (!fs.existsSync(downloadFolder)){
            fs.mkdirSync(downloadFolder);
        }

        // Ensure the extraction folder exists
        if (!fs.existsSync(extractFolder)){
            fs.mkdirSync(extractFolder);
        }
    }

    run(){
        this.createFolders();
        this.downloadFromFile();
    }

    downloadFromFile() {

        let fromFileName =this.fileName+'.'+this.fromVersion+'.zip';
        
        let fromDownloadURL = wpURL+fromFileName;
        
        let fromFilePath = path.join(downloadFolder, fromFileName);
        
        // Start the download
        this.downloadFile(fromDownloadURL, fromFilePath, (err) => {
            if (err) {
              console.error(`Error downloading the file: ${err}`);
              process.exit();
            } else {
              console.log(`File downloaded successfully to ${fromFilePath}`);
              this.downloadToFile();
            }
        });
    }

    downloadToFile() {
        let toFileName =this.fileName+'.'+this.toVersion+'.zip';
        
        let toDownloadURL = wpURL+toFileName;
        let toFilePath = path.join(downloadFolder, toFileName);
        
        this.downloadFile(toDownloadURL, toFilePath, (err) => {
            if (err) {
              console.error(`Error downloading the file: ${err}`);
              process.exit();
            } else {
              console.log(`File downloaded successfully to ${toFilePath}`);
              
            }
        });
    }

    downloadFile (url, dest, callback) {
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

}

module.exports = Main;