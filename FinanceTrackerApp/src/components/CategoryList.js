import React from 'react';
import { FlatList, TouchableOpacity } from 'react-native';
import { Box, Text, HStack, Icon } from 'native-base';
import { MaterialIcons } from '@expo/vector-icons';

export default function CategoryList({ categories, onSelectCategory, onDeleteCategory }) {
  const renderItem = ({ item }) => (
    <TouchableOpacity onPress={() => onSelectCategory(item)}>
      <Box
        bg="gray.800"
        p={4}
        my={1}
        borderRadius="md"
        flexDirection="row"
        alignItems="center"
        justifyContent="space-between"
      >
        <Text color="white" fontSize="md">
          {item.name}
        </Text>
        {onDeleteCategory && (
          <TouchableOpacity onPress={() => onDeleteCategory(item.id)}>
            <Icon as={MaterialIcons} name="delete" size="sm" color="red.500" />
          </TouchableOpacity>
        )}
      </Box>
    </TouchableOpacity>
  );

  return (
    <FlatList
      data={categories}
      keyExtractor={(item) => item.id.toString()}
      renderItem={renderItem}
    />
  );
}
