import { Input } from '@chakra-ui/react';

export const SeedInput = ({ seed, setSeed }) => {
  return (
    <Input
      placeholder="Enter seed (text or number)"
      value={seed}
      onChange={(e) => setSeed(e.target.value)}
      w="300px"
      size="lg"
      borderRadius="full"
    />
  );
}; 