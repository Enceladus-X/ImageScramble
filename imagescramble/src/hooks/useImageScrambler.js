import { useState, useRef } from 'react';
import { processImage } from '../utils/imageProcessing';

export const useImageScrambler = () => {
  const [imageSrc, setImageSrc] = useState(null);
  const [processedImageSrc, setProcessedImageSrc] = useState(null);
  const [seed, setSeed] = useState('');
  const [showDownload, setShowDownload] = useState(false);
  const canvasRef = useRef(null);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImageSrc(e.target.result);
        setProcessedImageSrc(null);
        setShowDownload(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const scrambleImage = () => {
    if (!imageSrc || !seed) return;

    const image = new Image();
    image.src = imageSrc;
    image.onload = () => {
      const result = processImage(canvasRef.current, image, seed, true);
      setProcessedImageSrc(result);
      setShowDownload(true);
    };
  };

  const decryptImage = () => {
    if (!imageSrc || !seed) return;

    const image = new Image();
    image.src = imageSrc;
    image.onload = () => {
      const result = processImage(canvasRef.current, image, seed, false);
      setProcessedImageSrc(result);
      setShowDownload(true);
    };
  };

  const handleReset = () => {
    setProcessedImageSrc(null);
    setShowDownload(false);
  };

  return {
    imageSrc,
    processedImageSrc,
    seed,
    showDownload,
    canvasRef,
    setSeed,
    handleImageUpload,
    scrambleImage,
    decryptImage,
    handleReset
  };
}; 