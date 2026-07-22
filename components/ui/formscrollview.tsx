import React from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ScrollViewProps,
  StyleSheet,
} from "react-native";

type FormScrollViewProps = ScrollViewProps & {
  bottomOffset?: number;
};

const FormScrollView: React.FC<FormScrollViewProps> = ({
  children,
  contentContainerStyle,
  style,
  bottomOffset = 120,
  ...props
}) => {
  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
    >
      <ScrollView
        {...props}
        style={[styles.flex, style]}
        contentContainerStyle={[styles.content, { paddingBottom: bottomOffset }, contentContainerStyle]}
        keyboardShouldPersistTaps="always"
        keyboardDismissMode="none"
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
  },
});

export default FormScrollView;
