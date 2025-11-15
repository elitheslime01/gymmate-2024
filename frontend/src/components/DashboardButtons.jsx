import { Button, Heading, HStack, Icon } from "@chakra-ui/react";
import PropTypes from 'prop-types';


const DashboardButtons = ({ text, icon, ...props }) => {
  return (
    <Button
      bg="white"
      h={{ base: "auto", md: "8em" }}
      borderRadius="lg"
      boxShadow="md"
      display="flex"
      alignItems="center"
      justifyContent="space-between"
      p={{ base: 4, md: 6 }}
      w="full"
      {...props}
    >
      <HStack gap={{ base: 4, md: 10 }} align="center" w="full" justify="space-between">
        <Heading 
          whiteSpace='pre-wrap' 
          textAlign='start' 
          as='h1'
          fontSize={{ base: 'md', md: 'lg', lg: 'xl' }}
        >
          {text}
        </Heading>
        <Icon 
          as={icon} 
          w={{ base: '28px', md: '40px', lg: '48px' }}
          h={{ base: '28px', md: '40px', lg: '48px' }}
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