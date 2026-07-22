import AppText from "@/components/ui/apptext";
import { colors } from "@/constants/colors";
import { helpSupportFaqs, helpSupportContact } from "@/constants/generalconstants";
import { icons } from "@/constants/icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const HelpSupport = () => {
  const topInset = useSafeAreaInsets().top;
  const [expandedFaqId, setExpandedFaqId] = useState<string | null>(
    helpSupportFaqs[0]?.id ?? null
  );

  const openLink = async (url: string) => {
    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) {
      await Linking.openURL(url);
    }
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[
        styles.contentContainer,
        { paddingTop: topInset + 20 },
      ]}
    >
      <Pressable style={styles.backButtonContainer} onPress={() => router.back()}>
        <View style={styles.backIcon}>
          <Image
            source={icons.arrowLeft}
            style={styles.backIconImage}
            tintColor={colors.primary}
          />
        </View>
        <AppText fontFamily="SemiBold" fontSize={14} color="textBold">
          Back
        </AppText>
      </Pressable>

      <View style={styles.introSection}>
        <View style={styles.introIconWrap}>
          <Image
            source={icons.dialog}
            style={styles.introIcon}
            tintColor={colors.primary}
          />
        </View>
        <AppText fontFamily="SemiBold" fontSize={20} color="textBold">
          Help & Support
        </AppText>
        <AppText
          fontFamily="Regular"
          fontSize={14}
          color="textPrimary"
          style={styles.introSubtitle}
        >
          Get answers to common questions or reach our support team.
        </AppText>
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Image
            source={icons.phone}
            style={styles.cardHeaderIcon}
            tintColor={colors.primary}
          />
          <AppText fontFamily="SemiBold" fontSize={17} color="textBold">
            Contact Us
          </AppText>
        </View>

        <View style={styles.cardBody}>
          {helpSupportContact.map((item, index) => {
            const isLast = index === helpSupportContact.length - 1;
            const isActionable = !!item.actionUrl;

            return (
              <Pressable
                key={item.id}
                style={[styles.contactRow, isLast && styles.contactRowLast]}
                disabled={!isActionable}
                onPress={() => item.actionUrl && openLink(item.actionUrl)}
              >
                <AppText fontFamily="Medium" fontSize={14} color="primary">
                  {item.label}
                </AppText>
                <AppText
                  fontFamily="Medium"
                  fontSize={13}
                  color={isActionable ? "formLabelText" : "textPrimary"}
                  style={styles.contactValue}
                >
                  {item.value}
                </AppText>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Image
            source={icons.dialog}
            style={styles.cardHeaderIcon}
            tintColor={colors.primary}
          />
          <AppText fontFamily="SemiBold" fontSize={17} color="textBold">
            Frequently Asked Questions
          </AppText>
        </View>

        <View style={styles.cardBody}>
          {helpSupportFaqs.map((faq, index) => {
            const isExpanded = expandedFaqId === faq.id;
            const isLast = index === helpSupportFaqs.length - 1;

            return (
              <View
                key={faq.id}
                style={[styles.faqItem, isLast && styles.faqItemLast]}
              >
                <Pressable
                  style={styles.faqQuestionRow}
                  onPress={() =>
                    setExpandedFaqId(isExpanded ? null : faq.id)
                  }
                >
                  <AppText
                    fontFamily="Medium"
                    fontSize={14}
                    color="textBold"
                    style={styles.faqQuestion}
                  >
                    {faq.question}
                  </AppText>
                  <Image
                    source={icons.arrowDown}
                    style={[
                      styles.faqChevron,
                      isExpanded && styles.faqChevronExpanded,
                    ]}
                    tintColor={colors.primary}
                  />
                </Pressable>

                {isExpanded ? (
                  <AppText
                    fontFamily="Regular"
                    fontSize={13}
                    color="textPrimary"
                    style={styles.faqAnswer}
                  >
                    {faq.answer}
                  </AppText>
                ) : null}
              </View>
            );
          })}
        </View>
      </View>
    </ScrollView>
  );
};

export default HelpSupport;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.backgroundPrimary,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingBottom: 60,
  },
  backButtonContainer: {
    flexDirection: "row",
    alignSelf: "flex-start",
    alignItems: "center",
    gap: 8,
    marginBottom: 18,
  },
  backIcon: {
    width: 34,
    height: 34,
    borderWidth: 0.85,
    borderRadius: 7,
    borderColor: "#E2E8F0",
    backgroundColor: colors.backgroundPrimary,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3.4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  backIconImage: {
    width: 17,
    height: 17,
  },
  introSection: {
    alignItems: "center",
    marginBottom: 24,
    paddingHorizontal: 12,
  },
  introIconWrap: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: colors.secondaryLight,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  introIcon: {
    width: 24,
    height: 24,
  },
  introSubtitle: {
    marginTop: 8,
    textAlign: "center",
    lineHeight: 20,
  },
  card: {
    padding: 15,
    backgroundColor: colors.backgroundPrimary,
    marginBottom: 18,
    borderRadius: 18,
    width: "100%",
    shadowColor: "rgba(63, 30, 87, 0.10)",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 19,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  cardHeaderIcon: {
    width: 24,
    height: 24,
    marginRight: 12,
  },
  cardBody: {
    gap: 0,
  },
  contactRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    minHeight: 30,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderColor: "#EAECF0",
  },
  contactRowLast: {
    borderBottomWidth: 0,
  },
  contactValue: {
    flex: 1,
    textAlign: "right",
    marginLeft: 12,
    lineHeight: 18,
  },
  faqItem: {
    borderBottomWidth: 1,
    borderColor: "#EAECF0",
    paddingVertical: 10,
  },
  faqItemLast: {
    borderBottomWidth: 0,
    paddingBottom: 0,
  },
  faqQuestionRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  faqQuestion: {
    flex: 1,
    lineHeight: 20,
  },
  faqChevron: {
    width: 16,
    height: 16,
    marginTop: 2,
  },
  faqChevronExpanded: {
    transform: [{ rotate: "180deg" }],
  },
  faqAnswer: {
    marginTop: 8,
    lineHeight: 20,
  },
});
