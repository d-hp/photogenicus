const apiController = {};
const faceReco = require('../api/faceReco.js');

// This middleware will only be utilized when a user captures a photo with the <Webcam /> component.
// `apiController.processImages` has access to `res.locals.uploadImage` & `res.locals.refData` from the `uploadImage` & `retrieveRefData` middleware, defined in imagesController.js, that precede the execution of this middleware
apiController.processImages = async (req, res, next) => {
  // Pre-process base64 image within `res.locals.uploadImage` into rgb-tensor (from either 'blob' or 'base64')
  const queryImage = faceReco.b64ToTensor(res.locals.uploadImage);
  let referenceData = [];

  // NB: Pre-process refData once certain of image-type upon retrieving from SQL DB
  if (!res.locals.peopleInDb) {
    next({ err: `No reference data found. Please try again: ${err}` });
  } else {
    referenceData = faceReco.arrOfB64ToTensor(res.locals.peopleInDb);
  }

  // const testRefImg = faceReco.imageToTensor(
  //   './utils/assets/referenceImages.png'
  // );

  // Provide queryImage & referenceData rgb-tensors to `facialRecognition (queryImg, refImage)` function defined in main API script: `faceReco.js`
  try {
    const authenticationStatus = await faceReco.facialRecognition(
      queryImage,
      referenceData
    );
    // Store result of facial recognition function into `res.locals.authStatus` to send as response to client request
    res.locals.authStatus = authenticationStatus;
    // Continue to next middleware
    return next();
  } catch (err) {
    // Invoke global error handler if error is thrown in invocation of asynchronous function `facialRecognition`
    next({ err: `error occurred ${err}` });
  }
};

// Export `apiController` for use within `routes/images.js`
module.exports = apiController;
