// imagesController will contain numerous methods that will be utilized within route handlers to handle required functionality
const imagesController = {};
const db = require('../models/image');
const fs = require('fs');
const path = require('path');

// This middleware will be utilized when the client makes a post request to the server with an image to test
imagesController.uploadImage = (req, res, next) => {
  // console.log("req.body in uploadImage" , req.body)
  // Image captured utilizing webcam will be stored as base64-string in: `req.body.base64Image`
  const imageToAuthenticate = req.body.base64Image;

  // Store `imageToAuthenticate` within `res.locals.uploadImage`
  res.locals.uploadImage = imageToAuthenticate;

  // Return the next middleware
  return next();
};

// This middleware will be utilized when the admin makes a batch upload request to the server with images of the new NYOI cohort
imagesController.batchImageUpload = (req, res, next) => {
console.log(req.files);
  // Images batch-uploaded utilizing drag-and-drop functionality will be stored within 'req.files'
  const addRow = db.prepare(
    'INSERT INTO people (personName, image) VALUES (?, ?);'
  );
  // Deconstructs req.body object for images included within batch-upload. Batch images should be recieved as a buffer anyway allowing direct input into tables.
  const batchImages = req.files.filepond.data;

  // Execute SQL insert query within try ... catch block; any error in DB interaction should be thrown
  try {
    // Iterate through `batchImages` arary and execute addRow.run for each image file passed by the file-upload UI
    const row = addRow.run('person', batchImages)
    let allDbData = db.prepare('SELECT * FROM people').all()
    // console.log(db.prepare('SELECT * FROM people').all())
    // res.locals.allDbData = allDbData
    next()
  } catch (err) {
    return next({
      log: err,
      message: 'database query failure in batchImageUpload',
    });
  }

  // const imageBuffer = fs.readFileSync(
  //   path.resolve(__dirname, '../utils/assets/queryImage.png')
  // );
  // const imageBuffer1 = fs.readFileSync(
  //   path.resolve(__dirname, '../utils/assets/morry.jpg')
  // );

  // addRow.run('refImg', imageBuffer1);
  // addRow.run('refImg', imageBuffer);
  // const getTable1 = db.prepare('SELECT image FROM people');
  // console.log(getTable1.all());


  return next();
};

// Upon client request for authentication of an image, this middleware should be activated to retrieve all photos from `people` SQL database.
imagesController.retrieveRefImages = (req, res, next) => {
  // Define SQL query parameters to retrieve all images currently stored in database
  const getTable = db.prepare('SELECT image FROM people');


  // Execute SQL query to DB. If query fails, catch the Error that is thrown by sqlite3 and throw it to global error hanlder.
  try {
    const peopleBuffers = getTable.all();

    const peopleImages = [];
    // console.log(peopleBuffers)
    for (let i = 0; i < peopleBuffers.length; i++) {
      if (peopleBuffers[i].image) {
        // peopleImages.push(peopleBuffers[i].image);
        peopleImages.push(Buffer.from(peopleBuffers[i].image));
      }
    }

    // Store response of db into res.locals for access in next middleware
    res.locals.peopleInDb = peopleImages;

    return next();
  } catch (err) {
    return next({
      log: err,
      message: 'database query failure in retrieveImages',
    });
  }
};

// Export `imagesController` for use within `routes/images.js`
module.exports = imagesController;
