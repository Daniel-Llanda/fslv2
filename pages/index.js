import { Box, Button, Heading, ChakraProvider, VStack, Text } from "@chakra-ui/react"
import Link from "next/link"

export default function Home() {
  return (
    <ChakraProvider>
      <Box
        bgGradient="linear(to-br, #E0F7FA, #B2EBF2)"
        minH="100vh"
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        color="#023047"
        textAlign="center"
        px={4}
        fontFamily="Inter, sans-serif"
      >
        <VStack spacing={6}>
          <Heading as="h1" size="2xl" color="#0077B6">
            Filipino Sign Language
          </Heading>

          {/* Vertical buttons */}
          <VStack spacing={4} mt={6} width="220px">
            <Link href="/alpabeto">
              <Button
                colorScheme="blue"
                size="lg"
                borderRadius="md"
                boxShadow="md"
                _hover={{ transform: "scale(1.05)", boxShadow: "lg" }}
                width="100%"
              >
                Alpabeto
              </Button>
            </Link>

            <Link href="/numero">
              <Button
                colorScheme="teal"
                size="lg"
                borderRadius="md"
                boxShadow="md"
                _hover={{ transform: "scale(1.05)", boxShadow: "lg" }}
                width="100%"
              >
                Numero
              </Button>
            </Link>

            <Link href="/pamilya">
              <Button
                colorScheme="orange"
                size="lg"
                borderRadius="md"
                boxShadow="md"
                _hover={{ transform: "scale(1.05)", boxShadow: "lg" }}
                width="100%"
              >
                Pamilya
              </Button>
            </Link>

            <Link href="/tagasalin">
              <Button
                colorScheme="purple"
                size="lg"
                borderRadius="md"
                boxShadow="md"
                _hover={{ transform: "scale(1.05)", boxShadow: "lg" }}
                width="100%"
              >
                Tagasalin
              </Button>
            </Link>

            <Link href="/pagsusulit">
              <Button
                colorScheme="pink"
                size="lg"
                borderRadius="md"
                boxShadow="md"
                _hover={{ transform: "scale(1.05)", boxShadow: "lg" }}
                width="100%"
              >
                Pagsusulit
              </Button>
            </Link>
          </VStack>
        </VStack>
      </Box>
    </ChakraProvider>
  )
}
