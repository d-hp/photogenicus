const imagesRouter = require('express').Router();
const imagesController = require('../controllers/imagesController.js');
const apiController = require('../controllers/apiController.js');

/* WEBCAM 'CAPTURE PHOTO' intiates post request (to '/image') that will be handled by this route handler
  (1) imagesController.uploadImage — stores posted image within `res.locals.uploadImage`
  (2) imagesController.retrieveRefImages — retrieves all images in SQL_DB & stores within `res.locals.refData` for use as reference data
  (3) apiController.processImages — utilizes `uploadImage` & `refData` to perform facial recognition */

// NB: imagesController.retrieveRefImages temporarily commented out for local testing purposes
imagesRouter.post(
  '/',
  imagesController.uploadImage,
  imagesController.retrieveRefImages,
  apiController.processImages,
  (req, res) => {
    // console.log('res.locals.authStatus', res.locals.authStatus);
    res.status(200).json(res.locals.authStatus);
  }
);

/* BATCH UPLOAD 'drag-and-drop' intiates post request that will be handled by this route handler
  (1) imagesController.batchImageUpload — stores all uploaded files into SQL_DB for future authentication requests & returns success upon storing
*/
imagesRouter.post('/batch', imagesController.batchImageUpload, (req, res) => {
  res.status(200).send('Route completed.');
});

imagesRouter.get('/batch', imagesController.retrieveRefImages, (req, res) => {
  res.status(200).json(res.locals.peopleInDb)
})

module.exports = imagesRouter;
