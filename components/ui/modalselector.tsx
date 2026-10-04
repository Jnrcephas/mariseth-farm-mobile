import { colors } from "@/constants/colors";
import { icons } from "@/constants/icons";
import { Image } from "expo-image";
import React, { useState } from "react";
import {
  Modal,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { FadeInDown, FadeOutDown } from "react-native-reanimated";
import Svg, { Path } from "react-native-svg";
import AppText from "./apptext";

interface ModalSelectorProps {
  visible: boolean;
  onClose: () => void;
  label: string;
  data: any[];
  renderItem: (item: any) => React.ReactElement;
  keyExtractor: (item: any, index?: number) => string;
  ListEmptyComponent: React.ReactElement;
  searchable?: boolean;
  searchPlaceholder?: string;
  /**
   * Server-side search. When provided, the typed text is reported here and the
   * list is shown exactly as given (no local filtering) - the caller refetches
   * `data` for the new term. Leave undefined for the normal local filter.
   */
  onQueryChange?: (query: string) => void;
  isLoading?: boolean;
}

const ModalSelector: React.FC<ModalSelectorProps> = ({
  visible,
  onClose,
  label,
  data,
  renderItem,
  keyExtractor,
  ListEmptyComponent,
  searchable = false,
  searchPlaceholder = "Search...",
  onQueryChange,
  isLoading = false,
}) => {
  const [query, setQuery] = useState("");

  const filteredData =
    searchable && !onQueryChange && query.trim()
      ? data.filter((item) =>
          item?.name?.toLowerCase().includes(query.toLowerCase())
        )
      : data;

  const handleQueryChange = (text: string) => {
    setQuery(text);
    onQueryChange?.(text);
  };

  const handleClose = () => {
    setQuery("");
    onQueryChange?.("");
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="none"
      transparent
    >
      <View style={styles.modalBgOverlay}>
        <Animated.View
          entering={FadeInDown.duration(300)}
          exiting={FadeOutDown.duration(250)}
          style={styles.modalContainer}
        >
          <View style={styles.modalContentContainer}>
            <View style={styles.modalHeaderContainer}>
              <AppText
                fontFamily="SemiBold"
                fontSize={17}
                color="textBold"
                style={{ flex: 1 }}
              >
                {label}
              </AppText>
              <TouchableOpacity onPress={handleClose}>
                <Image source={icons.close} style={styles.closeIcon} />
              </TouchableOpacity>
            </View>

            {searchable && (
              <View style={styles.searchContainer}>
                <Svg
                  width={16}
                  height={16}
                  viewBox="0 0 24 24"
                  fill="none"
                  style={{ marginRight: 8 }}
                >
                  <Path
                    d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"
                    stroke={colors.formPlaceholderText}
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </Svg>
                <TextInput
                  style={styles.searchInput}
                  placeholder={searchPlaceholder}
                  placeholderTextColor={colors.formPlaceholderText}
                  value={query}
                  onChangeText={handleQueryChange}
                  autoCorrect={false}
                  autoCapitalize="none"
                  clearButtonMode="while-editing"
                />
              </View>
            )}

            <Animated.FlatList
              entering={FadeInDown.duration(500)}
              exiting={FadeOutDown.duration(650)}
              data={filteredData}
              keyExtractor={keyExtractor}
              renderItem={renderItem}
              keyboardShouldPersistTaps="handled"
              ListEmptyComponent={
                isLoading ? (
                  <AppText
                    fontFamily="Medium"
                    fontSize={15}
                    color="textPrimary"
                    style={{ paddingVertical: "10%", textAlign: "center" }}
                  >
                    Loading...
                  </AppText>
                ) : searchable && query.trim() ? (
                  <AppText
                    fontFamily="Medium"
                    fontSize={15}
                    color="textBold"
                    style={{ paddingVertical: "10%", textAlign: "center" }}
                  >
                    No results for "{query}"
                  </AppText>
                ) : (
                  ListEmptyComponent
                )
              }
            />
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBgOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.overlayDark,
    position: "absolute",
    width: "100%",
    height: "100%",
    zIndex: 999999,
  },
  modalContainer: {
    paddingHorizontal: 16,
    width: "100%",
    height: "50%",
  },
  modalHeaderContainer: {
    paddingBottom: 17,
    width: "100%",
    flexDirection: "row",
    justifyContent: "center",
    borderBottomWidth: 1,
    borderBottomColor: colors.formBorder,
    paddingHorizontal: 16,
  },
  modalContentContainer: {
    backgroundColor: colors.white,
    borderRadius: 16,
    paddingTop: 16,
    paddingBottom: 20,
  },
  closeIcon: {
    width: 24,
    height: 24,
    tintColor: colors.primary,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 4,
    paddingHorizontal: 12,
    height: 40,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.formBorder,
    backgroundColor: colors.backgroundPrimary,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontFamily: "Regular",
    color: colors.formInputText,
    paddingVertical: 0,
  },
  itemButton: {
    paddingVertical: 15,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.light,
  },
});

export default ModalSelector;