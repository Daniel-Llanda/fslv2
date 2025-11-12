import React, { useRef, useState, useEffect } from "react"
import * as tf from "@tensorflow/tfjs"
import * as handpose from "@tensorflow-models/handpose"
import Webcam from "react-webcam"
import { drawHand } from "../../components/handposeutil"
import * as fp from "fingerpose"
import Handsigns from "../../components/handsigns"

import {
  Text,
  Heading,
  Button,
  Stack,
  Container,
  Box,
  VStack,
  ChakraProvider,
} from "@chakra-ui/react"

import { Signpass } from "../../components/handimage"
import Metatags from "../../components/metatags"
import { RiCameraFill, RiCameraOffFill } from "react-icons/ri"

// --- localStorage helper ---
const storage = {
  set(key, value) {
    try {
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch (err) {
      console.error("localStorage set failed:", err)
    }
  },
  get(key, fallback = null) {
    try {
      const v = window.localStorage.getItem(key)
      return v ? JSON.parse(v) : fallback
    } catch (err) {
      console.error("localStorage get failed:", err)
      return fallback
    }
  },
  remove(key) {
    try {
      window.localStorage.removeItem(key)
    } catch (err) {
      console.error("localStorage remove failed:", err)
    }
  },
}

export default function Home() {
  const webcamRef = useRef(null)
  const canvasRef = useRef(null)

  const [camState, setCamState] = useState("on")
  const [tutorText, setTutorText] = useState("")
  const [finished, setFinished] = useState(false)
  const [introOpen, setIntroOpen] = useState(true)

  // display helpers (trigger re-renders)
  const [targetLetter, setTargetLetter] = useState("")     // what user must do next (for re-render)
  const [detectedLetter, setDetectedLetter] = useState("") // what model currently sees (debug)

  // ---------- Stage/level state ----------
  // 5-letter words for Medium
  const STAGES = useRef(["WATER", "HOUSE", "SMILE", "LIGHT", "BREAD"])
  const stageIndexRef = useRef(0)        // which word we are on
  const signListRef = useRef([])         // letters (as signs) of current word
  const currentSignRef = useRef(0)       // index inside current word
  const gamestateRef = useRef("started") // started | played | finished
  const intervalRef = useRef(null)

  async function runHandpose() {
    const net = await handpose.load()
    loadStage(0) // prepare first stage; wait for thumbs up to "play"
    intervalRef.current = setInterval(() => {
      detect(net)
    }, 150)
  }

  // Build the sign list for a word (e.g., "water" -> ['w','a','t','e','r'] signs)
  function generateSignsForWord(word) {
    const letters = word.toLowerCase().split("")
    const signs = letters
      .map((letter) => Signpass.find((s) => s.alt.toLowerCase() === letter))
      .filter(Boolean)
    return signs
  }

  function loadStage(index) {
    stageIndexRef.current = index
    signListRef.current = generateSignsForWord(STAGES.current[index])
    currentSignRef.current = 0

    // prime first required letter for display
    const first = signListRef.current[0]
    setTargetLetter(first ? first.alt.toUpperCase() : "")

    setTutorText(
      `Stage ${index + 1}/${STAGES.current.length}: Make the hand signs for "${STAGES.current[index]}"`
    )
  }

  function advanceStageOrFinish() {
    const nextIndex = stageIndexRef.current + 1
    if (nextIndex < STAGES.current.length) {
      loadStage(nextIndex)
    } else {
      gamestateRef.current = "finished"
      setTutorText("✅ Task complete!")
      setFinished(true)

      // Safely get the current result
      let currentResult = window.localStorage.getItem("result")
      try {
        currentResult = JSON.parse(currentResult)
      } catch {
        // plain text; ignore
      }

      // Only update if not already finished_hard
      if (currentResult !== "finished_hard") {
        storage.set("result", "finished_medium")
      }

      // stop polling to save CPU
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }

  async function detect(net) {
    if (
      typeof webcamRef.current !== "undefined" &&
      webcamRef.current !== null &&
      webcamRef.current.video &&
      webcamRef.current.video.readyState === 4
    ) {
      const video = webcamRef.current.video
      const videoWidth = webcamRef.current.video.videoWidth
      const videoHeight = webcamRef.current.video.videoHeight

      webcamRef.current.video.width = videoWidth
      webcamRef.current.video.height = videoHeight
      canvasRef.current.width = videoWidth
      canvasRef.current.height = videoHeight

      const hand = await net.estimateHands(video)

      if (hand.length > 0) {
        const GE = new fp.GestureEstimator([
          fp.Gestures.ThumbsUpGesture,
          Handsigns.aSign, Handsigns.bSign, Handsigns.cSign, Handsigns.dSign, Handsigns.eSign,
          Handsigns.fSign, Handsigns.gSign, Handsigns.hSign, Handsigns.iSign, Handsigns.jSign,
          Handsigns.kSign, Handsigns.lSign, Handsigns.mSign, Handsigns.nSign, Handsigns.oSign,
          Handsigns.pSign, Handsigns.qSign, Handsigns.rSign, Handsigns.sSign, Handsigns.tSign,
          Handsigns.uSign, Handsigns.vSign, Handsigns.wSign, Handsigns.xSign, Handsigns.ySign,
          Handsigns.zSign,
        ])

        const estimatedGestures = await GE.estimate(hand[0].landmarks, 6.5)

        if (gamestateRef.current === "started") {
          const title = document.querySelector("#app-title")
          if (title) title.innerText = "Make a 👍 gesture with your hand to start"
        }

        if (
          estimatedGestures.gestures !== undefined &&
          estimatedGestures.gestures.length > 0
        ) {
          const confidence = estimatedGestures.gestures.map((p) => p.confidence)
          const maxConfidence = confidence.indexOf(Math.max(...confidence))
          const detected = estimatedGestures.gestures[maxConfidence].name

          // Start with thumbs up
          if (detected === "thumbs_up" && gamestateRef.current !== "played") {
            gamestateRef.current = "played"
            currentSignRef.current = 0
            setTutorText(
              `Stage ${
                stageIndexRef.current + 1
              }/${STAGES.current.length}: Make the hand signs for "${
                STAGES.current[stageIndexRef.current]
              }"`
            )
          } else if (gamestateRef.current === "played") {
            const title = document.querySelector("#app-title")
            if (title) title.innerText = ""

            // Finished this word?
            if (currentSignRef.current === signListRef.current.length) {
              advanceStageOrFinish()
              return
            }

            // Get current required letter object
            const current = signListRef.current[currentSignRef.current]
            if (current) {
              // Always show the required/current letter to force re-render
              setTargetLetter(current.alt.toUpperCase())
              // Optional: show what model detected (debug)
              setDetectedLetter(detected.toUpperCase())

              // If user did the correct letter, advance
              if (current.alt.toLowerCase() === detected.toLowerCase()) {
                currentSignRef.current += 1

                // If that completed the word, move on right away
                if (currentSignRef.current === signListRef.current.length) {
                  advanceStageOrFinish()
                  return
                }

                // Update next required letter after increment
                const next = signListRef.current[currentSignRef.current]
                setTargetLetter(next ? next.alt.toUpperCase() : "")
              }
            }
          }
        }
      }

      // Draw the hand lines
      const ctx = canvasRef.current.getContext("2d")
      drawHand(hand, ctx)
    }
  }

  const startGame = async () => {
    setIntroOpen(false)
    setTutorText("Loading model…")
    await runHandpose()
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

  function turnOffCamera() {
    setCamState((prev) => (prev === "on" ? "off" : "on"))
  }

  // Helper to render the whole word with per-letter coloring
  const renderWordProgress = () => {
    const word = STAGES.current[stageIndexRef.current] || ""
    const letters = word.toUpperCase().split("")
    const currentIdx = currentSignRef.current

    return (
      <Box display="flex" gap="8px" justifyContent="center" alignItems="center">
        {letters.map((ch, i) => {
          const isDone = i < currentIdx
          const isCurrent = i === currentIdx
          return (
            <Text
              key={`${ch}-${i}`}
              fontSize="6xl"
              fontWeight="bold"
              color={
                isDone
                  ? "green.300"        // completed letters
                  : isCurrent
                    ? "yellow.300"     // active letter
                    : "whiteAlpha.800" // pending
              }
              textDecoration={isCurrent ? "underline" : "none"}
            >
              {ch}
            </Text>
          )
        })}
      </Box>
    )
  }

  return (
    <ChakraProvider>
      <Metatags />
      <Box bgColor="#5784BA">
        <Container centerContent maxW="xl" height="100vh" pt="0" pb="0">
          <VStack spacing={4} align="center">
            <Box h="20px"></Box>
            <Heading
              as="h3"
              size="md"
              className="tutor-text"
              color="white"
              textAlign="center"
            >
              {tutorText}
            </Heading>
            <Box h="20px"></Box>
          </VStack>

          <Heading
            as="h1"
            size="lg"
            id="app-title"
            color="white"
            textAlign="center"
          >
            {introOpen ? "Welcome" : "Loading the Handsigns"}
          </Heading>

          <Box id="webcam-container" position="relative">
            {camState === "on" ? (
              <Webcam id="webcam" ref={webcamRef} />
            ) : (
              <div
                id="webcam"
                style={{ background: "black", width: 640, height: 480 }}
              />
            )}

            {/* Overlay that shows the REQUIRED word with per-letter progress */}
            {STAGES.current[stageIndexRef.current] && (
              <div
                style={{
                  position: "absolute",
                  marginLeft: "auto",
                  marginRight: "auto",
                  right: "calc(50% - 150px)",
                  bottom: 100,
                  textAlign: "center",
                  width: 300,
                }}
              >
                <Text color="white" fontSize="sm" mb={1}>
                  Do this word
                </Text>

                {renderWordProgress()}

                {/* Optional: tiny debug line for what’s currently detected */}
                <Text color="white" fontSize="xs" mt={2}>
                  Detected: {detectedLetter}
                </Text>
              </div>
            )}
          </Box>

          <canvas id="gesture-canvas" ref={canvasRef} />

          {/* Removed old "singmoji" / image UI—kept container in case you use it later */}
          <Box
            id="singmoji"
            style={{
              zIndex: 9,
              position: "fixed",
              top: "50px",
              right: "30px",
            }}
          ></Box>
        </Container>

        <Stack id="start-button" spacing={4} direction="row" align="center" p={4}>
          {/* <Button
            leftIcon={
              camState === "on" ? (
                <RiCameraFill size={20} />
              ) : (
                <RiCameraOffFill size={20} />
              )
            }
            onClick={turnOffCamera}
            colorScheme="blue"
          >
            Camera
          </Button> */}

          <Button
            colorScheme="gray"
            onClick={() => (window.location.href = "/pagsusulit")}
          >
            Back
          </Button>
        </Stack>

        {/* ---------- Intro / Instruction Modal (overlay, z-index 1000) ---------- */}
        {introOpen && (
          <Box
            position="fixed"
            top="0"
            left="0"
            w="100%"
            h="100%"
            bg="blackAlpha.700"
            display="flex"
            alignItems="center"
            justifyContent="center"
            zIndex={1000}
          >
            <Box
              bg="white"
              p={8}
              rounded="lg"
              textAlign="left"
              boxShadow="lg"
              maxW="lg"
            >
              <Heading size="lg" mb={4}>
                How to Play
              </Heading>
              <Text mb={3}>
                • This activity has {STAGES.current.length} stages of 5-letter
                words: {STAGES.current.join(" → ")}.
              </Text>
              <Text mb={3}>
                • When ready, make a <b>👍 thumbs up</b> to start a stage.
              </Text>
              <Text mb={3}>
                • Copy the hand signs for each letter of the current word.
              </Text>
              <Text mb={6}>• Finish all letters to move to the next stage.</Text>
              <Stack direction="row" justify="flex-end">
                <Button
                  variant="ghost"
                  onClick={() => (window.location.href = "/pagsusulit")}
                >
                  Cancel
                </Button>
                <Button colorScheme="blue" onClick={startGame}>
                  Start Game
                </Button>
              </Stack>
            </Box>
          </Box>
        )}

        {/* ---------- Completion Modal (overlay, z-index 1000) ---------- */}
        {finished && (
          <Box
            position="fixed"
            top="0"
            left="0"
            w="100%"
            h="100%"
            bg="blackAlpha.700"
            display="flex"
            alignItems="center"
            justifyContent="center"
            zIndex={1000}
          >
            <Box
              bg="white"
              p={10}
              rounded="lg"
              textAlign="center"
              boxShadow="lg"
            >
              <Heading size="lg" mb={4}>
                Task Completed
              </Heading>
              <Text mb={6}>
                All stages ({STAGES.current.join(" → ")}) are complete.
              </Text>
              <Button
                colorScheme="blue"
                onClick={() => (window.location.href = "/pagsusulit")}
              >
                Return
              </Button>
            </Box>
          </Box>
        )}
      </Box>
    </ChakraProvider>
  )
}
