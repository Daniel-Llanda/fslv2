import React, { useRef, useState, useEffect } from "react"
import * as tf from "@tensorflow/tfjs"
import * as handpose from "@tensorflow-models/handpose"
import Webcam from "react-webcam"
import { drawHand } from "../components/handposeutil"
import * as fp from "fingerpose"
import Handsigns from "../components/handsigns"

import {
  Text,
  Heading,
  Button,
  Image,
  Container,
  Box,
  VStack,
  HStack,
  ChakraProvider,
} from "@chakra-ui/react"

import { Signimage, Signpass } from "../components/handimage"
import Metatags from "../components/metatags"
import { RiCameraFill, RiCameraOffFill } from "react-icons/ri"
import { useRouter } from "next/router"

export default function Tagasalin() {
  const webcamRef = useRef(null)
  const canvasRef = useRef(null)

  const [camState, setCamState] = useState("on")
  const [detectedText, setDetectedText] = useState("")
  const [sign, setSign] = useState(null)

  const router = useRouter()
  let gamestate = "started"

  const currentDetected = useRef(null)
  const stableTimer = useRef(null)
  const lastStable = useRef(null)
  const detectionStartTime = useRef(null)

  async function runHandpose() {
    const net = await handpose.load()
    detectLoop(net)
  }

  // Run detection continuously
  function detectLoop(net) {
    setInterval(() => detect(net), 150)
  }

  async function detect(net) {
    if (
      webcamRef.current &&
      webcamRef.current.video.readyState === 4
    ) {
      const video = webcamRef.current.video
      const videoWidth = video.videoWidth
      const videoHeight = video.videoHeight

      video.width = videoWidth
      video.height = videoHeight
      canvasRef.current.width = videoWidth
      canvasRef.current.height = videoHeight

      const hand = await net.estimateHands(video)

      if (hand.length > 0) {
        const GE = new fp.GestureEstimator([
          fp.Gestures.ThumbsUpGesture,
          Handsigns.aSign, Handsigns.bSign, Handsigns.cSign, Handsigns.dSign,
          Handsigns.eSign, Handsigns.fSign, Handsigns.gSign, Handsigns.hSign,
          Handsigns.iSign, Handsigns.jSign, Handsigns.kSign, Handsigns.lSign,
          Handsigns.mSign, Handsigns.nSign, Handsigns.oSign, Handsigns.pSign,
          Handsigns.qSign, Handsigns.rSign, Handsigns.sSign, Handsigns.tSign,
          Handsigns.uSign, Handsigns.vSign, Handsigns.wSign, Handsigns.xSign,
          Handsigns.ySign, Handsigns.zSign,
        ])

        const estimatedGestures = await GE.estimate(hand[0].landmarks, 6.5)

        if (gamestate === "started") {
          document.querySelector("#app-title").innerText =
            "Make a 👍 gesture with your hand to start"
        }

        if (estimatedGestures.gestures?.length > 0) {
          const confidence = estimatedGestures.gestures.map(p => p.confidence)
          const maxConfidence = confidence.indexOf(Math.max(...confidence))
          const detected = estimatedGestures.gestures[maxConfidence].name

          if (detected === "thumbs_up" && gamestate !== "played") {
            gamestate = "played"
          } else if (gamestate === "played") {
            handleStableDetection(detected)
          }
        }
      }

      const ctx = canvasRef.current.getContext("2d")
      drawHand(hand, ctx)
    }
  }

  // ✅ Handle stable detection logic
  function handleStableDetection(detected) {
    setSign(detected)

    if (currentDetected.current === detected) {
      // Same gesture as before
      const elapsed = (Date.now() - detectionStartTime.current) / 500
      if (elapsed >= 5 && lastStable.current !== detected) {
        // Detected gesture has been stable for 10 seconds
        setDetectedText(prev => prev + detected.toUpperCase())
        lastStable.current = detected
        detectionStartTime.current = Date.now() // reset timer
      }
    } else {
      // New gesture detected — reset the timer
      currentDetected.current = detected
      detectionStartTime.current = Date.now()
    }
  }

  useEffect(() => {
    runHandpose()
    return () => clearInterval(stableTimer.current)
  }, [])

  function turnOffCamera() {
    setCamState(camState === "on" ? "off" : "on")
  }

  function goBack() {
    router.push("/")
  }

  function resetText() {
    setDetectedText("")
    setSign(null)

    // Reset gesture tracking refs
    currentDetected.current = null
    lastStable.current = null
    detectionStartTime.current = null
    stableTimer.current = null


    document.querySelector("#app-title").innerText = "Make a 👍 gesture with your hand to start"
  }


  return (
    <ChakraProvider>
      <Metatags />
      <Box bgColor="#5784BA">
        <Container centerContent maxW="xl" height="100vh" pt="0" pb="0">
          <VStack spacing={4} align="center">
            <Box h="20px" />
            <Heading
              as="h3"
              size="md"
              className="tutor-text"
              color="white"
              textAlign="center"
            />
            <Box h="20px" />
          </VStack>

          <Heading
            as="h1"
            size="lg"
            id="app-title"
            color="white"
            textAlign="center"
          >
            Loading the HandSign
          </Heading>

          <Box id="webcam-container" position="relative">
            {camState === "on" ? (
              <Webcam id="webcam" ref={webcamRef} />
            ) : (
              <div id="webcam" background="black" />
            )}

            {/* Overlay Box (previously below webcam) now appears inside webcam container */}
            <Box
              position="absolute"
              bottom={100}
              left="50%"
              transform="translateX(-50%)"
              bg="blackAlpha.700"
              borderRadius="md"
              p={3}
              textAlign="center"
              boxShadow="md"
              zIndex={20}
              w="90%"
              maxW="md"
            >
              <Text color="white" fontSize="2xl" fontWeight="bold" mb={4}>
                {detectedText || "Detected Text"}
              </Text>

            {sign && (
              <Box mb={4} textAlign="center">
                <Text color="white" fontSize="sm" mb={2}>
                  Detected Gesture
                </Text>

                {(() => {
                  // Debug in console
                  console.log("Sign image source:", sign)

                  // Handle Thumbs Up vs. letters
                  if (sign === "thumbs_up") {
                    return (
                      <Text color="blue.300" fontSize="3xl" fontWeight="bold">
                        👍 Thumbs Up
                      </Text>
                    )
                  }

                  // Display detected letter in uppercase
                  return (
                    <Text color="blue.300" fontSize="4xl" fontWeight="bold">
                      {sign.toUpperCase()}
                    </Text>
                  )
                })()}
              </Box>
            )}


            
            </Box>
          </Box>


          <canvas id="gesture-canvas" ref={canvasRef} style={{}} />
          <Image h="150px" objectFit="cover" id="emojimage" />

          <Box
            position="absolute"
            bottom={{ base: 3, md: 5, lg: 7 }}
            left="50%"
            transform="translateX(-50%)"
            w="100%"
            maxW="md"
            textAlign="center"
            zIndex={30}
          >
            <HStack spacing={3} justify="center">
              <Button colorScheme="red" size="md" onClick={resetText}>
                Reset
              </Button>

              <Button
                leftIcon={
                  camState === "on" ? (
                    <RiCameraFill size={20} />
                  ) : (
                    <RiCameraOffFill size={20} />
                  )
                }
                onClick={turnOffCamera}
                colorScheme="blue"
                size="md"
              >
                Camera
              </Button>

              <Button colorScheme="gray" onClick={goBack} size="md">
                Back
              </Button>
            </HStack>
          </Box>

        </Container>
      </Box>
    </ChakraProvider>
  )
}
