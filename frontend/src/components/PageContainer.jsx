import PropTypes from "prop-types";
import {
  Box,
  Flex,
  Heading,
  IconButton,
  useToken,
} from "@chakra-ui/react";
import { HamburgerIcon } from "@chakra-ui/icons";

const PageContainer = ({
  title,
  actions,
  children,
  onOpenMenu,
  maxWidth = "1280px",
  contentProps,
  headerProps,
}) => {
  const [shadow] = useToken("shadows", ["md"]);

  return (
    <Flex direction="column" flex="1" minH="100vh" bg="gray.100">
      <Box
        as="header"
        bg="white"
        boxShadow={shadow}
        px={{ base: 4, md: 6, lg: 8 }}
        py={{ base: 3, md: 4 }}
        position="sticky"
        top={0}
        zIndex="sticky"
        {...headerProps}
      >
        <Flex align="center" justify="space-between" gap={{ base: 2, md: 4 }}>
          <Flex align="center" gap={3} flex="1">
            {onOpenMenu && (
              <IconButton
                aria-label="Open navigation"
                icon={<HamburgerIcon />}
                variant="ghost"
                display={{ base: "inline-flex", lg: "none" }}
                onClick={onOpenMenu}
                size="md"
              />
            )}
            <Heading
              as="h1"
              size={{ base: "md", md: "lg" }}
              color="#071434"
              noOfLines={2}
            >
              {title}
            </Heading>
          </Flex>
          {actions && (
            <Flex align="center" justify="flex-end" gap={2}>
              {actions}
            </Flex>
          )}
        </Flex>
      </Box>

      <Box
        as="main"
        flex="1"
        w="full"
        mx="auto"
        maxW={maxWidth}
        px={{ base: 4, md: 6, lg: 8 }}
        py={{ base: 4, md: 6, lg: 8 }}
        {...contentProps}
      >
        {children}
      </Box>
    </Flex>
  );
};

PageContainer.propTypes = {
  title: PropTypes.string.isRequired,
  actions: PropTypes.node,
  children: PropTypes.node.isRequired,
  onOpenMenu: PropTypes.func,
  maxWidth: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  contentProps: PropTypes.object,
  headerProps: PropTypes.object,
};

export default PageContainer;
