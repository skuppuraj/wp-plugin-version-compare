const https = require("https");
const path = require('path');
const unzipper = require('unzipper');
const fs = require('fs-extra');

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

    emptyAllDir(){
        
    }

    getFileName(){
        return this.fileName;
    }

    getFromFileName(){
        return this.getFileName()+'.'+this.fromVersion+'.zip';
    }

    getFromFolderName(){
        return this.getFileName()+'.'+this.fromVersion;
    }

    getToFolderName(){
        return this.getFileName()+'.'+this.toVersion;
    }

    getFromFilePath(){
        return path.join(downloadFolder, this.getFromFileName());
    }

    getFromDownloadURL(){
        return  wpURL+this.getFromFileName();
    }

    getToFileName(){
        return this.getFileName()+'.'+this.toVersion+'.zip';
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
        const zipFilePath = this.getFromFilePath(); // Update with your zip file path
        console.log(zipFilePath);
        this.unzipFile(zipFilePath, extractFolder)
        .then(() => {
            console.log('Extraction completed successfully.');
            this.renameFromFolder();
        })
        .catch((err) => {
            console.error('Extraction failed:', err);
        });
    }

    unZipToFile(){
        const zipFilePath = this.getToFilePath(); // Update with your zip file path
        console.log(zipFilePath);
        this.unzipFile(zipFilePath, extractFolder)
        .then(() => {
            console.log('Extraction completed successfully.');
            this.renameToFolder();
        })
        .catch((err) => {
            console.error('Extraction failed:', err);
        });
    }

    renameFromFolder(){
        const oldFolderPath = path.join(extractFolder, this.getFileName()); // Update with the current folder path
        const newFolderPath = path.join(extractFolder, this.getFromFolderName());

        this.renameFolder(oldFolderPath, newFolderPath)
        .then(() => {
            console.log(`Folder renamed successfully.${newFolderPath}`);
            this.unZipToFile();
        })
        .catch((err) => {
            console.error('Error renaming folder:', err);
        });
    }

    renameToFolder(){
        const oldFolderPath = path.join(extractFolder, this.getFileName()); // Update with the current folder path
        const newFolderPath = path.join(extractFolder, this.getToFolderName());

        this.renameFolder(oldFolderPath, newFolderPath)
        .then(() => {
            console.log(`Folder renamed successfully.${newFolderPath}`);
        })
        .catch((err) => {
            console.error('Error renaming folder:', err);
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

    renameFolder (oldPath, newPath){
        return new Promise((resolve, reject) => {
          fs.rename(oldPath, newPath, (err) => {
            if (err) {
              reject(err);
            } else {
              resolve();
            }
          });
        });
    }

    emptyDirectory(directoryPath) {
        return fs.remove(directoryPath);
    }

}

module.exports = Main;