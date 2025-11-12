import { useEffect, useMemo, useState } from "react"
import { Box, Heading, ChakraProvider, Button, VStack, Text, Progress, HStack, Badge, Tooltip } from "@chakra-ui/react"
import Link from "next/link"

function LevelButton({ enabled, href, colorScheme, children }) {
  const btn = (
    <Button colorScheme={colorScheme} w="200px" isDisabled={!enabled}>
      {children}
    </Button>
  )
  // Only wrap with Link when enabled; disabled buttons should not navigate
  return enabled ? <Link href={href}>{btn}</Link> : btn
}

export default function Pagsusulit() {
  const [progress, setProgress] = useState(0)
  const [level, setLevel] = useState("")
  const [status, setStatus] = useState("none") // none | easy | medium | hard

  useEffect(() => {
    if (typeof window === "undefined") return

    const safeParse = (s) => { try { return s ? JSON.parse(s) : null } catch { return s } }

    const result = safeParse(window.localStorage.getItem("result")) // may be plain or JSON-stringified

    const finishedEasy   = safeParse(window.localStorage.getItem("finished_easy"))
    const finishedMedium = safeParse(window.localStorage.getItem("finished_medium"))
    const finishedHard   = safeParse(window.localStorage.getItem("finished_hard"))

    const easyDone   = result === "finished_easy"   || finishedEasy?.value === true
    const mediumDone = result === "finished_medium" || finishedMedium?.value === true
    const hardDone   = result === "finished_hard"   || finishedHard?.value === true

    // decide status (prefer the highest achieved)
    if (hardDone) {
      setStatus("hard")
      setProgress(100); setLevel("Expert")
    } else if (mediumDone) {
      setStatus("medium")
      setProgress(66); setLevel("Intermediate")
    } else if (easyDone) {
      setStatus("easy")
      setProgress(33); setLevel("Beginner")
    } else {
      setStatus("none")
      setProgress(0); setLevel("")
    }
  }, [])

  // Lock logic per your rules
  const { canEasy, canMedium, canHard } = useMemo(() => {
    switch (status) {
      case "hard":   return { canEasy: true,  canMedium: true,  canHard: true  }
      case "medium": return { canEasy: false, canMedium: false, canHard: true  }
      case "easy":   return { canEasy: false, canMedium: true,  canHard: false }
      default:       return { canEasy: true,  canMedium: false, canHard: false } // none
    }
  }, [status])

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
        w="100%"
      >
        <Heading mb={6}>Pagsusulit</Heading>

        {/* Progress section */}
        <Box w="min(520px, 92vw)" mb={8}>
          <HStack justify="space-between" mb={2}>
            <Text fontWeight="semibold">Progress</Text>
            <HStack spacing={3}>
              {level ? <Badge colorScheme="teal">{level}</Badge> : null}
              <Text fontSize="sm" color="gray.600">{progress}%</Text>
            </HStack>
          </HStack>
          <Progress value={progress} size="lg" borderRadius="full" />
          {!level && (
            <Text mt={2} fontSize="sm" color="gray.600">
              Finish Easy (33%), then Medium (66%), then Hard (100%).
            </Text>
          )}
        </Box>

        <VStack spacing={4}>
          <Tooltip label={canEasy ? "" : (status === "none" ? "" : "Locked")} isDisabled={canEasy}>
            <span><LevelButton enabled={canEasy} href="/pagsusulit/easy" colorScheme="teal">Easy</LevelButton></span>
          </Tooltip>

          <Tooltip label={canMedium ? "" : "Locked — complete Easy first"} isDisabled={canMedium}>
            <span><LevelButton enabled={canMedium} href="/pagsusulit/medium" colorScheme="orange">Medium</LevelButton></span>
          </Tooltip>

          <Tooltip label={canHard ? "" : "Locked — complete Medium first"} isDisabled={canHard}>
            <span><LevelButton enabled={canHard} href="/pagsusulit/hard" colorScheme="red">Hard</LevelButton></span>
          </Tooltip>
        </VStack>

        <Link href="/">
          <Button mt={8} colorScheme="gray">
            Back
          </Button>
        </Link>
      </Box>
    </ChakraProvider>
  )
}
