
const https = require("https");
const path = require('path');
const unzipper = require('unzipper');
const fs = require('fs-extra');
const shell = require('shelljs');

const args = process.argv.slice(2);

const wpURL = 'https://downloads.wordpress.org/plugin/';
const downloadFolder = './downloads';
const extractFolder = './extracted';

class Slug {
    constructor(args) {
        if (args.length <= 0) {
            console.log("Invalid args");
            process.exit();
        }
        this.fileName = args[0];
        this.version = ''; 
        if (args[1]) {
            this.version = args[1];
        }
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
        this.deleteDirectoryAllDir();
        this.createFolders();
        this.downloadFromFile();
    }

    getFileName(){
        return this.fileName;
    }

    getDownloadFileName(){
        let name = '';
        if (this.version) {
            name = '.'+this.version;
        }
        return this.getFileName()+name+'.zip';
    }

    getFromFilePath(){
        return path.join(downloadFolder, this.getDownloadFileName());
    }

    getDownloadURL(){
        return  wpURL+this.getDownloadFileName();
    }

    downloadFromFile() {
        let filePath = this.getFromFilePath();
        let url = this.getDownloadURL();
        this.downloadFile(url, filePath, (err) => {
            if (err) {
                console.log(`url -> ${url}`);
                
              console.error(`Error downloading the file: ${err}`);
              process.exit();
            } else {
            //   console.log(`File downloaded successfully to ${filePath}`);
              this.unZipFromFile();
            }
        });
    }

    unZipFromFile(){
        const zipFilePath = this.getFromFilePath(); // Update with your zip file path
        this.unzipFile(zipFilePath, extractFolder)
        .then(() => {
            this.findSlugFile(extractFolder);
            // console.log('Extraction completed successfully.');
        })
        .catch((err) => {
            console.error('Error Extraction failed:', err);
        });
    }

    unzipFile (zipFilePath, extractFolder) {
        return new Promise((resolve, reject) => {
                fs.createReadStream(zipFilePath)
                    .pipe(unzipper.Extract({ path: extractFolder }))
                    .on('close', () => {
                    // console.log(`File successfully unzipped : ${zipFilePath}`);
                    resolve();
                    })
                    .on('error', (err) => {
                    console.error(`Error unzipping file: ${err}`);
                    reject(err);
                    });
            });
    }

    downloadFile (url, dest, callback) {
        const file = fs.createWriteStream(dest);
        https.get(url, (response) => {
          if (response.statusCode !== 200) {
            callback(`Error Failed to download file, status code: ${response.statusCode} url -> ${url}`);
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

    async findSlugFile(extractFolder){
        let folderPath = extractFolder+'/'+this.getFileName();
        try {
            // Step 1: Read the directory
            const files = await fs.readdir(folderPath);
        
            // Step 2: Loop through each file
            for (const file of files) {
              const filePath = path.join(folderPath, file);
        
              // Step 3: Check if it's a file (not a directory)
              const stats = await fs.stat(filePath);
              if (stats.isFile()) {
                // Step 4: Read the content of the file
                const content = await fs.readFile(filePath, 'utf-8');
        
                // Step 5: Check if the file contains the string 'Plugin Name'
                // console.log(content.includes('Plugin Name:'));
                // console.log(content.includes('Version:'));
                // console.log(content.includes('Description:'));
                
                if ((content.includes('Plugin name:') || content.includes('Plugin Name:') || content.includes('plugin name:')) && content.includes('Version:')) {
                //   console.log('\x1b[33m', `Slug Name: ${this.fileName}/${file}`);
                  console.log(`${this.fileName}/${file}`);
                }
              }
            }
          } catch (err) {
            console.error('Error reading folder:', err);
          }
    }
    
    
    deleteDirectoryAllDir(){
        this.deleteDirectory(downloadFolder);
        this.deleteDirectory(extractFolder);
    }

    deleteDirectory(directoryPath) {
        // console.log(`Clearing ${directoryPath} folder...`);
        shell.rm('-rf', directoryPath);
    }
}

// module.exports = Slug;

let obj = new Slug(args);

obj.run();