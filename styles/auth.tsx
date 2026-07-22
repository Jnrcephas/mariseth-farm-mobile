import { StyleSheet } from "react-native";

export const authStyles = StyleSheet.create({
  welcomeContainer: {
    flex: 1,
    paddingHorizontal: 18,
    flexDirection: "column",
    justifyContent: "flex-end",
  },
  container: {
    paddingHorizontal: 18,
    paddingTop: "15%",
  },
  logo: {
    width: 80,
    height: 105,
    alignSelf: "center",
    marginBottom: 22,
  },
  buttonContainer: {
    position: "absolute",
    width: "100%",
    paddingHorizontal: 18,
    pointerEvents: "box-none",
  },

  blur: {
    paddingHorizontal: 16,
    paddingVertical: 18,
    overflow: "hidden",
    borderRadius: 20,
    marginBottom: 27,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.22)",
    backgroundColor: "transparent",
  },
  androidGlass: {
    backgroundColor: "rgba(15, 23, 42, 0.38)",
  },
  welcomeButton: {
    shadowColor: "#101828",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  welcomeFooter: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
    gap: 4,
  },
  authButton: {
    shadowColor: "#101828",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  authFooter: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
    gap: 4,
  },
  countryCodeSelector: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 8,
    gap: 2,
  },
  countryCodeIcon: {
    width: 24,
    height: 24,
    tintColor: "#4A8D34",
  },
  authBackButton: {
    position: "absolute",
    zIndex: 10,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#E2E8F0",
    justifyContent: "center",
    alignItems: "center",
  },
  otpContainer: {
    paddingHorizontal: 18,
    paddingTop: 52,
  },
  pinContainer: {
    paddingHorizontal: 18,
    paddingTop: 54,
  },
  authLoadingCard: {
    paddingHorizontal: 14,
    paddingTop: 15,
    paddingBottom: 20,
    overflow: "hidden",
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  splashContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffffff",
  },
  splashLogo: {
    width: 166,
    height: 218,
  },
});
