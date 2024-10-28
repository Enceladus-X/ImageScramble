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
    const image = new Image();
    image.src = src;

    image.onload = () => {
      canvas.width = image.width;
      canvas.height = image.height;
      ctx.clearRect(0, 0, canvas.width, canvas.height);  // 캔버스 초기화
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);  // 이미지 표시
    };
  };

  const scrambleImage = () => {
    if (!imageSrc) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const image = new Image();
    image.src = imageSrc;

    image.onload = () => {
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

      setScrambledImageSrc(canvas.toDataURL());  // 섞인 이미지 저장
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

  return (
    <ChakraProvider>
      <Box textAlign="center" p={5}>
        <Text fontSize="xl" mb={4}>이미지를 업로드하거나 암호화된 이미지를 복호화하세요</Text>

        {/* 이미지 업로드 및 미리보기 박스 */}
        <Box
          border="2px dashed #ccc"
          borderRadius="md"
          width="400px"
          height="400px"
          mx="auto"
          mb={4}
          display="flex"
          alignItems="center"
          justifyContent="center"
          cursor="pointer"
          position="relative"
          onClick={() => document.getElementById('fileInput').click()}
        >
          {!imageSrc && !scrambledImageSrc && (
            <Text fontSize="lg" color="gray.500">이미지를 업로드하려면 클릭하세요</Text>
          )}
          {(imageSrc || scrambledImageSrc) && (
            <Image
              src={scrambledImageSrc || imageSrc}
              alt="Uploaded"
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

        {/* 시드 입력 필드 */}
        <Text fontSize="xl" mb={4}>시드 값을 입력하세요 (자연수)</Text>
        <Input
          placeholder="Seed 입력"
          value={seed}
          onChange={handleSeedChange}
          mb={4}
        />

        {/* 변환 및 복호화 버튼 */}
        <Button colorScheme="teal" onClick={scrambleImage} mb={4} isDisabled={!seed || !imageSrc}>
          이미지 암호화
        </Button>

        {scrambledImageSrc && (
          <Button colorScheme="blue" onClick={downloadImage} mb={4}>
            암호화된 이미지 다운로드
          </Button>
        )}

        <Button colorScheme="green" onClick={() => {}} mb={4} isDisabled={!scrambledImageSrc && !imageSrc}>
          이미지 복호화
        </Button>
      </Box>
    </ChakraProvider>
  );
}