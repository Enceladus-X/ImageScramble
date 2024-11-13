import { Button, HStack, VStack } from '@chakra-ui/react';

export const ActionButtons = ({
  showDownload,
  seed,
  imageSrc,
  scrambleImage,
  decryptImage,
  downloadImage,
  handleReset
}) => {
  return (
    <VStack spacing={4} justify="center" mt={4}>
      {!showDownload && (
        <HStack spacing={4}>
          <Button
            colorScheme="blue"
            onClick={scrambleImage}
            isDisabled={!imageSrc || !seed}
          >
            Scramble
          </Button>
          
          <Button
            colorScheme="green"
            onClick={decryptImage}
            isDisabled={!imageSrc || !seed}
          >
            Decrypt
          </Button>
        </HStack>
      )}

      {showDownload && (
        <HStack spacing={4}>
          <Button 
            colorScheme="purple"
            onClick={downloadImage}
          >
            Download
          </Button>

          <Button 
            colorScheme="gray"
            onClick={handleReset}
          >
            Reset
          </Button>
        </HStack>
      )}
    </VStack>
  );
}; 