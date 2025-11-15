import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Flex,
  Box,
  Image,
  Button,
  ButtonGroup,
  Text,
} from "@chakra-ui/react";
import { AddIcon, MinusIcon, RepeatIcon } from "@chakra-ui/icons";
import { useEffect, useState } from "react";
import PropTypes from "prop-types";

const MAX_SCALE = 4;
const MIN_SCALE = 0.5;
const SCALE_STEP = 0.25;

const ArImageViewer = ({ isOpen, onClose, imageSrc, contentType, title = "Acknowledgement Receipt" }) => {
  const [scale, setScale] = useState(1);

  useEffect(() => {
    if (isOpen) {
      setScale(1);
    }
  }, [isOpen]);

  const handleZoomIn = () => {
    setScale((prev) => Math.min(prev + SCALE_STEP, MAX_SCALE));
  };

  const handleZoomOut = () => {
    setScale((prev) => Math.max(prev - SCALE_STEP, MIN_SCALE));
  };

  const handleReset = () => {
    setScale(1);
  };

  const handleClose = () => {
    onClose();
    setScale(1);
  };

  if (!imageSrc) {
    return null;
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="full" scrollBehavior="inside">
      <ModalOverlay bg="blackAlpha.800" />
      <ModalContent bg="gray.900" color="white" maxW="90vw" maxH="90vh" mx="auto">
        <ModalHeader>{title}</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={8}>
          <Flex direction="column" gap={4} align="center">
            <ButtonGroup spacing={3}>
              <Button
                leftIcon={<MinusIcon />}
                onClick={handleZoomOut}
                isDisabled={scale <= MIN_SCALE}
                variant="outline"
                colorScheme="orange"
              >
                Zoom Out
              </Button>
              <Button
                leftIcon={<RepeatIcon />}
                onClick={handleReset}
                variant="outline"
                colorScheme="orange"
              >
                Reset
              </Button>
              <Button
                leftIcon={<AddIcon />}
                onClick={handleZoomIn}
                isDisabled={scale >= MAX_SCALE}
                variant="outline"
                colorScheme="orange"
              >
                Zoom In
              </Button>
            </ButtonGroup>
            <Box
              maxH="70vh"
              overflow="auto"
              borderRadius="md"
              borderWidth="1px"
              borderColor="gray.700"
              bg="black"
              px={4}
              py={4}
              w="full"
            >
              <Box
                transform={`scale(${scale})`}
                transformOrigin="top center"
                transition="transform 0.12s ease-out"
              >
                <Image src={imageSrc} alt={title} maxW="100%" mx="auto" display="block" />
              </Box>
            </Box>
            {contentType && (
              <Text fontSize="sm" color="gray.400">
                Format: {contentType}
              </Text>
            )}
          </Flex>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

ArImageViewer.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  imageSrc: PropTypes.string,
  contentType: PropTypes.string,
  title: PropTypes.string,
};

export default ArImageViewer;
