import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { PieChart, BarChart, LineChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width;

interface ChartCardProps {
  title: string;
  type: 'pie' | 'bar' | 'line';
  data: any;
  height?: number;
}

export default function ChartCard({ title, type, data, height = 220 }: ChartCardProps) {
  const chartConfig = {
    backgroundColor: '#1E293B',
    backgroundGradientFrom: '#1E293B',
    backgroundGradientTo: '#334155',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(148, 163, 184, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: '#3B82F6',
    },
  };

  const renderChart = () => {
    switch (type) {
      case 'pie':
        return (
          <PieChart
            data={data}
            width={screenWidth - 60}
            height={height}
            chartConfig={chartConfig}
            accessor="amount"
            backgroundColor="transparent"
            paddingLeft="15"
            center={[10, 10]}
            absolute
          />
        );
      case 'bar':
        return (
          <BarChart
            data={data}
            width={screenWidth - 60}
            height={height}
            chartConfig={chartConfig}
            verticalLabelRotation={30}
            yAxisLabel="$"
            showValuesOnTopOfBars
          />
        );
      case 'line':
        return (
          <LineChart
            data={data}
            width={screenWidth - 60}
            height={height}
            chartConfig={chartConfig}
            bezier
            style={{
              marginVertical: 8,
              borderRadius: 16,
            }}
          />
        );
      default:
        return <Text style={styles.errorText}>Unsupported chart type</Text>;
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.chartContainer}>
        {renderChart()}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#F1F5F9',
    marginBottom: 16,
    textAlign: 'center',
  },
  chartContainer: {
    alignItems: 'center',
  },
  errorText: {
    color: '#EF4444',
    textAlign: 'center',
    fontSize: 16,
  },
});