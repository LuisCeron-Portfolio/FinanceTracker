import React, { useState, useEffect } from 'react';
import { Box, Text, ScrollView, VStack } from 'native-base';
import { Dimensions } from 'react-native';
import {
  BarChart,
  PieChart,
  LineChart,
} from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width;

const chartConfig = {
  backgroundGradientFrom: '#1E293B',
  backgroundGradientTo: '#1E293B',
  color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(203, 213, 225, ${opacity})`,
  strokeWidth: 2,
  barPercentage: 0.5,
  useShadowColorFromDataset: false,
};

export default function DashboardScreen() {
  // Sample data for charts
  const [barData, setBarData] = useState({
    labels: ['Food', 'Transport', 'Entertainment', 'Utilities', 'Health'],
    datasets: [{ data: [200, 150, 100, 80, 50] }],
  });

  const [pieData, setPieData] = useState([
    { name: 'Food', population: 200, color: '#3B82F6', legendFontColor: '#E0E7FF', legendFontSize: 14 },
    { name: 'Transport', population: 150, color: '#2563EB', legendFontColor: '#E0E7FF', legendFontSize: 14 },
    { name: 'Entertainment', population: 100, color: '#1D4ED8', legendFontColor: '#E0E7FF', legendFontSize: 14 },
    { name: 'Utilities', population: 80, color: '#1E40AF', legendFontColor: '#E0E7FF', legendFontSize: 14 },
    { name: 'Health', population: 50, color: '#1E3A8A', legendFontColor: '#E0E7FF', legendFontSize: 14 },
  ]);

  const [lineData, setLineData] = useState({
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        data: [500, 600, 550, 700, 650, 800],
        color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
        strokeWidth: 2,
      },
    ],
  });

  return (
    <Box flex={1} bg="gray.900" p={4}>
      <ScrollView>
        <VStack space={8}>
          <Text color="white" fontSize="2xl" fontWeight="bold" mb={2}>
            Dashboard
          </Text>

          <Text color="white" fontSize="lg" mb={2}>
            Expenses by Category (Bar Chart)
          </Text>
          <BarChart
            data={barData}
            width={screenWidth - 32}
            height={220}
            chartConfig={chartConfig}
            verticalLabelRotation={30}
            style={{ borderRadius: 16 }}
          />

          <Text color="white" fontSize="lg" mb={2} mt={8}>
            Expenses by Category (Pie Chart)
          </Text>
          <PieChart
            data={pieData}
            width={screenWidth - 32}
            height={220}
            chartConfig={chartConfig}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="15"
            absolute
          />

          <Text color="white" fontSize="lg" mb={2} mt={8}>
            Monthly Spending Trend (Line Chart)
          </Text>
          <LineChart
            data={lineData}
            width={screenWidth - 32}
            height={220}
            chartConfig={chartConfig}
            bezier
            style={{ borderRadius: 16 }}
          />
        </VStack>
      </ScrollView>
    </Box>
  );
}
