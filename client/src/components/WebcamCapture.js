import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import axios from 'axios';
import Webcam from 'react-webcam';

const WebcamCapture = ({ setAuth }) => {
  const handleChange = (base64Image) => {
    axios({
      method: 'POST',
      url: 'http://localhost:3001/image',
      data: { base64Image },
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }).then((data) => {
      if (data.request.responseText.includes('person')) {
        setAuth(true);
      } else {
        setAuth(false);
      }
      setTimeout(() => {
        setAuth(null);
      }, 5000);
    });
  };

  return (
    <div id='webcam-container'>
      <Webcam
        audio={false}
        height={360}
        screenshotFormat='image/jpeg'
        width={480}
        mirrored={true}
      >
        {({ getScreenshot }) => (
          <button
            onClick={() => {
              const imageSrc = getScreenshot();
              handleChange(imageSrc);
            }}
            id='capture-button'
          >
            CAPTURE PHOTO
          </button>
        )}
      </Webcam>
    </div>
  );
};

export default WebcamCapture;
