import './styles/App.css';
import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import { FileUploader } from 'react-drag-drop-files';
import axios from 'axios';
import Webcam from 'react-webcam';
import successLogo from '../assets/success.png';
import denyLogo from '../assets/denied.png';
import octopusBlue from '../assets/wonderpusBannerBlue.png';
import octopusPink from '../assets/wonderpusBannerPink.png';
import WebcamCapture from './components/WebcamCapture';
import { FilePond, File, registerPlugin } from 'react-filepond';
import 'filepond/dist/filepond.min.css';
import FilePondPluginImageExifOrientation from 'filepond-plugin-image-exif-orientation';
import FilePondPluginImagePreview from 'filepond-plugin-image-preview';
import 'filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css';
registerPlugin(FilePondPluginImageExifOrientation, FilePondPluginImagePreview);

const App = () => {
  const [file, setFile] = useState(null);
  const [auth, setAuth] = useState(null);
  const [webcam, setWebcam] = useState(false);

  const handleChange = (files) => {
    setFile(files);
    axios({
      method: 'POST',
      url: 'http://localhost:3001/image/batch',
      data: { file },
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  };

  const renderAuth = (status) => (
    <img
      className='auth_status'
      src={status === true ? successLogo : denyLogo}
    />
  );

  const handleCameraStatus = () => {
    webcam ? setWebcam(false) : setWebcam(true);
  };

  const imageArchive = [];

  return (
    <div id='container'>
      <img className='bannerLogo' src={octopusBlue}></img>
      <div className='image-containers'>
        <div className='sub-container'>
          {webcam && (
            <p className='capture-subtext'>
              <i>Click 'Capture Photo' to initiate authentication process.</i>
            </p>
          )}
          {webcam && <WebcamCapture setAuth={setAuth} setWebcam={setWebcam} />}

          <button className='webcam-status' onClick={handleCameraStatus}>
            {`Click here to turn ${webcam ? 'off' : 'on'} your devices' camera`}
          </button>
          {auth === true ? renderAuth(true) : ''}
          {auth === false ? renderAuth(false) : ''}
        </div>

        {/* IMAGE CONTAINER     */}
        <div className='sub-container'>
          <p className='upload-subtext'>
            <i>Drag-and-drop identification photographs here.</i>
          </p>
          <FilePond
            allowMultiple={true}
            server='http://localhost:3001/image/batch'
          />
          <p className='drop-status'>
            {file ? `File name: ${file.name}` : 'No files uploaded yet.'}
          </p>
          {imageArchive ? imageArchive : null}
        </div>
      </div>
    </div>
  );
};

export default App;
