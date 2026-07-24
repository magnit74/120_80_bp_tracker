'widget';
import React from 'react';
import { View, Text } from 'react-native';
import { createWidget } from 'expo-widgets';

export const BloodPressureWidget = createWidget(
  'BloodPressureWidget',
  (props: { systolic?: number; diastolic?: number; status?: string }) => {
    return (
      <View style={{ flex: 1, padding: 16, backgroundColor: '#ffffff', justifyContent: 'center' }}>
        <Text style={{ fontSize: 10, color: '#9CA3AF', fontWeight: '600' }}>
          LATEST READING
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', marginTop: 4 }}>
          <Text style={{ fontSize: 32, fontWeight: 'bold', color: '#1C1C1E' }}>
            {props.systolic ?? '--'}
          </Text>
          <Text style={{ fontSize: 24, fontWeight: '300', color: '#9CA3AF', marginHorizontal: 2 }}>
            /
          </Text>
          <Text style={{ fontSize: 32, fontWeight: 'bold', color: '#1C1C1E' }}>
            {props.diastolic ?? '--'}
          </Text>
        </View>
        <Text style={{ fontSize: 12, fontWeight: '600', color: '#0F766E', marginTop: 4 }}>
          {props.status ?? 'No Data'}
        </Text>
      </View>
    );
  }
);
