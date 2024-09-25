import { ChakraProvider, Box, Button, Slider, SliderTrack, SliderFilledTrack, SliderThumb, Input, Image, Text, Flex } from "@chakra-ui/react";
import { useState } from "react";

export default function App() {
  const [imageSrc, setImageSrc] = useState(null);
  const [seed, setSeed] = useState("");
  const [pieces, setPieces] = useState(1); // 최소 1조각으로 설정

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onloadend = () => {
      setImageSrc(reader.result);
    };
    reader.readAsDataURL(file);
  };

  return (
    <ChakraProvider>
      {/* 전체 레이아웃을 중앙에 배치 */}
      <Flex
        height="100vh"
        justifyContent="center"
        alignItems="center"
        bg="gray.50"
      >
        <Box p={5} textAlign="center" maxW="500px" w="100%">
          {/* 이미지 업로드 버튼 */}
          <Box mb={6}>
            <Input type="file" onChange={handleImageUpload} display="none" id="file-input" />
            <Button 
              as="label" 
              htmlFor="file-input" 
              size="lg" 
              mb={4} 
              width="100%" 
              height="300px" // 이미지 버튼 크기 조정
              fontSize="2xl" 
              border="2px dashed #ccc"
              _hover={{ borderColor: "teal.500" }}
            >
              {imageSrc ? <Image src={imageSrc} boxSize="100%" objectFit="contain" /> : "Upload Image"}
            </Button>
          </Box>

          {/* 시드 입력 필드 */}
          <Input
            placeholder="Enter Seed"
            value={seed}
            onChange={(e) => setSeed(e.target.value)}
            mb={4}
            width="100%"
          />

          {/* 변환 시작 버튼 */}
          <Button colorScheme="teal" size="lg" mb={6} width="100%">
            Start Transformation
          </Button>

          {/* 슬라이더: 조각 수 설정 */}
          <Box mt={4}>
            <Text fontSize="lg" mb={2}>
              Number of Pieces: {pieces}
            </Text>
            <Slider 
              aria-label="slider-ex-1" 
              defaultValue={1} 
              min={1} 
              max={10} 
              step={1}
              onChange={(val) => setPieces(val)}
            >
              <SliderTrack>
                <SliderFilledTrack />
              </SliderTrack>
              <SliderThumb />
            </Slider>
          </Box>
        </Box>
      </Flex>
    </ChakraProvider>
  );
}
