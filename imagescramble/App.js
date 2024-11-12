import React, { useState, useRef } from 'react';
import { ChakraProvider, Box, Button, Input, Text, Image } from '@chakra-ui/react';

export default function App() {
  const [imageSrc, setImageSrc] = useState(null);  // 업로드된 이미지 소스
  const [scrambledImageSrc, setScrambledImageSrc] = useState(null);  // 암호화된 이미지 소스
  const [seed, setSeed] = useState('');  // 시드 값
  const canvasRef = useRef(null);  // 이미지가 그려질 캔버스

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onloadend = () => {
      setImageSrc(reader.result);  // 이미지 소스를 상태에 저장
      setScrambledImageSrc(null);  // 암호화된 이미지 초기화
      displayImageOnCanvas(reader.result);  // 캔버스에 이미지 표시
    };
    reader.readAsDataURL(file);
  };

  const displayImageOnCanvas = (src) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const image = new window.Image();
    image.src = src;

    image.onload = () => {
      canvas.width = image.width;
      canvas.height = image.height;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    };
  };

  const scrambleImage = () => {
    if (!imageSrc) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const image = new window.Image();
    image.src = imageSrc;

    image.onload = () => {
      canvas.width = image.width;
      canvas.height = image.height;
      const { width, height } = canvas;
      const cols = 8;
      const rows = 8;
      const pieceWidth = Math.floor(width / cols);
      const pieceHeight = Math.floor(height / rows);

      // 원본 이미지 그리기
      ctx.drawImage(image, 0, 0, width, height);

      // 이미지 조각 저장
      let imagePieces = [];
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const piece = ctx.getImageData(col * pieceWidth, row * pieceHeight, pieceWidth, pieceHeight);
          imagePieces.push({ piece, col, row });
        }
      }

      // 시드 기반으로 조각 섞기
      const seedValue = parseInt(seed) || 1;
      const random = seededRandom(seedValue);
      for (let i = imagePieces.length - 1; i > 0; i--) {
        const j = Math.floor(random() * (i + 1));
        [imagePieces[i], imagePieces[j]] = [imagePieces[j], imagePieces[i]];
      }

      // 섞인 조각을 다시 그리기
      ctx.clearRect(0, 0, width, height);
      imagePieces.forEach(({ piece }, index) => {
        const col = index % cols;
        const row = Math.floor(index / cols);
        ctx.putImageData(piece, col * pieceWidth, row * pieceHeight);
      });

      // 암호화된 이미지를 별도의 상태로 저장
      setScrambledImageSrc(canvas.toDataURL());
    };
  };

  // 시드 기반 난수 생성기
  const seededRandom = (seedValue) => {
    let seed = parseInt(seedValue, 10);
    let random = () => {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };
    return random;
  };

  // 시드 값 입력 처리 (자연수만 허용)
  const handleSeedChange = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, '');  // 자연수만 입력 허용
    setSeed(value);
  };

  const downloadImage = () => {
    const canvas = canvasRef.current;
    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    link.download = 'scrambled_image.png';
    link.click();
  };

  const decryptImage = () => {
    if (!scrambledImageSrc && !imageSrc) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const image = new Image();
    image.src = scrambledImageSrc || imageSrc;

    image.onload = () => {
      const { width, height } = canvas;
      const cols = 8;
      const rows = 8;
      const pieceWidth = Math.floor(width / cols);
      const pieceHeight = Math.floor(height / rows);

      // 현재 이미지 조각 저장
      let imagePieces = [];
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const piece = ctx.getImageData(col * pieceWidth, row * pieceHeight, pieceWidth, pieceHeight);
          imagePieces.push({ piece, originalIndex: row * cols + col });
        }
      }

      // 시드 기반으로 원래 위치 계산
      const seedValue = parseInt(seed) || 1;
      const random = seededRandom(seedValue);
      let indices = Array.from({ length: rows * cols }, (_, i) => i);
      
      // 암호화때 사용한 것과 동일한 셔플 과정 수행
      for (let i = indices.length - 1; i > 0; i--) {
        const j = Math.floor(random() * (i + 1));
        [indices[i], indices[j]] = [indices[j], indices[i]];
      }

      // 역매핑 생성
      let reverseIndices = Array(indices.length);
      indices.forEach((newPos, originalPos) => {
        reverseIndices[newPos] = originalPos;
      });

      // 조각들을 원래 위치로 복원
      ctx.clearRect(0, 0, width, height);
      imagePieces.forEach(({ piece }, currentIndex) => {
        const originalPos = reverseIndices[currentIndex];
        const col = originalPos % cols;
        const row = Math.floor(originalPos / cols);
        ctx.putImageData(piece, col * pieceWidth, row * pieceHeight);
      });

      setImageSrc(canvas.toDataURL());
      setScrambledImageSrc(null);
    };
  };

  return (
    <ChakraProvider>
      <Box textAlign="center" p={5}>
        <Text fontSize="xl" mb={4}>이미지를 업로드하거나 암호화된 이미지를 복호화하세요</Text>

        {/* 이미지 컨테이너를 나란히 배치 */}
        <Box display="flex" justifyContent="center" gap={8} mb={4}>
          {/* 원본 이미지 업로드 박스 */}
          <Box
            border="2px dashed #ccc"
            borderRadius="md"
            width="400px"
            height="400px"
            display="flex"
            alignItems="center"
            justifyContent="center"
            cursor="pointer"
            position="relative"
            onClick={() => document.getElementById('fileInput').click()}
          >
            {!imageSrc ? (
              <Text fontSize="lg" color="gray.500">이미지를 업로드하려면 클릭하세요</Text>
            ) : (
              <Image
                src={imageSrc}
                alt="Original"
                objectFit="contain"
                maxWidth="100%"
                maxHeight="100%"
              />
            )}
            <Input
              id="fileInput"
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              display="none"
            />
          </Box>

          {/* 암호화/복호화된 이미지 표시 박스 */}
          <Box
            border="2px dashed #ccc"
            borderRadius="md"
            width="400px"
            height="400px"
            display="flex"
            alignItems="center"
            justifyContent="center"
            position="relative"
          >
            {scrambledImageSrc ? (
              <Image
                src={scrambledImageSrc}
                alt="Scrambled"
                objectFit="contain"
                maxWidth="100%"
                maxHeight="100%"
              />
            ) : (
              <Text fontSize="lg" color="gray.500">암호화된 이미지가 여기에 표시됩니다</Text>
            )}
          </Box>
        </Box>

        {/* 숨겨진 캔버스 */}
        <canvas
          ref={canvasRef}
          style={{ display: 'none' }}
        />

        {/* 컨트롤 패널 */}
        <Box maxWidth="800px" mx="auto">
          <Text fontSize="xl" mb={4}>시드 값을 입력하세요 (자연수)</Text>
          <Input
            placeholder="Seed 입력"
            value={seed}
            onChange={handleSeedChange}
            mb={4}
            maxWidth="400px"
          />

          <Box display="flex" justifyContent="center" gap={4}>
            <Button 
              colorScheme="teal" 
              onClick={scrambleImage} 
              isDisabled={!seed || !imageSrc}
            >
              이미지 암호화
            </Button>

            {imageSrc && (
              <Button colorScheme="blue" onClick={downloadImage}>
                이미지 다운로드
              </Button>
            )}

            <Button 
              colorScheme="green" 
              onClick={decryptImage} 
              isDisabled={!seed || !imageSrc}
            >
              이미지 복호화
            </Button>
          </Box>
        </Box>
      </Box>
    </ChakraProvider>
  );
}