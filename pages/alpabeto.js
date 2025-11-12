import { useState } from "react"
import {
  Box,
  Heading,
  ChakraProvider,
  Button,
  SimpleGrid,
  Text,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
} from "@chakra-ui/react"
import Link from "next/link"

export default function Alpabeto() {
  const alphabet = Array.from({ length: 26 }, (_, i) => String.fromCharCode(i + 65)) // ['A', 'B', 'C', ..., 'Z']
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [selectedVideo, setSelectedVideo] = useState(null)

  const handleVideoClick = (letter) => {
    setSelectedVideo(`/video/alphabets/${letter}.mp4`)
    onOpen()
  }

  return (
    <ChakraProvider>
      <Box
        bgGradient="linear(to-br, #E0F7FA, #B2EBF2)"
        minH="100vh"
        px={4}
        py={8}
        fontFamily="Inter, sans-serif"
      >
        <Heading textAlign="center" mb={8} color="#0077B6">
          Alpabeto
        </Heading>

        {/* Video Grid */}
        <SimpleGrid columns={{ base: 1}} spacing={6} justifyItems="center">
          {alphabet.map((letter) => (
            <Box key={letter} textAlign="center" cursor="pointer">
              <video
                width="500"
                height="500"
                style={{ borderRadius: "12px", backgroundColor: "#fff" }}
                onClick={() => handleVideoClick(letter)}
              >
                <source src={`/video/alphabets/${letter}.mp4`} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
              <Text mt={2} fontWeight="bold" fontSize="lg">
                {letter}
              </Text>
            </Box>
          ))}
        </SimpleGrid>

        {/* Back Button */}
        <Box textAlign="center" mt={8}>
          <Link href="/">
            <Button colorScheme="gray" size="md">
              Back
            </Button>
          </Link>
        </Box>

        {/* Modal for large video */}
        <Modal isOpen={isOpen} onClose={onClose} size="xl" isCentered>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Video Player</ModalHeader>
            <ModalCloseButton />
            <ModalBody display="flex" justifyContent="center" alignItems="center" pb={6}>
              {selectedVideo && (
                <video width="100%" controls autoPlay>
                  <source src={selectedVideo} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              )}
            </ModalBody>
          </ModalContent>
        </Modal>
      </Box>
    </ChakraProvider>
  )
}
