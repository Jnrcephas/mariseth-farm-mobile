import { colors } from "@/constants/colors";
import { useUniversalStore } from "@/stores/useuniversalstore";
import { FormikProps } from "formik";
import React from "react";
import { Pressable, StyleSheet, TouchableHighlight } from "react-native";
import AppText from "./apptext";
import ModalSelector from "./modalselector";
interface metric {
  id: string | number;
  name: string;
  category_name: string;
  description: string;
  category_type: string;
}

interface metricSelectorProps {
  label: string;
  data?: metric[] | any;
  field: string;
  formik: FormikProps<any>;
}
const MetricSelector: React.FC<metricSelectorProps> = React.memo(
  ({ data, field, formik, label }) => {
    const selectModalVisible = useUniversalStore(
      (state) => state.selectModalVisible
    );

    const selectedItem = React.useMemo(() => {
      return data.find((item: metric) => item.id === formik.values[field]);
    }, [formik.values[field], data]);

    const handleVisibility = (value: boolean) => {
      useUniversalStore.setState((state) => ({
        selectModalVisible: {
          ...state.selectModalVisible,
          [field]: value,
        },
      }));
    };

    const handleSelectItem = (item: metric) => {
      formik.setFieldValue(field, item?.id);
      handleVisibility(false);
    };
    return (
      <>
        {selectModalVisible[field] && (
          <ModalSelector
            visible={selectModalVisible[field]}
            onClose={() => handleVisibility(false)}
            label={label}
            data={data}
            keyExtractor={(item) => item?.id?.toString()}
            renderItem={({ item }: { item: metric }) => (
              <TouchableHighlight
                underlayColor={colors.buttonActionSheet}
                style={[
                  styles.itemButton,
                  item?.id === formik.values[field] && {
                    backgroundColor: colors.buttonActionSheet,
                  },
                ]}
                onPress={() => handleSelectItem(item)}
              >
                <AppText
                  fontFamily="Medium"
                  fontSize={15}
                  color="textBold"
                  style={{ flex: 1 }}
                >
                  {item?.name}
                </AppText>
              </TouchableHighlight>
            )}
            ListEmptyComponent={
              <AppText
                fontFamily="Medium"
                fontSize={15}
                color="textBold"
                style={{ paddingVertical: "10%", textAlign: "center" }}
              >
                {`No ${label} available`}
              </AppText>
            }
          />
        )}
        <Pressable
          style={styles.metricBtn}
          onPress={() => handleVisibility(true)}
        >
          <AppText color="white" fontFamily="Regular" fontSize={17}>
            {selectedItem?.name}
          </AppText>
        </Pressable>
      </>
    );
  }
);

export default MetricSelector;

const styles = StyleSheet.create({
  trigger: {
    marginRight: 10,
    padding: 8,
    backgroundColor: "#f2f2f2",
    borderRadius: 6,
  },
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
  metricBtn: {
    marginRight: 10,
    backgroundColor: colors.primary,
    height: "60%",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 5,
    borderRadius: 5,
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
  itemButton: {
    paddingVertical: 15,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.light,
  },
});
