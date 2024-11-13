import React, { useState, useRef } from 'react';
import { ChakraProvider, Box, Button, Input, Text, Image, Flex, Container, VStack, HStack, Heading, Select } from '@chakra-ui/react';

export default function App() {
  const [imageSrc, setImageSrc] = useState(null);  // 업로드된 이미지 소스
  const [processedImageSrc, setProcessedImageSrc] = useState(null);  // 이 줄 추가
  const [seed, setSeed] = useState('');  // 시드 값
  const canvasRef = useRef(null);  // 이미지가 그려질 캔버스
  const [showDownload, setShowDownload] = useState(false);  // 다운로드 버튼 표시 여부

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImageSrc(e.target.result);
        setProcessedImageSrc(null);
        setShowDownload(false);  // 새 이미지 업로드 시 다운로드 버튼 숨기기
      };
      reader.readAsDataURL(file);
    }
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
    if (!imageSrc || !seed) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    const image = document.createElement('img');
    image.src = imageSrc;

    image.onload = () => {
      canvas.width = image.width;
      canvas.height = image.height;
      ctx.drawImage(image, 0, 0);

      const { width, height } = canvas;
      const cols = 8;
      const rows = 8;
      const pieceWidth = Math.floor(width / cols);
      const pieceHeight = Math.floor(height / rows);

      const pieces = [];
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          pieces.push({ x, y });
        }
      }

      const seedValue = stringToSeed(seed.toString());
      const random = seededRandom(seedValue);
      shuffleArray(pieces, random);

      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = width;
      tempCanvas.height = height;
      const tempCtx = tempCanvas.getContext('2d');

      pieces.forEach((piece, i) => {
        const targetX = (i % cols) * pieceWidth;
        const targetY = Math.floor(i / cols) * pieceHeight;
        tempCtx.drawImage(
          canvas,
          piece.x * pieceWidth, piece.y * pieceHeight,
          pieceWidth, pieceHeight,
          targetX, targetY,
          pieceWidth, pieceHeight
        );
      });

      ctx.drawImage(tempCanvas, 0, 0);
      setProcessedImageSrc(canvas.toDataURL());
      setShowDownload(true);
    };
  };

  const decryptImage = () => {
    if (!imageSrc || !seed) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    const image = document.createElement('img');
    image.src = imageSrc;

    image.onload = () => {
      canvas.width = image.width;
      canvas.height = image.height;
      ctx.drawImage(image, 0, 0);

      const { width, height } = canvas;
      const cols = 8;
      const rows = 8;
      const pieceWidth = Math.floor(width / cols);
      const pieceHeight = Math.floor(height / rows);

      const pieces = [];
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          pieces.push({ x, y });
        }
      }

      const seedValue = stringToSeed(seed.toString());
      const random = seededRandom(seedValue);
      shuffleArray(pieces, random);

      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = width;
      tempCanvas.height = height;
      const tempCtx = tempCanvas.getContext('2d');

      pieces.forEach((piece, i) => {
        const sourceX = (i % cols) * pieceWidth;
        const sourceY = Math.floor(i / cols) * pieceHeight;
        tempCtx.drawImage(
          canvas,
          sourceX, sourceY,
          pieceWidth, pieceHeight,
          piece.x * pieceWidth, piece.y * pieceHeight,
          pieceWidth, pieceHeight
        );
      });

      ctx.drawImage(tempCanvas, 0, 0);
      setProcessedImageSrc(canvas.toDataURL());
      setShowDownload(true);
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

  // 문자열을 숫자 시드값으로 변환하는 함수
  const stringToSeed = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash); // 양수값 반환
  };

  // 시드 값 입력 처리 (자연수만 허용)
  const handleSeedChange = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, '');  // 자연수만 입력 허용
    setSeed(value);
  };

  const downloadImage = () => {
    if (!processedImageSrc) return;
    
    const now = new Date();
    const date = now.toISOString().split('T')[0].slice(-8).replace(/-/g, '');
    const time = now.toTimeString().slice(0, 8).replace(/:/g, '');

    const type = processedImageSrc === imageSrc ? 'restored' : 'scrambled';
    const fileName = `${type}_seed_${seed}_${date}_${time}.png`;
    
    const link = document.createElement('a');
    link.href = processedImageSrc;
    link.download = fileName;
    link.click();
  };

  // 다시 생성 함수 추가
  const handleReset = () => {
    setProcessedImageSrc(null);
    setShowDownload(false);
  };

  return (
    <ChakraProvider>
      <Container maxW="container.xl" centerContent>
        <VStack spacing={6}>
          <Heading>Image Scrambler</Heading>
          
          {/* 단일 이미지 컨테이너 */}
          <Box
            w="500px"
            h="400px"
            border="2px dashed"
            borderColor="gray.300"
            borderRadius="lg"
            display="flex"
            alignItems="center"
            justifyContent="center"
            position="relative"
            overflow="hidden"
            bg="gray.50"
          >
            {!imageSrc && !processedImageSrc ? (
              <>
                <Input
                  type="file"
                  height="100%"
                  width="100%"
                  position="absolute"
                  top="0"
                  left="0"
                  opacity="0"
                  aria-hidden="true"
                  accept="image/*"
                  onChange={handleImageUpload}
                />
                <VStack spacing={2}>
                  <Text fontSize="lg" color="gray.500">Upload Image</Text>
                  <Text fontSize="sm" color="gray.400">Click or Drag & Drop</Text>
                </VStack>
              </>
            ) : (
              <Box position="relative" width="100%" height="100%">
                <Image
                  src={processedImageSrc || imageSrc}
                  alt="Image"
                  objectFit="contain"
                  width="100%"
                  height="100%"
                  transition="all 0.3s"
                />
                <Input
                  type="file"
                  height="100%"
                  width="100%"
                  position="absolute"
                  top="0"
                  left="0"
                  opacity="0"
                  aria-hidden="true"
                  accept="image/*"
                  onChange={handleImageUpload}
                  cursor="pointer"
                />
              </Box>
            )}
          </Box>

          <Input
            placeholder="Enter seed (text or number)"
            value={seed}
            onChange={(e) => setSeed(e.target.value)}
            w="300px"
            size="lg"
            borderRadius="full"
          />

          <HStack spacing={4}>
            {!showDownload ? (
              <>
                <Button
                  colorScheme="teal"
                  onClick={scrambleImage}
                  isDisabled={!seed || !imageSrc}
                  size="lg"
                  borderRadius="full"
                  px={8}
                >
                  Scramble
                </Button>

                <Button
                  colorScheme="green"
                  onClick={decryptImage}
                  isDisabled={!seed || !imageSrc}
                  size="lg"
                  borderRadius="full"
                  px={8}
                >
                  Restore
                </Button>
              </>
            ) : (
              <>
                <Button
                  colorScheme="blue"
                  onClick={downloadImage}
                  size="lg"
                  borderRadius="full"
                  px={8}
                >
                  Download
                </Button>

                <Button
                  colorScheme="gray"
                  onClick={handleReset}
                  size="lg"
                  borderRadius="full"
                  px={8}
                >
                  Try Again
                </Button>
              </>
            )}
          </HStack>

          <canvas ref={canvasRef} style={{ display: 'none' }} />
        </VStack>
      </Container>
    </ChakraProvider>
  );
}