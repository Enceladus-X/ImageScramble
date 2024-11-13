import React, { useState, useRef } from 'react';
import { ChakraProvider, Box, Button, Input, Text, Image, Flex, Container, VStack, HStack, Heading } from '@chakra-ui/react';

export default function App() {
  const [imageSrc, setImageSrc] = useState(null);  // 업로드된 이미지 소스
  const [processedImageSrc, setProcessedImageSrc] = useState(null);  // 이 줄 추가
  const [seed, setSeed] = useState('');  // 시드 값
  const canvasRef = useRef(null);  // 이미지가 그려질 캔버스

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onloadend = () => {
      setImageSrc(reader.result);  // 이미지 소스를 상태에 저장
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
    if (!imageSrc || !seed) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
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
      setProcessedImageSrc(canvas.toDataURL());
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
    if (!imageSrc || !seed) {
      console.log('입력값 확인:', { imageSrc: !!imageSrc, seed: !!seed });
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    const image = document.createElement('img');
    image.src = imageSrc;

    console.log('복호화 시작');

    image.onload = () => {
      canvas.width = image.width;
      canvas.height = image.height;
      ctx.drawImage(image, 0, 0);

      const { width, height } = canvas;
      const cols = 8;
      const rows = 8;
      const pieceWidth = Math.floor(width / cols);
      const pieceHeight = Math.floor(height / rows);

      let imagePieces = [];
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const piece = ctx.getImageData(col * pieceWidth, row * pieceHeight, pieceWidth, pieceHeight);
          imagePieces.push(piece);
        }
      }

      const seedValue = parseInt(seed);
      const random = seededRandom(seedValue);
      let indices = Array.from({ length: rows * cols }, (_, i) => i);
      
      for (let i = indices.length - 1; i > 0; i--) {
        const j = Math.floor(random() * (i + 1));
        [indices[i], indices[j]] = [indices[j], indices[i]];
      }

      ctx.clearRect(0, 0, width, height);
      imagePieces.forEach((piece, currentIndex) => {
        const newPos = indices[currentIndex];
        const col = newPos % cols;
        const row = Math.floor(newPos / cols);
        ctx.putImageData(piece, col * pieceWidth, row * pieceHeight);
      });

      const result = canvas.toDataURL();
      console.log('복호화 완료, 이미지 데이터 생성됨');
      setProcessedImageSrc(result);
    };
  };

  return (
    <ChakraProvider>
      <Container maxW="container.xl" centerContent>
        <VStack spacing={8}>
          <Heading>Image Scrambler</Heading>
          
          <Flex gap={8}>
            {/* 왼쪽 박스 - 이미지 업로드 */}
            <Box
              w="500px"
              h="300px"
              border="2px dashed"
              borderColor="gray.300"
              borderRadius="lg"
              display="flex"
              alignItems="center"
              justifyContent="center"
              position="relative"
            >
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
              <VStack>
                <Text>이미지를 업로드하세요</Text>
                {imageSrc && <Image src={imageSrc} alt="Preview" maxH="250px" />}
              </VStack>
            </Box>

            {/* 오른쪽 박스 - 처리된 이미지 */}
            <Box
              w="500px"
              h="300px"
              border="2px dashed"
              borderColor="gray.300"
              borderRadius="lg"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              {processedImageSrc ? (
                <Image src={processedImageSrc} alt="Processed" maxH="250px" />
              ) : (
                <Text>처리된 이미지가 여기에 표시됩니다</Text>
              )}
            </Box>
          </Flex>

          <Input
            placeholder="시드값을 입력하세요"
            value={seed}
            onChange={(e) => setSeed(e.target.value)}
            w="300px"
          />

          <HStack spacing={4}>
            <Button
              colorScheme="teal"
              onClick={scrambleImage}
              isDisabled={!seed || !imageSrc}
            >
              이미지 암호화
            </Button>

            <Button
              colorScheme="green"
              onClick={decryptImage}
              isDisabled={!seed || !imageSrc}
            >
              이미지 복호화
            </Button>

            <Button
              colorScheme="blue"
              onClick={downloadImage}
              isDisabled={!processedImageSrc}
            >
              이미지 다운로드
            </Button>
          </HStack>

          <canvas ref={canvasRef} style={{ display: 'none' }} />
        </VStack>
      </Container>
    </ChakraProvider>
  );
}