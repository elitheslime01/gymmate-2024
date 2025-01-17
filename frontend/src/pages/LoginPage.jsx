import { useToast, Button, Center, Flex, HStack, Input, InputGroup, InputLeftElement, InputRightElement, Text, VStack } from "@chakra-ui/react";
import { Cloudinary } from '@cloudinary/url-gen';
import { AdvancedImage } from '@cloudinary/react';
import { MdEmail } from "react-icons/md";
import { RiLockPasswordFill } from "react-icons/ri";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAdminStore } from '../store/admin.js';
import PropTypes from 'prop-types';

const LoginPage = () => {
  const cld = new Cloudinary({ cloud: { cloudName: 'dvbl1rjtc' } });
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { loginAdmin } = useAdminStore();
  const toast = useToast();
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (setter) => (event) => {
      setter(event.target.value);
  };

  const handleLogin = async () => {
    // Log the inputs for debugging
    console.log("Email:", email);
    console.log("Password:", password);

    const result = await loginAdmin(email, password);
    const { success = false, message = "An unexpected error occurred." } = result || {}; 

    toast({
      title: success ? "Success" : "Error",
      description: message,
      status: success ? "success" : "error",
      duration: 3000,
      isClosable: true
    });

    if (success) {
      // Clear the input fields
      setEmail(''); 
      setPassword(''); 

      navigate('/dashboard');
    }
  };
  
  return (
    <Flex color='white'>
        <Center w='50vw' h='100vh' m='0' p='0'>
            <AdvancedImage
                draggable={false}
                cldImg={cld.image('bg-01_bcoz28').format('auto').quality('auto')}
                style={{ width: '100%', height: '100%', objectFit: 'fill' }}
            />
        </Center>
        <Center w='50vw' h='100vh' bg='gray.300' m='0' p='0'>
            <VStack w='100%' spacing='10'>
                <Center m='0' p='0'>
                    <AdvancedImage
                        draggable={false}
                        cldImg={cld.image('clipboard-image-1729707349_e6xxhf').format('auto').quality('auto')}
                        style={{ width: '50%', height: '50%' }}
                    />
                </Center>
                <VStack w='50%' justify="center" mb={6} spacing={5}>
                    <InputField
                        placeholder='Email'
                        icon={<MdEmail />}
                        value={email}
                        onChange={handleInputChange(setEmail)}
                    />
                    <InputField
                        placeholder='Password'
                        icon={<RiLockPasswordFill />}
                        value={password}
                        type={showPassword ? 'text' : 'password'}
                        onChange={handleInputChange(setPassword)}
                        toggleVisibility={() => setShowPassword(prev => !prev)}
                        showPassword={showPassword}
                    />
                </VStack>
                <Button
                    w='50%'
                    h='50px'
                    bgColor='#FE7654'
                    color='white'
                    _hover={{ bg: '#e65c3b' }}
                    _active={{ bg: '#cc4a2d' }}
                    onClick={handleLogin}>
                    Log In
                </Button>
                <HStack spacing='2' w='50%' justifyContent='space-between'>
                    <Text onClick={() => console.log("Forgot Password clicked")} color="#071434" cursor="pointer" fontSize='sm'>Forgot password?</Text>
                    <Text onClick={() => console.log("Register clicked")} color="#071434" cursor="pointer" fontSize='sm'>Register an account?</Text>
                </HStack>
            </VStack>
        </Center>
      </Flex>
    );
};

const InputField = ({ placeholder, icon, value, onChange, type = 'text', toggleVisibility, showPassword }) => (
  <InputGroup w='100%'>
      <InputLeftElement color='gray.500' pointerEvents='none' h='50px' display='flex' alignItems='center'>
          {icon}
      </InputLeftElement>
      <Input
          placeholder={placeholder}
          variant="outline"
          boxShadow='lg'
          rounded='md'
          h='50px'
          bg="white"
          color="#071434"
          type={type}
          value={value}
          onChange={onChange}
      />
      {toggleVisibility && (
          <InputRightElement h='50px' display='flex' alignItems='center' cursor='pointer' onClick={toggleVisibility}>
              <Button variant='link' color='gray.500' onClick={toggleVisibility}>
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
              </Button>
          </InputRightElement>
      )}
  </InputGroup>
);

// PropTypes validation
InputField.propTypes = {
  placeholder: PropTypes.string.isRequired, // Required string
  icon: PropTypes.element.isRequired, // Required React element (icon)
  value: PropTypes.string.isRequired, // Required string for input value
  onChange: PropTypes.func.isRequired, // Required function for change handler
  type: PropTypes.string, // Optional string for input type
  toggleVisibility: PropTypes.func, // Optional function for toggling visibility
  showPassword: PropTypes.bool, // Optional boolean for showing password
};

export default LoginPage;