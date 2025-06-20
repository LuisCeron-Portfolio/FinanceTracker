import React from 'react';
import { Box, Text, VStack, Button } from 'native-base';

export default function HomeScreen({ navigation }) {
  return (
    <Box flex={1} bg="gray.900" alignItems="center" justifyContent="center" p={4}>
      <VStack space={4} alignItems="center" width="100%">
        <Text color="white" fontSize="2xl" fontWeight="bold">
          Finance Tracker Home
        </Text>
        <Text color="gray.400" fontSize="md" textAlign="center" mb={8}>
          Welcome to your personal finance management app.
        </Text>
        <Button onPress={() => navigation.navigate('Categories')} colorScheme="blue" width="60%">
          Manage Categories
        </Button>
        <Button onPress={() => navigation.navigate('Dashboard')} colorScheme="green" width="60%" mt={4}>
          View Dashboard
        </Button>
      </VStack>
    </Box>
  );
}
