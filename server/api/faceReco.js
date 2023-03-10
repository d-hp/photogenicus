// NB: Reference tensorflow.org documentation to setup using nodejs => dependency must be installed as root, npm does not allow this by-default, may have to enable root privileges prior to dependency installation
const tf = require('@tensorflow/tfjs-node');
// Load bindings for tensorflow
require('@tensorflow/tfjs-node');

const faceapi = require('@vladmandic/face-api');
const fs = require('fs');
const path = require('path');

// Create a reference to models/assets required for face-api functionality
const MODEL_URI = path.join(__dirname, '../public/models');

// `b64ToTensor` converts webcam-captured image to rgb-type tensor to ensure compatibility with face-api
const b64ToTensor = (queryImage) => {
  // `queryImage` provided by UI begins with 'data:image/jpeg;base64, ...' — trim string to isolate base-64 prior to binary conversion
  const trimB64 = queryImage.replace(/^data:image\/(png|jpeg);base64,/, '');
  // Utilize Buffer.from to generate a binary from the isolated base-64 string
  const b64ToBinary = Buffer.from(trimB64, 'base64');
  // Decode `b64ToBinary` binary buffer into RGB-type tensor (RGB-type is achieved by specifying '3' as second argument to method)
  const decodedTensor = faceapi.tf.node.decodeImage(b64ToBinary, 3);
  // Specify batch-dimension for `decodedTensor`
  const expandTensor = faceapi.tf.expandDims(decodedTensor, 0);
  // Dispose of `decodedTensor` to prevent memory-leak, as tensors are not garbage-collected.
  faceapi.tf.dispose([decodedTensor]);
  // The disposal of `expandTensor` should be performed after use of `expandTensor` in the function below: `facialRecognition()`
  return expandTensor;
};

// `arrOfB64ToTensor` will pre-process array of base-64 strings retrieved from data into an array of rgb-tensors for use as referenceData
const arrOfB64ToTensor = (referenceData) => {
  const arrOfRefTensor = referenceData.map((refImg) => {
    const decodedTensor = faceapi.tf.node.decodeImage(refImg, 3);
    const expandTensor = faceapi.tf.expandDims(decodedTensor, 0);
    faceapi.tf.dispose([decodedTensor]);
    return expandTensor;
  });
  return arrOfRefTensor;
};

// `imageToTensor` is simply for test-purposes prior to SQL-DB integration to test API functionality (supports: bmp/gif/jpeg/png -> 3d/4d tensor of decoded image)
const imageToTensor = (path) => {
  // Utilize `fs` to synchronously load path'ed image as binary into `imgBuff`
  const imgBuff = fs.readFileSync(path);
  // Decode `imgBuff` binary buffer into RGB-type tensor (RGB-type is achieved by specifying '3' as second argument to method)
  const decodedTensor = faceapi.tf.node.decodeImage(imgBuff, 3);
  // Specify batch-dimension for `decodedTensor`
  const expandTensor = faceapi.tf.expandDims(decodedTensor, 0);
  // Dispose of `decodedTensor` to prevent memory-leak, as tensors are not garbage-collected.
  faceapi.tf.dispose([decodedTensor]);
  // The disposal of `expandTensor` should be performed after use of `expandTensor` in the function below: `facialRecognition()`
  return expandTensor;
};

// `facialRecognition` will analyze descriptors generated from referenceData & descriptors generated from queryImage
async function facialRecognition(queryImage, referenceData) {
  // Pause thread of execution until all promises resolve — indicates resolution of models required to perform facial identification through face-api
  await Promise.all([
    faceapi.nets.ssdMobilenetv1.loadFromDisk(MODEL_URI),
    faceapi.nets.faceLandmark68Net.loadFromDisk(MODEL_URI),
    faceapi.nets.ageGenderNet.loadFromDisk(MODEL_URI),
    faceapi.nets.faceRecognitionNet.loadFromDisk(MODEL_URI),
    faceapi.nets.faceExpressionNet.loadFromDisk(MODEL_URI),
  ]);

  // Configure `options` object to define threshold of confidence
  const options = new faceapi.SsdMobilenetv1Options({
    minConfidence: 0.1,
    maxResults: 10,
  });

  // Iterate through referenceData to initialize FaceMatch with the cumulative descriptors present from batch-upload
  let refDescriptors = [];

  for (let i = 0; i < referenceData.length; i++) {
    const detection = await faceapi
      .detectSingleFace(referenceData[i])
      .withFaceLandmarks()
      .withFaceDescriptor();
    refDescriptors.push(detection.descriptor);
  }

  // Determine if facial descriptors were returned. If not, return, as no reference data is available to make comparison.
  if (!refDescriptors.length) {
    return;
  }

  // Initialize `FaceMatcher` utilizing detection results stored within `referenceResult` — faceMatcher can now be used for comparison
  const faceMatcher = new faceapi.FaceMatcher(refDescriptors);

  // `referenceData` refers to `expandTensor` returned from `imageToTensor` and must be disposed to avoid memory leak
  faceapi.tf.dispose([referenceData]);

  // Generate facial-descriptors utilizing `queryImage` for a single face detected in image
  const singleResult = await faceapi
    .detectSingleFace(queryImage)
    .withFaceLandmarks()
    .withFaceDescriptor();

  // `queryImage` refers to `expandTensor` returned from `b64ToTensor` and must be disposed to avoid memory leak
  faceapi.tf.dispose([queryImage]);

  // If facial-descriptors were detected in `queryImage`...
  if (singleResult) {
    // Use referenceData-initialized FaceMatcher: `faceMatcher`, to determine whether a match exists within referenceData
    const bestMatch = faceMatcher.findBestMatch(singleResult.descriptor);
    // findBestMatch() will return an automatically generated label from referenceData & a number indicative of degree of confidence
    return bestMatch.toString();
  }
}

// Export facialRecognition, b64ToTensor, imageToTensor, and arrOfB64ToTensor functions for import into apiController.js for use as middleware in route handlers
module.exports = {
  facialRecognition,
  b64ToTensor,
  imageToTensor,
  arrOfB64ToTensor,
};
