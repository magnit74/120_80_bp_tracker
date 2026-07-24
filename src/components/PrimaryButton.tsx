import React from 'react';
import { TouchableOpacity, Text, StyleSheet, TouchableOpacityProps } from 'react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';

interface PrimaryButtonProps extends TouchableOpacityProps {
  title: string;
}

export const PrimaryButton: React.FC<PrimaryButtonProps> = ({ title, style, disabled, ...props }) => {
  return (
    <TouchableOpacity 
      style={[
        styles.button, 
        disabled && styles.disabled,
        style
      ]} 
      activeOpacity={0.8}
      disabled={disabled}
      {...props}
    >
      <Text style={[styles.text, disabled && styles.textDisabled]}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.primary,
    paddingVertical: 20,
    paddingHorizontal: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: {
    backgroundColor: colors.border,
  },
  text: {
    ...typography.button,
    color: colors.white,
  },
  textDisabled: {
    color: colors.textLight,
  },
});
