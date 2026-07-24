import React from 'react';
import { TouchableOpacity, Text, StyleSheet, TouchableOpacityProps } from 'react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';

interface SecondaryButtonProps extends TouchableOpacityProps {
  title: string;
}

export const SecondaryButton: React.FC<SecondaryButtonProps> = ({ title, style, disabled, ...props }) => {
  return (
    <TouchableOpacity 
      style={[
        styles.button, 
        disabled && styles.disabled,
        style
      ]} 
      activeOpacity={0.7}
      disabled={disabled}
      {...props}
    >
      <Text style={[styles.text, disabled && styles.textDisabled]}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.background,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  disabled: {
    borderColor: colors.borderLight,
    backgroundColor: colors.cardWarm,
  },
  text: {
    ...typography.button,
    color: colors.textDark,
  },
  textDisabled: {
    color: colors.textLight,
  },
});
