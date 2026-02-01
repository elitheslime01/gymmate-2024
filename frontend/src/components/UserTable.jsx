import {
  Box,
  Button,
  Flex,
  Grid,
  Icon,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
  Spinner,
  Stack,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  Text,
  useDisclosure,
  useToast,
  Switch,
  FormControl,
  FormLabel,
  Tag,
  TagLabel,
  Avatar,
  Divider,
  Radio,
  RadioGroup,
} from "@chakra-ui/react";
import {
  AddIcon,
  ViewIcon,
  SearchIcon,
  ArrowBackIcon,
  EditIcon,
  DeleteIcon,
  CloseIcon,
  CheckIcon,
} from "@chakra-ui/icons";
import { MdFilterList } from "react-icons/md";
import { useEffect, useMemo, useState } from "react";
import useUserManagementStore from "../store/userManagement";

const initialForm = {
  _fName: "",
  _lName: "",
  _gender: "",
  _umakEmail: "",
  _umakIDNum: "",
  _role: "",
  _password: "",
  _activeStat: true,
};

const UserTable = () => {
  const toast = useToast();
  const {
    users,
    isLoading,
    error,
    fetchUsers,
    createUser,
    viewType,
    setViewType,
    updateUser,
    deleteUser,
  } = useUserManagementStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [searchField, setSearchField] = useState("id");
  const [selectedUser, setSelectedUser] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState(null);
  const [formData, setFormData] = useState(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const detailsDisclosure = useDisclosure();
  const createDisclosure = useDisclosure();

  useEffect(() => {
    fetchUsers(viewType);
  }, [fetchUsers, viewType]);

  useEffect(() => {
    if (error) {
      toast({
        title: "Unable to load users",
        description: error,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  }, [error, toast]);

  const filteredUsers = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return users;
    return users.filter((user) => {
      const name = `${user._fName || ""} ${user._lName || ""}`.toLowerCase();
      const email = (user._umakEmail || "").toLowerCase();
      const id = (user._umakIDNum || user._umakID || "").toLowerCase();
      if (searchField === "name") return name.includes(term);
      if (searchField === "email") return email.includes(term);
      return id.includes(term);
    });
  }, [searchTerm, users, searchField]);

  const handleSelectUser = (user) => {
    setSelectedUser(user);
    setEditForm(user);
    setEditMode(false);
    detailsDisclosure.onOpen();
  };

  const handleCloseDetails = () => {
    setSelectedUser(null);
    setEditForm(null);
    setEditMode(false);
    detailsDisclosure.onClose();
  };

  const handleFormChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleEditChange = (field, value) => {
    setEditForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveEdit = async () => {
    if (!selectedUser?._id || !editForm) return;
    setIsSavingEdit(true);
    const result = await updateUser(selectedUser._id, editForm);
    setIsSavingEdit(false);
    if (result?.success) {
      toast({ title: "User updated", status: "success", duration: 2000, isClosable: true });
      setEditMode(false);
      setSelectedUser(editForm);
    } else {
      toast({ title: "Update failed", description: result?.message || "", status: "error", duration: 2500, isClosable: true });
    }
  };

  const handleDelete = async () => {
    if (!selectedUser?._id) return;
    const confirmed = window.confirm("Are you sure you want to delete this user?");
    if (!confirmed) return;
    setIsDeleting(true);
    const result = await deleteUser(selectedUser._id);
    setIsDeleting(false);
    if (result?.success) {
      toast({ title: "User deleted", status: "success", duration: 2000, isClosable: true });
      handleCloseDetails();
    } else {
      toast({ title: "Delete failed", description: result?.message || "", status: "error", duration: 2500, isClosable: true });
    }
  };

  const handleToggleView = (type) => {
    if (type === viewType) return;
    setViewType(type);
    setSelectedUser(null);
    setSearchTerm("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!formData._fName || !formData._lName || !formData._umakEmail || !formData._umakIDNum || !formData._role || !formData._password || !formData._gender) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields.",
        status: "warning",
        duration: 2500,
        isClosable: true,
      });
      return;
    }

    setIsSubmitting(true);
    const result = await createUser(formData);
    setIsSubmitting(false);

    if (result?.success) {
      toast({
        title: "User created",
        description: "The new user has been added to the list.",
        status: "success",
        duration: 2500,
        isClosable: true,
      });
      setFormData(initialForm);
      createDisclosure.onClose();
    } else {
      toast({
        title: "Unable to create user",
        description: result?.message || "Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const priorityBreakdown = (user) => {
    if (!user) return { total: 0, attended: 0, noShows: 0, unsuccessful: 0 };
    const attended = user._attendedSlots || 0;
    const noShows = user._noShows || 0;
    const unsuccessful = user._unsuccessfulAttempts || 0;
    const derived = unsuccessful + attended - Math.floor(noShows / 2);
    const total = typeof user._priorityScore === "number" ? user._priorityScore : derived;
    return { total, attended, noShows, unsuccessful };
  };

  return (
    <Box>
      <Stack spacing={4} mb={{ base: 4, md: 6 }}>
        <Flex justify="space-between" align={{ base: "stretch", md: "center" }} direction={{ base: "column", md: "row" }} gap={3}>
          <Stack direction="row" spacing={0} borderRadius="md" overflow="hidden" bg="white" boxShadow="sm" w={{ base: "100%", md: "auto" }}>
            {[
              { key: "admin", label: "Admin" },
              { key: "student", label: "Student" },
            ].map((item) => (
              <Button
                key={item.key}
                variant="ghost"
                onClick={() => handleToggleView(item.key)}
                bg={viewType === item.key ? "#071434" : "transparent"}
                color={viewType === item.key ? "white" : "gray.700"}
                _hover={{ bg: viewType === item.key ? "#0c2246" : "gray.100" }}
                borderRadius={0}
                flex="1"
              >
                {item.label}
              </Button>
            ))}
          </Stack>

          <Flex gap={3} direction={{ base: "column", lg: "row" }} align={{ base: "stretch", lg: "center" }}>
            <Flex align="center" gap={2} bg="white" boxShadow="sm" borderRadius="md" px={3} py={2} w={{ base: "100%", lg: "auto" }}>
              <Icon as={MdFilterList} color="#071434" />
              <Select
                border="none"
                boxShadow="none"
                value={searchField}
                onChange={(e) => setSearchField(e.target.value)}
                _focus={{ boxShadow: "none" }}
                minW="140px"
              >
                <option value="id">Student ID</option>
                <option value="email">UMak Email</option>
                <option value="name">Name</option>
              </Select>
            </Flex>
            <InputGroup maxW={{ base: "100%", lg: "320px" }}>
              <InputLeftElement pointerEvents="none">
                <SearchIcon color="gray.400" />
              </InputLeftElement>
              <Input
                bg="white"
                boxShadow="sm"
                placeholder="Search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </InputGroup>
            {viewType === "admin" && (
              <Button
                leftIcon={<AddIcon />}
                bg="#FE7654"
                color="white"
                _hover={{ bg: "#e65c3b" }}
                _active={{ bg: "#cc4a2d" }}
                onClick={createDisclosure.onOpen}
                alignSelf={{ base: "flex-start", lg: "center" }}
              >
                Add User
              </Button>
            )}
          </Flex>
        </Flex>
      </Stack>

      <TableContainer overflowX="auto">
        <Table bg="white" size="sm">
          <Thead bg="#071434" position="sticky" top={0} zIndex={1}>
            <Tr>
              <Th color="white" textAlign="center" minW="140px">Student ID</Th>
              <Th color="white" textAlign="center">Name & UMak Email</Th>
              <Th color="white" textAlign="center">Active Status</Th>
              <Th color="white" textAlign="center">Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {isLoading ? (
              <Tr>
                <Td colSpan={4} textAlign="center">
                  <Spinner size="sm" mr={2} /> Loading users...
                </Td>
              </Tr>
            ) : filteredUsers && filteredUsers.length > 0 ? (
              filteredUsers.map((user) => {
                const statusLabel = user._activeStat ? "Active" : "Inactive";
                const statusColor = user._activeStat ? "green" : "gray";
                const umakId = user._umakIDNum || user._umakID || "--";
                return (
                  <Tr key={user._id || umakId}>
                    <Td textAlign="center" fontWeight="semibold" color="#071434">{umakId || "--"}</Td>
                    <Td>
                      <Stack spacing={0} align="flex-start">
                        <Text fontWeight="semibold" color="#071434">{`${user._fName || ""} ${user._lName || ""}`.trim() || "--"}</Text>
                        <Text fontSize="sm" color="gray.600">{user._umakEmail || "--"}</Text>
                      </Stack>
                    </Td>
                    <Td textAlign="center">
                      <Tag bg={`${statusColor}.100`} color={`${statusColor}.700`} px={4} py={1} borderRadius="md" fontWeight="semibold">
                        <TagLabel>{statusLabel}</TagLabel>
                      </Tag>
                    </Td>
                    <Td textAlign="center">
                      <IconButton
                        icon={<ViewIcon />}
                        aria-label="View user"
                        size="sm"
                        variant="ghost"
                        color="#FE7654"
                        _hover={{ bg: "rgba(254, 118, 84, 0.1)", color: "#e65c3b" }}
                        onClick={() => handleSelectUser(user)}
                      />
                    </Td>
                  </Tr>
                );
              })
            ) : (
              <Tr>
                <Td colSpan={4} textAlign="center">No users found</Td>
              </Tr>
            )}
          </Tbody>
        </Table>
      </TableContainer>

      <Modal isOpen={detailsDisclosure.isOpen} onClose={handleCloseDetails} isCentered size="5xl">
        <ModalOverlay />
        <ModalContent mx={{ base: 4, md: 0 }} maxW="1200px">
          <ModalHeader bg="#071434" color="white" roundedTop="md" p={4} position="relative">
            <Flex align="center" justify="center">
              <Text fontWeight="bold">User Details</Text>
            </Flex>
            <ModalCloseButton color="white" _hover={{ bg: "rgba(255,255,255,0.1)" }} />
          </ModalHeader>
          <ModalBody p={8}>
            {selectedUser && (
              <Box>
                <Flex justify="flex-end" gap={2} mb={4}>
                  {!editMode && (
                    <>
                      <IconButton
                        aria-label="Edit"
                        icon={<EditIcon />}
                        variant="outline"
                        color="#e65c3b"
                        borderColor="#e65c3b"
                        _hover={{ bg: "rgba(230, 92, 59, 0.1)" }}
                        onClick={() => setEditMode(true)}
                      />
                      <IconButton
                        aria-label="Delete"
                        icon={<DeleteIcon />}
                        variant="outline"
                        colorScheme="red"
                        onClick={handleDelete}
                        isLoading={isDeleting}
                      />
                    </>
                  )}
                  {editMode && (
                    <>
                      <IconButton
                        aria-label="Cancel"
                        icon={<CloseIcon />}
                        variant="ghost"
                        onClick={() => { setEditMode(false); setEditForm(selectedUser); }}
                      />
                      <IconButton
                        aria-label="Save"
                        icon={<CheckIcon />}
                        bg="#FE7654"
                        color="white"
                        _hover={{ bg: "#e65c3b" }}
                        _active={{ bg: "#cc4a2d" }}
                        onClick={handleSaveEdit}
                        isLoading={isSavingEdit}
                      />
                      <IconButton
                        aria-label="Delete"
                        icon={<DeleteIcon />}
                        variant="outline"
                        colorScheme="red"
                        onClick={handleDelete}
                        isLoading={isDeleting}
                      />
                    </>
                  )}
                </Flex>

                <Grid templateColumns={{ base: "1fr", md: "320px 1fr" }} gap={10} alignItems="start">
                  <Box w="full">
                    <Box
                      bg="#f1f2f6"
                      borderRadius="lg"
                      p={4}
                      position="relative"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      minH="260px"
                    >
                      <Avatar size="2xl" name={`${selectedUser._fName || ""} ${selectedUser._lName || ""}`} bg="#d7dbe3" color="#071434" />
                    </Box>

                    <Stack spacing={3} mt={4}>
                      <Button
                        leftIcon={<Icon viewBox="0 0 24 24" color="#071434"><path fill="currentColor" d="M12 5c-7.633 0-10 6.364-10 6.364s2.367 6.364 10 6.364 10-6.364 10-6.364S19.633 5 12 5zm0 10.455A4.091 4.091 0 1 1 12 7.273a4.091 4.091 0 0 1 0 8.182zm0-6.546a2.455 2.455 0 1 0 0 4.91 2.455 2.455 0 0 0 0-4.91z" /></Icon>}
                        variant="outline"
                        colorScheme="blue"
                        justifyContent="flex-start"
                        fontWeight="semibold"
                        w="full"
                      >
                        Uploaded COR
                      </Button>

                      <Flex align="center" justify="space-between" bg="gray.100" borderRadius="md" px={3} py={2} w="full">
                        <Text fontWeight="semibold" color="#071434">{selectedUser._activeStat ? "Active" : "Inactive"}</Text>
                        <Icon viewBox="0 0 24 24" color="#071434">
                          <path fill="currentColor" d="M7 10l5 5 5-5z" />
                        </Icon>
                      </Flex>
                    </Stack>
                  </Box>

                  <Stack spacing={6} w="full">
                    <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={4}>
                      <Box>
                        <Text fontWeight="bold" color="#071434" mb={1}>Name</Text>
                        <Input
                          value={`${(editForm?._fName ?? selectedUser._fName) || ""} ${(editForm?._lName ?? selectedUser._lName) || ""}`.trim()}
                          onChange={(e) => {
                            const [f, ...rest] = e.target.value.split(" ");
                            handleEditChange("_fName", f);
                            handleEditChange("_lName", rest.join(" "));
                          }}
                          isReadOnly={!editMode}
                          bg="gray.100"
                          borderColor="gray.200"
                        />
                      </Box>
                      <Box>
                        <Text fontWeight="bold" color="#071434" mb={1}>Gender</Text>
                        <RadioGroup
                          value={(editForm?._gender || selectedUser._gender || "").toLowerCase()}
                          isDisabled={!editMode}
                          onChange={(val) => handleEditChange("_gender", val)}
                        >
                          <Flex gap={6}>
                            <Radio value="male">Male</Radio>
                            <Radio value="female">Female</Radio>
                          </Flex>
                        </RadioGroup>
                      </Box>

                      {viewType === "student" && (
                        <>
                          <Box>
                            <Text fontWeight="bold" color="#071434" mb={1}>College & Course</Text>
                            <Input
                              value={editForm?._course ? `${editForm?._college || ""} - ${editForm?._course}`.trim() : editForm?._college || ""}
                              onChange={(e) => handleEditChange("_course", e.target.value)}
                              isReadOnly={!editMode}
                              bg="gray.100"
                              borderColor="gray.200"
                            />
                          </Box>
                          <Box>
                            <Text fontWeight="bold" color="#071434" mb={1}>Year & Section</Text>
                            <Input
                              value={editForm?._year ? `${editForm?._year || ""} - ${editForm?._section || ""}`.trim() : ""}
                              onChange={(e) => {
                                const [year, section] = e.target.value.split("-").map((s) => s.trim());
                                handleEditChange("_year", year);
                                handleEditChange("_section", section);
                              }}
                              isReadOnly={!editMode}
                              bg="gray.100"
                              borderColor="gray.200"
                            />
                          </Box>
                        </>
                      )}

                      <Box>
                        <Text fontWeight="bold" color="#071434" mb={1}>UMak Email Address</Text>
                        <Input
                          value={editForm?._umakEmail || ""}
                          onChange={(e) => handleEditChange("_umakEmail", e.target.value)}
                          isReadOnly={!editMode}
                          bg="gray.100"
                          borderColor="gray.200"
                        />
                      </Box>
                      <Box>
                        <Text fontWeight="bold" color="#071434" mb={1}>UMak ID Number</Text>
                        <Input
                          value={editForm?._umakIDNum || editForm?._umakID || ""}
                          onChange={(e) => {
                            handleEditChange("_umakIDNum", e.target.value);
                            handleEditChange("_umakID", e.target.value);
                          }}
                          isReadOnly={!editMode}
                          bg="gray.100"
                          borderColor="gray.200"
                        />
                      </Box>

                      <Box>
                        <Text fontWeight="bold" color="#071434" mb={1}>Phone Number</Text>
                        <Input
                          value={editForm?._phone || ""}
                          onChange={(e) => handleEditChange("_phone", e.target.value)}
                          isReadOnly={!editMode}
                          bg="gray.100"
                          borderColor="gray.200"
                        />
                      </Box>
                      <Box>
                        <Text fontWeight="bold" color="#071434" mb={1}>Password</Text>
                        <Input
                          type="password"
                          value={editForm?._password || ""}
                          onChange={(e) => handleEditChange("_password", e.target.value)}
                          isReadOnly={!editMode}
                          bg="gray.100"
                          borderColor="gray.200"
                        />
                      </Box>
                    </Grid>

                    <Divider />

                    <Grid templateColumns={{ base: "repeat(1, 1fr)", md: "repeat(2, 1fr)" }} gap={4}>
                      <Box>
                        <Text fontWeight="bold" color="#071434" mb={1}>Registered</Text>
                        <Input value={selectedUser._dateReg ? new Date(selectedUser._dateReg).toLocaleString() : "--"} isReadOnly bg="gray.100" borderColor="gray.200" />
                      </Box>
                      <Box>
                        <Text fontWeight="bold" color="#071434" mb={1}>Last Login</Text>
                        <Input value={selectedUser._lastLogin ? new Date(selectedUser._lastLogin).toLocaleString() : "--"} isReadOnly bg="gray.100" borderColor="gray.200" />
                      </Box>
                    </Grid>

                    {viewType === "student" && (
                      <Box>
                        <Text fontWeight="bold" color="#071434" mb={3}>Priority Scores</Text>
                        {(() => {
                          const stats = priorityBreakdown(editForm || selectedUser);
                          return (
                            <Grid templateColumns={{ base: "repeat(2, 1fr)", md: "repeat(4, 1fr)" }} gap={3}>
                              <Box bg="gray.100" borderRadius="md" p={3} textAlign="center">
                                <Text fontSize="sm" color="gray.600">Attended</Text>
                                <Input
                                  value={stats.attended}
                                  onChange={(e) => handleEditChange("_attendedSlots", Number(e.target.value) || 0)}
                                  isReadOnly={!editMode}
                                  textAlign="center"
                                  bg="gray.100"
                                  borderColor="gray.200"
                                />
                              </Box>
                              <Box bg="gray.100" borderRadius="md" p={3} textAlign="center">
                                <Text fontSize="sm" color="gray.600">No Shows</Text>
                                <Input
                                  value={stats.noShows}
                                  onChange={(e) => handleEditChange("_noShows", Number(e.target.value) || 0)}
                                  isReadOnly={!editMode}
                                  textAlign="center"
                                  bg="gray.100"
                                  borderColor="gray.200"
                                />
                              </Box>
                              <Box bg="gray.100" borderRadius="md" p={3} textAlign="center">
                                <Text fontSize="sm" color="gray.600">Unsuccessful</Text>
                                <Input
                                  value={stats.unsuccessful}
                                  onChange={(e) => handleEditChange("_unsuccessfulAttempts", Number(e.target.value) || 0)}
                                  isReadOnly={!editMode}
                                  textAlign="center"
                                  bg="gray.100"
                                  borderColor="gray.200"
                                />
                              </Box>
                              <Box bg="#071434" borderRadius="md" p={3} textAlign="center" color="white">
                                <Text fontSize="sm" color="white">Total</Text>
                                <Text fontWeight="bold">{stats.total}</Text>
                              </Box>
                            </Grid>
                          );
                        })()}
                      </Box>
                    )}
                  </Stack>
                </Grid>
              </Box>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>

      <Modal isOpen={createDisclosure.isOpen} onClose={createDisclosure.onClose} isCentered size="xl">
        <ModalOverlay />
        <ModalContent mx={{ base: 4, md: 0 }}>
          <ModalHeader bg="#071434" color="white" roundedTop="md">Add User</ModalHeader>
          <ModalCloseButton color="white" />
          <ModalBody p={8}>
            <form id="create-user-form" onSubmit={handleSubmit}>
              <Grid templateColumns={{ base: "repeat(1, 1fr)", md: "repeat(2, 1fr)" }} gap={6}>
                <Box>
                  <Text mb={2} color="gray.700">First Name</Text>
                  <Input value={formData._fName} onChange={(e) => handleFormChange("_fName", e.target.value)} placeholder="Enter first name" bg="white" boxShadow="lg" />
                </Box>
                <Box>
                  <Text mb={2} color="gray.700">Last Name</Text>
                  <Input value={formData._lName} onChange={(e) => handleFormChange("_lName", e.target.value)} placeholder="Enter last name" bg="white" boxShadow="lg" />
                </Box>
                <Box>
                  <Text mb={2} color="gray.700">Gender</Text>
                  <Select value={formData._gender} onChange={(e) => handleFormChange("_gender", e.target.value)} placeholder="Select gender" bg="white" boxShadow="lg">
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </Select>
                </Box>
                <Box>
                  <Text mb={2} color="gray.700">Role</Text>
                  <Select value={formData._role} onChange={(e) => handleFormChange("_role", e.target.value)} placeholder="Select role" bg="white" boxShadow="lg">
                    <option value="admin">Admin</option>
                    <option value="staff">Staff</option>
                    <option value="coach">Coach</option>
                  </Select>
                </Box>
                <Box>
                  <Text mb={2} color="gray.700">Umak Email</Text>
                  <Input type="email" value={formData._umakEmail} onChange={(e) => handleFormChange("_umakEmail", e.target.value)} placeholder="name@umak.edu" bg="white" boxShadow="lg" />
                </Box>
                <Box>
                  <Text mb={2} color="gray.700">ID Number</Text>
                  <Input value={formData._umakIDNum} onChange={(e) => handleFormChange("_umakIDNum", e.target.value)} placeholder="Enter ID number" bg="white" boxShadow="lg" />
                </Box>
                <Box>
                  <Text mb={2} color="gray.700">Password</Text>
                  <Input type="password" value={formData._password} onChange={(e) => handleFormChange("_password", e.target.value)} placeholder="Set a password" bg="white" boxShadow="lg" />
                </Box>
                <FormControl display="flex" alignItems="center" mt={{ base: 2, md: 8 }}>
                  <FormLabel htmlFor="active-toggle" mb="0" color="gray.700">
                    Active
                  </FormLabel>
                  <Switch
                    id="active-toggle"
                    colorScheme="orange"
                    isChecked={formData._activeStat}
                    onChange={(e) => handleFormChange("_activeStat", e.target.checked)}
                  />
                </FormControl>
              </Grid>
            </form>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={createDisclosure.onClose}>Cancel</Button>
            <Button
              type="submit"
              form="create-user-form"
              bg="#FE7654"
              color="white"
              _hover={{ bg: "#e65c3b" }}
              _active={{ bg: "#cc4a2d" }}
              isLoading={isSubmitting}
            >
              Save User
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default UserTable;
