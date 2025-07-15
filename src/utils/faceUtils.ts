// src/utils/faceUtils.ts
import * as faceapi from 'face-api.js';

export const loadFaceModels = async () => {
  const MODEL_URL = '/models'; // Ensure this folder is served in public/
  await Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
    faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
    faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
  ]);
};

export const getFaceDescriptor = async (video: HTMLVideoElement) => {
  const detections = await faceapi
    .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
    .withFaceLandmarks()
    .withFaceDescriptor();

  return detections?.descriptor || null;
};

export const euclideanDistance = (desc1: Float32Array, desc2: Float32Array) => {
  return Math.sqrt(desc1.reduce((sum, val, i) => sum + Math.pow(val - desc2[i], 2), 0));
};
