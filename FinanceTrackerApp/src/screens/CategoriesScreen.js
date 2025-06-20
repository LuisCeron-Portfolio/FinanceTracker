import React, { useState, useEffect } from 'react';
import { Box, Button, Input, VStack, Text, useToast } from 'native-base';
import CategoryList from '../components/CategoryList';
import { saveData, getData } from '../utils/storage';

const STORAGE_KEY = 'categories';

const defaultCategories = [
  { id: 1, name: 'Food' },
  { id: 2, name: 'Transport' },
  { id: 3, name: 'Entertainment' },
  { id: 4, name: 'Utilities' },
  { id: 5, name: 'Health' },
];

export default function CategoriesScreen() {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState('');
  const toast = useToast();

  useEffect(() => {
    const loadCategories = async () => {
      const storedCategories = await getData(STORAGE_KEY);
      if (storedCategories && storedCategories.length > 0) {
        setCategories(storedCategories);
      } else {
        setCategories(defaultCategories);
      }
    };
    loadCategories();
  }, []);

  const addCategory = async () => {
    if (newCategory.trim() === '') {
      toast.show({ description: 'Category name cannot be empty' });
      return;
    }
    const exists = categories.some(
      (cat) => cat.name.toLowerCase() === newCategory.trim().toLowerCase()
    );
    if (exists) {
      toast.show({ description: 'Category already exists' });
      return;
    }
    const newCat = {
      id: Date.now(),
      name: newCategory.trim(),
    };
    const updatedCategories = [...categories, newCat];
    setCategories(updatedCategories);
    await saveData(STORAGE_KEY, updatedCategories);
    setNewCategory('');
    toast.show({ description: 'Category added' });
  };

  const deleteCategory = async (id) => {
    const updatedCategories = categories.filter((cat) => cat.id !== id);
    setCategories(updatedCategories);
    await saveData(STORAGE_KEY, updatedCategories);
    toast.show({ description: 'Category deleted' });
  };

  return (
    <Box flex={1} bg="gray.900" p={4}>
      <VStack space={4}>
        <Text color="white" fontSize="2xl" fontWeight="bold">
          Categories
        </Text>
        <CategoryList
          categories={categories}
          onSelectCategory={(cat) => toast.show({ description: `Selected: ${cat.name}` })}
          onDeleteCategory={deleteCategory}
        />
        <Input
          placeholder="New category"
          value={newCategory}
          onChangeText={setNewCategory}
          bg="gray.800"
          color="white"
          borderRadius="md"
        />
        <Button onPress={addCategory} colorScheme="blue">
          Add Category
        </Button>
      </VStack>
    </Box>
  );
}
