import { Button, Heading, HStack, Icon } from "@chakra-ui/react";
import PropTypes from 'prop-types';


const DashboardButtons = ({ text, icon, ...props }) => {
  return (
    <Button 
      bg='white' 
      h='8em' 
      borderRadius="lg" 
      boxShadow="md" 
      display="flex" 
      alignItems="center" 
      p={4} 
      {...props} 
    >
      <HStack gap='10'>
        <Heading 
          whiteSpace='pre-wrap' 
          textAlign='start' 
          as='h1' 
          fontSize={{ base: '0.5rem', md: '1rem', lg: '1.5rem' }} 
        >
          {text}
        </Heading>
        <Icon 
          as={icon} 
          w={{ base: '30px', md: '40px', lg: '50px' }} 
          h={{ base: '30px', md: '40px', lg: '50px' }} 
          mr={2} 
        />
      </HStack>
    </Button>
  );
};

DashboardButtons.propTypes = {
    text: PropTypes.string.isRequired, // The text to display on the button
    icon: PropTypes.elementType.isRequired, // The icon component to render
};

export default DashboardButtons;