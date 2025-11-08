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

export default function Pamilya() {
  const videos = [
    "AUNT",
    "BABY",
    "BROTHER-IN-LAW",
    "BROTHER",
    "COUSIN",
    "DAUGHTER",
    "FAMILY",
    "FATHER",
    "GRAND-FATHER",
    "GRAND-MOTHER",
    "HUSBAND",
    "MOTHER",
    "NEPHEW",
    "NIECE",
    "NINANG",
    "NINONG",
    "RELATIVE",
    "SISTER-IN-LAW",
    "SISTER",
    "SON",
    "UNCLE",
    "WIFE"
  ]

  const { isOpen, onOpen, onClose } = useDisclosure()
  const [selectedVideo, setSelectedVideo] = useState(null)

  const handleVideoClick = (name) => {
    setSelectedVideo(`/video/pamilya/${name}.mov`)
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
          Pamilya
        </Heading>

        {/* Video Grid */}
        <SimpleGrid columns={{ base: 1}} spacing={6} justifyItems="center">
          {videos.map((name) => (
            <Box key={name} textAlign="center" cursor="pointer">
              <video
                width="500"
                height="500"
                style={{ borderRadius: "12px", backgroundColor: "#fff" }}
                onClick={() => handleVideoClick(name)}
              >
                <source src={`/video/pamilya/${name}.mov`} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
              <Text mt={2} fontWeight="bold" fontSize="lg">
                {name}
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
