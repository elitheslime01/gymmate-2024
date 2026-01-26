import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Box,
  Input,
  Select,
  IconButton,
  Stack,
  Spinner,
  Center,
  Text,
  Badge,
  VStack,
  Button,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Divider,
  SimpleGrid,
  Image,
} from "@chakra-ui/react";
import { InfoIcon, RepeatIcon } from "@chakra-ui/icons";
import { useEffect, useCallback, useState, useMemo } from "react";
import useFeedbackStore from "../store/feedback";

const FeedbackTable = () => {
  const {
    feedback,
    isLoading,
    filters,
    setFilters,
    fetchFeedback,
  } = useFeedbackStore();

  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedFeedback, setSelectedFeedback] = useState(null);

  const loadFeedback = useCallback(() => {
    fetchFeedback();
  }, [fetchFeedback]);

  useEffect(() => {
    loadFeedback();
  }, [loadFeedback]);

  const handleFilterChange = (field) => (event) => {
    setFilters({ [field]: event.target.value });
  };

  const handleViewDetails = (item) => {
    setSelectedFeedback(item);
    onOpen();
  };

  const handleCloseModal = () => {
    setSelectedFeedback(null);
    onClose();
  };

  const selectedStudentName = useMemo(() => {
    if (!selectedFeedback?.student) {
      return "Guest";
    }
    const { firstName, lastName } = selectedFeedback.student;
    return [firstName, lastName].filter(Boolean).join(" ") || "Student";
  }, [selectedFeedback]);

  return (
    <Box mt={8}>
      <Stack
        direction={{ base: "column", md: "row" }}
        spacing={{ base: 4, md: 6 }}
        mb={{ base: 6, md: 8 }}
        justify="space-between"
        align={{ base: "stretch", md: "center" }}
      >
        <Stack direction={{ base: "column", md: "row" }} spacing={{ base: 3, md: 4 }}>
          <Input
            type="date"
            value={filters.startDate}
            onChange={handleFilterChange("startDate")}
            placeholder="Start Date (yyyy-mm-dd)"
            bg="white"
            boxShadow="lg"
            maxW={{ base: "100%", md: "220px" }}
          />
          <Input
            type="date"
            value={filters.endDate}
            onChange={handleFilterChange("endDate")}
            placeholder="End Date (yyyy-mm-dd)"
            bg="white"
            boxShadow="lg"
            maxW={{ base: "100%", md: "220px" }}
          />
        </Stack>
        <Stack direction={{ base: "column", md: "row" }} spacing={{ base: 3, md: 4 }}>
          <Select
            placeholder="Category"
            value={filters.category}
            onChange={handleFilterChange("category")}
            bg="white"
            boxShadow="lg"
            maxW={{ base: "100%", md: "220px" }}
          >
            <option value="equipment">Equipment</option>
            <option value="facility">Facility</option>
            <option value="staff">Staff</option>
            <option value="cleanliness">Cleanliness</option>
            <option value="technology">Technology</option>
            <option value="others">Others</option>
          </Select>
          <Select
            placeholder="Status"
            value={filters.status}
            onChange={handleFilterChange("status")}
            bg="white"
            boxShadow="lg"
            maxW={{ base: "100%", md: "200px" }}
          >
            <option value="new">New</option>
            <option value="in_review">In Review</option>
            <option value="resolved">Resolved</option>
          </Select>
          {/* <Select
            placeholder="Sentiment"
            value={filters.sentiment}
            onChange={handleFilterChange("sentiment")}
            bg="white"
            boxShadow="lg"
            maxW={{ base: "100%", md: "200px" }}
          >
            <option value="positive">Positive</option>
            <option value="neutral">Neutral</option>
            <option value="negative">Negative</option>
          </Select> */}
          <Input
            bg="white"
            boxShadow="lg"
            placeholder="Search message, student, or email"
            value={filters.search}
            onChange={handleFilterChange("search")}
            maxW={{ base: "100%", md: "220px" }}
          />
          <Button
            leftIcon={<RepeatIcon />}
            colorScheme="orange"
            variant="outline"
            onClick={loadFeedback}
          ></Button>
        </Stack>
      </Stack>

      {isLoading ? (
        <Center py={12}>
          <Spinner size="lg" color="#FE7654" thickness="4px" />
        </Center>
      ) : feedback.length === 0 ? (
        <Center py={12}>
          <VStack spacing={3}>
            <Text fontWeight="semibold" color="gray.600">
              No feedback results
            </Text>
            <Text fontSize="sm" color="gray.500" textAlign="center">
              Adjust the filters or check back later.
            </Text>
          </VStack>
        </Center>
      ) : (
        <TableContainer
          overflowX="auto"
          overflowY="auto"
          maxH={{ base: "60vh", md: "70vh" }}
        >
          <Table bg="white" size="sm">
            <Thead bg="#071434" position="sticky" top={0} zIndex={1}>
              <Tr>
                <Th color="white" textAlign="center" h="30px">
                  Date
                </Th>
                <Th color="white" textAlign="center">
                  Student
                </Th>
                <Th color="white" textAlign="center">
                  Category
                </Th>
                <Th color="white" textAlign="center">
                  Subcategory
                </Th>
                {/* <Th color="white" textAlign="center">
                  Sentiment
                </Th> */}
                <Th color="white" textAlign="center">
                  Status
                </Th>
                <Th color="white" textAlign="center">
                  Actions
                </Th>
              </Tr>
            </Thead>
            <Tbody>
              {feedback.map((item) => (
                <Tr key={item._id}>
                  <Td textAlign="center">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </Td>
                  <Td textAlign="center">
                    <VStack spacing={0}>
                      <Text fontWeight="semibold" color="gray.800">
                        {item.student
                          ? `${item.student.firstName || ""} ${item.student.lastName || ""}`.trim() || "Student"
                          : "Guest"}
                      </Text>
                      <Text fontSize="xs" color="gray.500">
                        {item.student?.email || "No email"}
                      </Text>
                    </VStack>
                  </Td>
                  <Td textAlign="center" textTransform="capitalize">
                    {item.category || "—"}
                  </Td>
                  <Td textAlign="center" textTransform="capitalize">
                    {item.subcategory || "—"}
                  </Td>
                  {/* <Td textAlign="center">
                    <Badge
                      colorScheme={
                        item.sentiment === "positive"
                          ? "green"
                          : item.sentiment === "negative"
                          ? "red"
                          : "yellow"
                      }
                      textTransform="capitalize"
                    >
                      {item.sentiment || "neutral"}
                    </Badge>
                  </Td> */}
                  <Td textAlign="center">
                    <Badge
                      variant="subtle"
                      colorScheme={
                        item.status === "resolved"
                          ? "green"
                          : item.status === "in_review"
                          ? "yellow"
                          : "purple"
                      }
                      textTransform="capitalize"
                    >
                      {item.status?.replace("_", " ") || "new"}
                    </Badge>
                  </Td>
                  <Td textAlign="center">
                    <IconButton
                      icon={<InfoIcon />}
                      variant="ghost"
                      size="sm"
                      color="#FE7654"
                      _hover={{
                        bg: "rgba(254, 118, 84, 0.1)",
                        color: "#e65c3b",
                      }}
                      aria-label="View feedback details"
                      onClick={() => handleViewDetails(item)}
                    />
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableContainer>
      )}

      <Modal isOpen={isOpen} onClose={handleCloseModal} size="xl" scrollBehavior="inside">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Feedback Details</ModalHeader>
          <ModalCloseButton />
          <ModalBody display="flex" flexDirection="column" gap={4}>
            {selectedFeedback ? (
              <>
                <Box>
                  <Text fontSize="sm" color="gray.500">
                    Submitted
                  </Text>
                  <Text fontWeight="semibold">
                    {new Date(selectedFeedback.createdAt).toLocaleString()}
                  </Text>
                </Box>
                <Divider />
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  <Box>
                    <Text fontSize="sm" color="gray.500">
                      Student
                    </Text>
                    <Text fontWeight="semibold">{selectedStudentName}</Text>
                    {selectedFeedback.student?.email ? (
                      <Text fontSize="sm" color="gray.600">
                        {selectedFeedback.student.email}
                      </Text>
                    ) : null}
                  </Box>
                  <Box>
                    <Text fontSize="sm" color="gray.500">
                      Status
                    </Text>
                    <Badge textTransform="capitalize">
                      {selectedFeedback.status?.replace("_", " ") || "new"}
                    </Badge>
                  </Box>
                  <Box>
                    <Text fontSize="sm" color="gray.500">
                      Category
                    </Text>
                    <Text textTransform="capitalize" fontWeight="semibold">
                      {selectedFeedback.category || "—"}
                    </Text>
                  </Box>
                  <Box>
                    <Text fontSize="sm" color="gray.500">
                      Subcategory
                    </Text>
                    <Text textTransform="capitalize" fontWeight="semibold">
                      {selectedFeedback.subcategory || "—"}
                    </Text>
                  </Box>
                  {/* <Box>
                    <Text fontSize="sm" color="gray.500">
                      Sentiment
                    </Text>
                    <Badge
                      colorScheme={
                        selectedFeedback.sentiment === "positive"
                          ? "green"
                          : selectedFeedback.sentiment === "negative"
                          ? "red"
                          : "yellow"
                      }
                      textTransform="capitalize"
                    >
                      {selectedFeedback.sentiment || "neutral"}
                    </Badge>
                  </Box> */}
                </SimpleGrid>
                <Box>
                  <Text fontSize="sm" color="gray.500" mb={1}>
                    Message
                  </Text>
                  <Box
                    borderRadius="md"
                    bg="gray.50"
                    p={3}
                    maxH="200px"
                    overflowY="auto"
                  >
                    <Text whiteSpace="pre-wrap" color="gray.700">
                      {selectedFeedback.message}
                    </Text>
                  </Box>
                </Box>
                <Box>
                  <Text fontSize="sm" color="gray.500" mb={2}>
                    Attachments
                  </Text>
                  {selectedFeedback.attachments?.length ? (
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                      {selectedFeedback.attachments.map((file) => {
                        const isImage = file.mimetype?.startsWith("image/");
                        return (
                          <Box key={file._id || file.filename} borderRadius="md" overflow="hidden" border="1px solid" borderColor="gray.200">
                            {isImage && file.data ? (
                              <Image src={file.data} alt={file.filename} objectFit="cover" maxH="200px" w="100%" />
                            ) : (
                              <Box p={3} bg="gray.100">
                                <Text fontSize="sm" fontWeight="semibold" noOfLines={2}>
                                  {file.filename}
                                </Text>
                                <Button
                                  as="a"
                                  href={file.data || "#"}
                                  download={file.filename}
                                  size="sm"
                                  mt={2}
                                  colorScheme="orange"
                                  variant="outline"
                                  isDisabled={!file.data}
                                >
                                  Download
                                </Button>
                              </Box>
                            )}
                          </Box>
                        );
                      })}
                    </SimpleGrid>
                  ) : (
                    <Text fontSize="sm" color="gray.500">
                      No attachments provided.
                    </Text>
                  )}
                </Box>
              </>
            ) : (
              <Text color="gray.500">No feedback selected.</Text>
            )}
          </ModalBody>
          <ModalFooter>
            <Button onClick={handleCloseModal}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default FeedbackTable;