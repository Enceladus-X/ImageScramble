import { Box, Input, VStack, Text, Image } from '@chakra-ui/react';

export const ImageContainer = ({ imageSrc, processedImageSrc, handleImageUpload }) => {
  return (
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
  );
}; 