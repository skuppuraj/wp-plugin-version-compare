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

    getFromFileName(){
        return this.fileName+'.'+this.fromVersion+'.zip';
    }

    getFromFilePath(){
        return path.join(downloadFolder, this.getFromFileName());
    }

    getFromDownloadURL(){
        return  wpURL+this.getFromFileName();
    }

    getToFileName(){
        return this.fileName+'.'+this.toVersion+'.zip';
    }

    getToFilePath(){
        return path.join(downloadFolder, this.getToFileName());
    }

    getToDownloadURL(){
        return  wpURL+this.getToFileName();
    }

    downloadFromFile() {
        let filePath = this.getFromFilePath();
        this.downloadFile(this.getFromDownloadURL(), filePath, (err) => {
            if (err) {
              console.error(`Error downloading the file: ${err}`);
              process.exit();
            } else {
              console.log(`File downloaded successfully to ${filePath}`);
              this.downloadToFile();
            }
        });
    }


    downloadToFile() {
        let filePath = this.getToFilePath();
        
        this.downloadFile(this.getToDownloadURL(), filePath, (err) => {
            if (err) {
              console.error(`Error downloading the file: ${err}`);
              process.exit();
            } else {
              console.log(`File downloaded successfully to ${filePath}`);
              this.unZipFromFile();
            }
        });
    }

    unZipFromFile(){
        
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

    unzipFile (zipFilePath, extractFolder) {
        return new Promise((resolve, reject) => {
                fs.createReadStream(zipFilePath)
                    .pipe(unzipper.Extract({ path: extractFolder }))
                    .on('close', () => {
                    console.log(`File successfully unzipped : ${zipFilePath}`);
                    resolve();
                    })
                    .on('error', (err) => {
                    console.error(`Error unzipping file: ${err}`);
                    reject(err);
                    });
            });
    }

}

module.exports = Main;