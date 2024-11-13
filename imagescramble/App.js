import { ChakraProvider } from '@chakra-ui/react'
import { Container, VStack, Heading } from '@chakra-ui/react';
import { ImageContainer } from './src/components/ImageContainer';
import { SeedInput } from './src/components/SeedInput';
import { ActionButtons } from './src/components/ActionButtons';
import { useImageScrambler } from './src/hooks/useImageScrambler';

export default function App() {
  const {
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
  } = useImageScrambler();

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

  return (
    <ChakraProvider>
      <Container maxW="container.xl" centerContent>
        <VStack spacing={6}>
          <Heading>Image Scrambler</Heading>
          
          <ImageContainer
            imageSrc={imageSrc}
            processedImageSrc={processedImageSrc}
            handleImageUpload={handleImageUpload}
          />

          <SeedInput seed={seed} setSeed={setSeed} />

          <ActionButtons
            showDownload={showDownload}
            seed={seed}
            imageSrc={imageSrc}
            scrambleImage={scrambleImage}
            decryptImage={decryptImage}
            downloadImage={downloadImage}
            handleReset={handleReset}
          />

          <canvas ref={canvasRef} style={{ display: 'none' }} />
        </VStack>
      </Container>
    </ChakraProvider>
  );
}