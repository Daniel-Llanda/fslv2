import { Box, Heading, ChakraProvider } from "@chakra-ui/react"
import Link from "next/link"
import { Button } from "@chakra-ui/react"

export default function Alpabeto() {
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
                <Heading>Alpabeto</Heading>
                <Link href="/">
                    <Button mt={8} colorScheme="gray">
                        Back
                    </Button>
                </Link>
            </Box>
        </ChakraProvider>
    )
}
