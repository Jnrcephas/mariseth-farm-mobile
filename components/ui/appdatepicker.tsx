import { colors } from "@/constants/colors";
import { isIOS, largeScreen } from "@/constants/generalconstants";
import { icons } from "@/constants/icons";
import { useUniversalStore } from "@/stores/useuniversalstore";
import { format, set, subYears } from "date-fns";
import { Image } from "expo-image";
import { FormikProps } from "formik";
import React from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { FadeInDown, FadeOutDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import DateTimePicker, { useDefaultStyles } from "react-native-ui-datepicker";
import AppButton from "./appbutton";
import AppText from "./apptext";
interface appDatePickerprops {
  formik: FormikProps<any>;
  label?: string;
  field: string;
  value: string;
  placeholder?: string;
  minDate?: Date | null;
  maxDate?: Date | null;
  initialDate?: Date;
}

const AppDatePicker: React.FC<appDatePickerprops> = ({
  formik,
  label = "Date of Birth",
  field,
  value,
  placeholder = "dd-mm-yyy",
  minDate = new Date(1919, 0, 1),
  maxDate = set(subYears(new Date(), 7), { month: 11 }),
  initialDate = subYears(new Date(), 7),
}) => {
  const AnimatedButton = Animated.createAnimatedComponent(TouchableOpacity);
  const inset = useSafeAreaInsets();
  const defaultStyles = useDefaultStyles("light");

  // const minDate = new Date(1919, 0, 1);
  // const maxDate = set(subYears(new Date(), 7), { month: 11 });
  // const initialDate = subYears(new Date(), 7);
  const [date, setDate] = React.useState(initialDate);
  const datePickerVisible = useUniversalStore(
    (state) => state.datePickerVisible
  );
  const hasError = formik.touched[field] && formik.errors[field];
  return (
    <>
      {datePickerVisible ? (
        <Modal
          visible={datePickerVisible}
          animationType="none"
          transparent
          navigationBarTranslucent
          statusBarTranslucent
        >
          <View style={styles.modalBgOverlay}>
            <TouchableOpacity
              // entering={FadeInDown.duration(300)}
              // exiting={FadeOutDown.duration(250)}
              onPress={() => {
                useUniversalStore.setState({ datePickerVisible: false });
              }}
              style={{
                backgroundColor: colors.white,
                padding: 6,
                borderRadius: 20,
                marginBottom: "25%",
              }}
            >
              <Image
                source={icons.close}
                style={{
                  width: 28,
                  height: 28,
                  tintColor: colors.primary,
                }}
              />
            </TouchableOpacity>
            <Animated.View
              style={{ paddingHorizontal: 16 }}
              entering={FadeInDown.duration(300)}
              exiting={FadeOutDown.duration(250)}
            >
              <View style={styles.datePickerContainer}>
                <DateTimePicker
                  mode="single"
                  date={date}
                  minDate={minDate}
                  maxDate={maxDate}
                  onChange={(params: any) => {
                    setDate(params.date);
                  }}
                  styles={{
                    ...defaultStyles,

                    today: styles.today,
                    selected: styles.selected,
                    selected_label: styles.selectedLabel,
                    today_label: styles.todayLabel,
                    day_label: styles.textLabel,
                    month_label: styles.textLabel,
                    year_label: styles.textLabel,
                    weekday_label: styles.textLabel,
                    outside_label: styles.textLabel,
                    active_year_label: styles.activeYearLabel,
                    selected_year: styles.selectedItem,
                    selected_month: styles.selectedItem,
                    header: { fontFamily: "Bold" },

                    button_next_image: {
                      tintColor: colors.primary,
                      fontFamily: "Bold",
                    },
                    button_prev_image: {
                      tintColor: colors.primary,
                      fontFamily: "Bold",
                    },
                  }}
                />
              </View>
              <View
                style={[
                  styles.datePickerButtonContainer,
                  { marginBottom: inset.bottom + (isIOS ? 10 : 16) },
                ]}
              >
                <AppButton
                  title="Add Date"
                  textColor="white"
                  btnColor="buttonPrimary"
                  fontSize={14}
                  // width={"46%"}
                  height={48}
                  onPress={() => {
                    const new_date = format(date, "yyyy-MM-dd");
                    formik?.setFieldValue(field, new_date);
                    useUniversalStore.setState({ datePickerVisible: false });
                  }}
                />

                {/* <AppButton
                  title="Close"
                  textColor="primary"
                  btnColor="white"
                  width={"46%"}
                  fontSize={14}
                  height={48}
                  onPress={() => {
                    useUniversalStore.setState({ datePickerVisible: false });
                  }}
                /> */}
              </View>
            </Animated.View>
          </View>
        </Modal>
      ) : null}
      <View style={{ width: "100%" }}>
        <View
          style={{
            flexDirection: "row",
            marginBottom: 8,
          }}
        >
          <AppText
            fontSize={14}
            fontFamily="SemiBold"
            color="formLabelText"
            style={{}}
          >
            {label}
          </AppText>

          <AppText
            fontSize={14}
            color="error"
            fontFamily="SemiBold"
            style={{ marginLeft: 4 }}
          >
            *
          </AppText>
        </View>
        <Pressable
          onPress={() =>
            useUniversalStore.setState({ datePickerVisible: true })
          }
          style={[
            styles.datePickerButton,
            {
              borderColor: hasError ? colors.error : colors.formBorder,
            },
          ]}
        >
          <AppText
            fontSize={17}
            fontFamily="Regular"
            color="formInputText"
            style={{ flex: 1 }}
          >
            {value ? value : placeholder}
          </AppText>
          <Image
            source={icons.calendar}
            style={{
              width: 24,
              height: 24,
              tintColor: hasError ? colors.error : colors.formBorder,
            }}
          />
        </Pressable>
      </View>
    </>
  );
};

export default AppDatePicker;

const styles = StyleSheet.create({
  datePickerContainer: {
    borderWidth: 1,
    borderColor: colors.grey,
    borderRadius: 16,
    padding: 16,
    backgroundColor: colors.white,
  },
  datePickerButton: {
    width: "100%",
    borderRadius: 10,
    borderWidth: 1,
    height: largeScreen ? 54 : 49,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
  },

  today: {
    borderColor: colors.primary,
    borderWidth: 1,
  },
  selected: {
    backgroundColor: colors.primary,
  },
  selectedLabel: {
    color: colors.white,
  },
  todayLabel: {
    color: colors.primary,
    fontFamily: "Regular",
  },
  textLabel: {
    color: colors.textBold,
    fontFamily: "Regular",
  },
  activeYearLabel: {
    color: colors.primary,
    fontFamily: "Regular",
  },
  selectedItem: {
    backgroundColor: colors.primary,
  },
  datePickerButtonContainer: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 30,
  },
  modalBgOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
    backgroundColor: colors.overlayDark,
    position: "absolute",
    width: "100%",
    height: "100%",
    zIndex: 999999,
  },
});
