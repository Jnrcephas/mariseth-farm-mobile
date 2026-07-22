import { colors } from "@/constants/colors";
import { booleanOptions } from "@/constants/generalconstants";
import { userStore } from "@/stores/userstore";
import { smallHolder } from "@/types/farmers";
import { FormikProps } from "formik";
import React from "react";
import { StyleSheet, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AppButton from "./appbutton";
import AppText from "./apptext";
import AppTextInput from "./apptextinput";
import ApplyForSelector, { ApplyForOption } from "./applyforselector";
import FarmProductsSelector from "./farmproductsselector";
import FormErrorMessage from "./formerrormessage";
import MetricSelector from "./metricselector";
import RegionSelector from "./regionselector";
import Select from "./select";
import SelectModal from "./selectmodal";
import SmallFarmerCard from "./smallfarmercard";

interface farmFormProps {
  formik: FormikProps<any>;
  isLoading: boolean;
  type?: "add" | "edit";
  districts: { id: number; name: string }[];
  isLeaderFarmer?: boolean;
  recentlyAddedFarmers?: smallHolder[];
}

const FarmForm: React.FC<farmFormProps> = ({
  formik,
  isLoading,
  type = "edit",
  districts,
  isLeaderFarmer = false,
  recentlyAddedFarmers = [],
}) => {
  const bottomInset = useSafeAreaInsets().bottom;
  const isAddMode = type === "add";
  const isMyFarmer = formik.values.apply_for === "my_farmer";

  const regions = userStore((state) => state.regions);
  const metrics = userStore.getState().metrics;
  const farmProducts = userStore.getState().farmProducts;
  const sizeMetrics = metrics.filter(
    (metric) => metric.category_name === "size_metric"
  );
  const cropProducts = farmProducts.filter(
    (product) => product.type === "crop"
  );
  const livestockProducts = farmProducts.filter(
    (product) => product.type === "other"
  );

  const toggleFarmerSelection = (farmerId: number) => {
    const currentIds = formik.values.farmer_ids ?? [];
    const nextIds = currentIds.includes(farmerId)
      ? currentIds.filter((id: number) => id !== farmerId)
      : [...currentIds, farmerId];

    formik.setFieldValue("farmer_ids", nextIds);
    formik.setFieldTouched("farmer_ids", true, false);
  };

  return (
    <View style={styles.screen}>
      <KeyboardAwareScrollView
        extraHeight={100}
        extraScrollHeight={100}
        enableOnAndroid={true}
        keyboardShouldPersistTaps="always"
        keyboardDismissMode="none"
        bounces={false}
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          isAddMode && styles.addScrollContent,
        ]}
      >
        <View style={styles.formSection}>
          {isAddMode && isLeaderFarmer ? (
            <>
              <ApplyForSelector
                value={formik.values.apply_for as ApplyForOption}
                onChange={(value) => {
                  formik.setFieldValue("apply_for", value);
                  formik.setFieldValue("farmer_ids", []);
                }}
              />
              <FormErrorMessage
                error={
                  (formik.touched.apply_for &&
                    formik.errors.apply_for) as string
                }
              />
            </>
          ) : null}

          <AppTextInput
            error={formik.errors.name}
            label="Farm Name"
            style={{
              backgroundColor: isLoading
                ? colors.backgroundTertiary
                : colors.backgroundPrimary,
            }}
            required
            value={formik.values.name}
            autoCapitalize="none"
            autoCorrect={false}
            editable={!isLoading}
            keyboardType="default"
            onBlur={() => formik.setFieldTouched("name")}
            onChangeText={formik.handleChange("name")}
          />

          <FormErrorMessage error={formik.errors.name as string} />

          <AppTextInput
            error={formik.touched.location && formik.errors.location}
            label="Location (GPS Coordinates if available)"
            style={{
              backgroundColor: isLoading
                ? colors.backgroundTertiary
                : colors.backgroundPrimary,
            }}
            required={true}
            value={formik.values.location}
            autoCapitalize="none"
            autoCorrect={false}
            editable={!isLoading}
            keyboardType="default"
            onBlur={() => formik.setFieldTouched("location")}
            onChangeText={formik.handleChange("location")}
          />

          <FormErrorMessage
            error={
              (formik.touched.location && formik.errors.location) as string
            }
          />

          <RegionSelector
            label="Region"
            placeholder="Select region"
            data={regions}
            field="region"
            formik={formik}
            value={formik.values.region}
          />

          <FormErrorMessage
            error={(formik.touched.region && formik.errors.region) as string}
          />

          <RegionSelector
            label="District"
            placeholder="Select District"
            data={districts}
            field="district"
            formik={formik}
            value={formik.values.district}
          />

          <FormErrorMessage error={formik.errors.district} />

          <AppTextInput
            error={formik.touched.size && formik.errors.size}
            label="Total Land Size"
            style={{
              backgroundColor: isLoading
                ? colors.backgroundTertiary
                : colors.backgroundPrimary,
            }}
            required={true}
            value={formik.values.size}
            autoCapitalize="none"
            autoCorrect={false}
            editable={!isLoading}
            keyboardType="numeric"
            onBlur={() => formik.setFieldTouched("size")}
            onChangeText={formik.handleChange("size")}
            leftComponent={
              <MetricSelector
                label="Size Metric"
                formik={formik}
                data={sizeMetrics}
                field="size_metric"
              />
            }
          />

          <FormErrorMessage
            error={(formik.touched.size && formik.errors.size) as string}
          />

          <SelectModal
            label={"Land Ownership"}
            placeholder={"Select"}
            data={["Owned", "Leased", "Communal", "Rented"]}
            field={"land_ownership"}
            formik={formik}
            value={formik.values.land_ownership}
          />

          <FormErrorMessage
            error={
              (formik.touched.land_ownership &&
                formik.errors.land_ownership) as string
            }
          />

          <FarmProductsSelector
            label="Main Crops"
            placeholder="Select"
            data={cropProducts}
            field="crops"
            formik={formik}
            value={formik.values.crops}
            required={false}
          />

          <FormErrorMessage
            error={(formik.touched.crops && formik.errors.crops) as string}
          />

          <FarmProductsSelector
            label="Other Products"
            placeholder="Select"
            data={livestockProducts}
            field="livestock"
            formik={formik}
            value={formik.values.livestock}
            required={false}
          />

          <FormErrorMessage
            error={
              (formik.touched.livestock && formik.errors.livestock) as string
            }
          />

          <SelectModal
            label={"Use of Fertilizers"}
            placeholder={"Select"}
            data={["Chemical", "Organic", "None"]}
            field={"use_of_fertilizers"}
            formik={formik}
            value={formik.values.use_of_fertilizers}
          />

          <FormErrorMessage
            error={
              (formik.touched.use_of_fertilizers &&
                formik.errors.use_of_fertilizers) as string
            }
          />

          <SelectModal
            label={"Farming Methods"}
            placeholder={"Select"}
            data={["Organic", "Conventional", "Mixed"]}
            field={"farming_methods"}
            formik={formik}
            value={formik.values.farming_methods}
          />

          <FormErrorMessage
            error={
              (formik.touched.farming_methods &&
                formik.errors.farming_methods) as string
            }
          />

          <Select
            label="Irrigation"
            data={booleanOptions}
            formik={formik}
            field="irrigation"
          />

          <FormErrorMessage
            error={
              (formik.touched.irrigation && formik.errors.irrigation) as string
            }
          />

          <Select
            label="Access to Market"
            data={booleanOptions}
            formik={formik}
            field="has_access_to_market"
          />

          <FormErrorMessage
            error={
              (formik.touched.has_access_to_market &&
                formik.errors.has_access_to_market) as string
            }
          />
        </View>

        {isAddMode && isLeaderFarmer && recentlyAddedFarmers.length > 0 ? (
          <View style={styles.recentlyAddedSection}>
            <AppText fontFamily="SemiBold" fontSize={16} color="black">
              Recently Added
            </AppText>

            <View style={styles.recentlyAddedList}>
              {recentlyAddedFarmers.map((item, index) => (
                <SmallFarmerCard
                  key={item.id}
                  item={item}
                  showNewBadge={!isMyFarmer && index < 5}
                  showCheckbox={isMyFarmer}
                  checked={(formik.values.farmer_ids ?? []).includes(item.id)}
                  onCheckToggle={() => toggleFarmerSelection(item.id)}
                />
              ))}
            </View>

            <FormErrorMessage
              error={
                (formik.touched.farmer_ids &&
                  formik.errors.farmer_ids) as string
              }
            />
          </View>
        ) : null}
      </KeyboardAwareScrollView>

      <View style={[styles.footer, { paddingBottom: bottomInset + 23 }]}>
        <AppButton
          title={isAddMode ? "Add Farm" : "Save Changes"}
          textColor="white"
          btnColor="buttonPrimary"
          borderRadius={8}
          onPress={formik.submitForm}
          loading={isLoading}
          disabled={!(formik.isValid && formik.dirty)}
        />
      </View>
    </View>
  );
};

export default FarmForm;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.backgroundPrimary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 120,
  },
  addScrollContent: {
    gap: 32,
  },
  formSection: {
    gap: 24,
  },
  recentlyAddedSection: {
    gap: 12,
  },
  recentlyAddedList: {
    width: "100%",
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.white,
    paddingTop: 23,
    paddingHorizontal: 18,
  },
});
