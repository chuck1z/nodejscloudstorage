const util = require("util");
const Multer = require('multer');
const { Storage } = require("@google-cloud/storage");

let processFile = Multer({
    storage: Multer.memoryStorage(),
}).single("file");
console.log(processFile);

let processFileMiddleware = util.promisify(processFile);

// Instantiate a storage client with credentials
const storage = new Storage({ keyFilename: "gcskey.json" });
const bucket = storage.bucket("somethingaldieric");

// Create a new handler for the upload route
const uploadHandler = async (req, res) => {
    try {
      await processFileMiddleware(req, res);
  
      if (!req.file) {
        return res.status(400).send({ message: "Please upload a file!" });
      }
  
      // Create a new blob in the bucket and upload the file data.
      const blob = bucket.file(req.file.originalname);
      const blobStream = blob.createWriteStream();
  
      blobStream.on("NotFoundError", (err) => {
        res.status(500).send({ message: err.message });
      });
      blobStream.on("InvalidRequestError", (err) => {
        res.status(500).send({ message: err.message });
      });
  
      blobStream.on("finish", async (data) => {
        // Create URL for directly file access via HTTP.
        const publicUrl = new URL(
          `https://storage.googleapis.com/${bucket.name}/${blob.name}`
        );
  
        try {
          // Make the file public
          await bucket.file(req.file.originalname).makePublic();
        } catch {
          return res.status(500).send({
            message:
              `Uploaded the file successfully: ${req.file.originalname}, but public access is denied!`,
            url: publicUrl,
          });
        }
  
        res.status(200).send({
          message: "Uploaded the file successfully: " + req.file.originalname,
          url: publicUrl,
        });
      });
  
      blobStream.end(req.file.buffer);
    } catch (err) {
      res.status(500).send({
        message: `Could not upload the file: ${req.file.originalname}. ${err}`,
      });
    }
};

module.exports = uploadHandler;