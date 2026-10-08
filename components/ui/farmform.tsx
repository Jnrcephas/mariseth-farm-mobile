import { colors } from "@/constants/colors";
import { booleanOptions } from "@/constants/generalconstants";
import { userStore } from "@/stores/userstore";
import { smallHolder } from "@/types/farmers";
import { FormikProps } from "formik";
import React, { useState } from "react";
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
import { BoundaryPoint } from "./farmboundarycapture";
import FarmBoundaryEditor from "./farmboundaryeditor";
import { sqMetresToAcres, sqMetresToHectares } from "@/utils/geometry";
import RemoteSelector from "./remoteselector";
import { endpoints } from "@/constants/endpoints";
import {
  LAND_OWNERSHIP_LEGACY_OPTIONS,
  LAND_OWNERSHIP_WEB_OPTIONS,
} from "@/constants/farmform";

interface farmFormProps {
  formik: FormikProps<any>;
  isLoading: boolean;
  type?: "add" | "edit";
  districts: { id: number; name: string }[];
  isLeaderFarmer?: boolean;
  /** Field officers always assign the farm to a farmer they've onboarded -
   * they have no farm of their own, so they get the farmer picker below
   * but never the "myself" vs "my farmer" toggle (see isLeaderFarmer). */
  isFieldOfficer?: boolean;
  recentlyAddedFarmers?: smallHolder[];
  /** Use the web/admin-endpoint option set (land ownership incl. "Other").
   * True for field officers adding and for every edit; false keeps the
   * lead-farmer add flow exactly as it was. */
  webFormat?: boolean;
}

const FarmForm: React.FC<farmFormProps> = ({
  formik,
  isLoading,
  type = "edit",
  districts,
  isLeaderFarmer = false,
  isFieldOfficer = false,
  recentlyAddedFarmers = [],
  webFormat = false,
}) => {
  const bottomInset = useSafeAreaInsets().bottom;
  const isAddMode = type === "add";
  const isMyFarmer = formik.values.apply_for === "my_farmer";
  const isOtherOwnership =
    String(formik.values.land_ownership ?? "").toLowerCase() === "other";
  const showSubmitHint = formik.submitCount > 0 && !formik.isValid;

  // Measured height of the absolutely-positioned footer, so the scroll
  // content can reserve exactly enough space and nothing ends up hidden
  // underneath it. Starts with a reasonable fallback before first layout.
  const [footerHeight, setFooterHeight] = useState(120);

  const regions = userStore((state) => state.regions);
  const metrics = userStore.getState().metrics;
  const farmProducts = userStore.getState().farmProducts;
  const sizeMetrics = metrics.filter(
    (metric) => metric.category_name === "size_metric"
  );

  // "Use mapped area as farm size": converts the drawn boundary's area into
  // whichever size unit (hectares / acres) the farm already uses, falling back
  // to hectares then acres. Returns a message for the boundary editor to show,
  // or null if no hectare/acre metric exists to apply it to.
  const handleUseMappedArea = (areaSqMetres: number): string | null => {
    const unitOf = (name?: string) => {
      const n = String(name ?? "").trim().toLowerCase();
      if (n.includes("acre")) return "acre";
      if (n.includes("hectare") || /^ha\b/.test(n)) return "hectare";
      return null;
    };
    const current = sizeMetrics.find(
      (metric) => metric.id === formik.values.size_metric
    );
    const metric =
      (unitOf(current?.name) ? current : undefined) ??
      sizeMetrics.find((m) => unitOf(m.name) === "hectare") ??
      sizeMetrics.find((m) => unitOf(m.name) === "acre");
    if (!metric) return null;

    const value =
      unitOf(metric.name) === "acre"
        ? sqMetresToAcres(areaSqMetres)
        : sqMetresToHectares(areaSqMetres);
    const rounded = Math.round(value * 100) / 100;
    formik.setFieldValue("size_metric", metric.id);
    formik.setFieldValue("size", String(rounded));
    return `Farm size set to ${rounded} ${metric.name}.`;
  };
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
        // Keep the user where they were after a keyboard/modal closes (see AddFarmerForm).
        enableResetScrollToCoords={false}
        keyboardShouldPersistTaps="always"
        keyboardDismissMode="none"
        bounces={false}
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(footerHeight + 60, 240) },
          isAddMode && styles.addScrollContent,
        ]}
      >
        <View style={styles.formSection}>
          {/* Field officers pick the farmer who owns the farm from a
              searchable list of ALL farmers (same as the web form). This
              replaces the old 7-item "recently added" checklist, which meant
              a farm could only be assigned to the newest few farmers. */}
          {isAddMode && isFieldOfficer ? (
            <>
              <RemoteSelector
                label="Select Farmer"
                placeholder="Search for a farmer"
                field="farmer"
                labelField="farmer_label"
                formik={formik}
                endpoint={endpoints.adminFarmers}
                mapItem={(item) => ({
                  id: item.id,
                  name: [item.first_name, item.last_name]
                    .filter(Boolean)
                    .join(" "),
                })}
                required
              />
              <FormErrorMessage
                error={(formik.touched.farmer && formik.errors.farmer) as string}
              />
            </>
          ) : null}

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
            searchable={true}
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
            data={
              webFormat
                ? LAND_OWNERSHIP_WEB_OPTIONS
                : LAND_OWNERSHIP_LEGACY_OPTIONS
            }
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

          {webFormat && isOtherOwnership ? (
            <>
              <AppTextInput
                error={
                  formik.touched.other_specification &&
                  formik.errors.other_specification
                }
                label="Please specify land ownership"
                placeholder="type here"
                style={{
                  backgroundColor: isLoading
                    ? colors.backgroundTertiary
                    : colors.backgroundPrimary,
                }}
                required
                value={formik.values.other_specification}
                autoCorrect={false}
                editable={!isLoading}
                keyboardType="default"
                onBlur={() => formik.setFieldTouched("other_specification")}
                onChangeText={formik.handleChange("other_specification")}
              />
              <FormErrorMessage
                error={
                  (formik.touched.other_specification &&
                    formik.errors.other_specification) as string
                }
              />
            </>
          ) : null}

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

          <AppText fontFamily="SemiBold" fontSize={16} color="black">
            Labour Force
          </AppText>
          {(
            [
              ["labor_force_total", "Total Number of Workers", "e.g. 10"],
              ["labor_force_male", "Number of Males", "e.g. 6"],
              ["labor_force_female", "Number of Females", "e.g. 4"],
            ] as const
          ).map(([field, label, placeholder]) => (
            <React.Fragment key={field}>
              <AppTextInput
                error={formik.touched[field] && formik.errors[field]}
                label={label}
                placeholder={placeholder}
                style={{
                  backgroundColor: isLoading
                    ? colors.backgroundTertiary
                    : colors.backgroundPrimary,
                }}
                value={formik.values[field]}
                autoCorrect={false}
                editable={!isLoading}
                keyboardType="number-pad"
                onBlur={() => formik.setFieldTouched(field)}
                onChangeText={formik.handleChange(field)}
              />
              <FormErrorMessage
                error={(formik.touched[field] && formik.errors[field]) as string}
              />
            </React.Fragment>
          ))}
        </View>

        <View style={[styles.formSection, { marginBottom: 60 }]}>
          <AppText fontFamily="SemiBold" fontSize={16} color="black" style={{ marginBottom: 4 }}>
            Farm Boundary (Optional)
          </AppText>
          <AppText
            fontFamily="Regular"
            fontSize={12}
            color="formPlaceholderText"
            style={{ marginBottom: 12 }}
          >
            Used for geofencing and asset tracking. Not required for weather or soil data.
          </AppText>
          <FarmBoundaryEditor
            points={formik.values.boundary ?? []}
            onChange={(points: BoundaryPoint[]) =>
              formik.setFieldValue("boundary", points)
            }
            onUseArea={handleUseMappedArea}
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

      <View
        style={[styles.footer, { paddingBottom: bottomInset + 23 }]}
        onLayout={(e) => setFooterHeight(e.nativeEvent.layout.height)}
      >
        {showSubmitHint ? (
          <AppText
            fontFamily="Medium"
            fontSize={13}
            color="error"
            style={{ textAlign: "center", marginBottom: 10 }}
          >
            Some required fields are missing or invalid. Please check the
            fields marked in red.
          </AppText>
        ) : null}
        <AppButton
          title={isAddMode ? "Add Farm" : "Save Changes"}
          textColor="white"
          btnColor="buttonPrimary"
          borderRadius={8}
          onPress={formik.submitForm}
          loading={isLoading}
          // Add: pressing with missing fields is allowed on purpose - Formik
          // then marks every field as touched so each problem shows its
          // message (a button disabled until valid left people guessing).
          disabled={!isAddMode && !formik.dirty}
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
    // paddingBottom is set dynamically inline based on measured footer height
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