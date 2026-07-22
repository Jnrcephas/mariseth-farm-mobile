import AppButton from "@/components/ui/appbutton";
import AppText from "@/components/ui/apptext";
import AppTextInput from "@/components/ui/apptextinput";
import ApplyForSelector, {
  ApplyForOption,
} from "@/components/ui/applyforselector";
import FormErrorMessage from "@/components/ui/formerrormessage";
import InputCreditSelector from "@/components/ui/inputcreditselector";
import SmallFarmerCard from "@/components/ui/smallfarmercard";
import { colors } from "@/constants/colors";
import { endpoints } from "@/constants/endpoints";
import { usePaginatedInfiniteQuery } from "@/hooks/usefetchquery";
import useAuthMutation from "@/hooks/usemutation";
import { userStore } from "@/stores/userstore";
import { inputCredit, inputCreditCategory } from "@/types/credit";
import { handleAuthApiError } from "@/utils/apierrorhandler";
import { handleToastShow } from "@/utils/commonmethods";
import { isLeadFarmerUser } from "@/utils/userroles";
import { applyCreditSchema } from "@/utils/validationschema";
import { useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { useFormik } from "formik";
import React from "react";
import { StyleSheet, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useToast } from "react-native-toast-notifications";
import { useStore } from "zustand";

const buildApplyCreditPayload = (values: {
  apply_for: ApplyForOption;
  farmer_ids: number[];
  input_credit_category: string | number;
  input_credit: string | number;
  quantity: string;
  notes: string;
  quantity_metric?: string | number;
}) => ({
  apply_for: values.apply_for,
  farmer_ids: values.apply_for === "my_farmer" ? values.farmer_ids : [],
  input_credit_category: Number(values.input_credit_category),
  input_credit: Number(values.input_credit),
  quantity: values.quantity,
  notes: values.notes.trim() || null,
  quantity_metric: values.quantity_metric
    ? Number(values.quantity_metric)
    : undefined,
});

const ApplyCredit = () => {
  const user = useStore(userStore, (state) => state.user);
  const isLeaderFarmer = isLeadFarmerUser(user);
  const metrics = userStore.getState().metrics;
  const quantityMetrics = metrics.filter(
    (metric) => metric.category_name === "quantity_metric"
  );
  const storedInputCredits = useStore(userStore, (state) => state.inputCredits);

  const creditCategories = (metrics.filter(
    (category) => category.category_name === "input_credits_category"
  ) || []) as inputCreditCategory[];

  const { items: fetchedInputCredits } = usePaginatedInfiniteQuery<inputCredit>(
    endpoints.inputCredits,
    "input-credits-apply",
    {
      page_size: 50,
      query: "",
    }
  );

  const { items: farmers } = usePaginatedInfiniteQuery<any>(
    endpoints.myFarmers,
    "smallholders",
    {
      page_size: 10,
      query: "",
    },
    { enabled: isLeaderFarmer }
  );

  const recentlyAddedFarmers = farmers?.slice(0, 7) ?? [];

  React.useEffect(() => {
    if (fetchedInputCredits?.length) {
      userStore.setState({ inputCredits: fetchedInputCredits });
    }
  }, [fetchedInputCredits]);

  const inputCredits =
    fetchedInputCredits?.length > 0
      ? fetchedInputCredits
      : storedInputCredits;

  const bottomInset = useSafeAreaInsets().bottom;
  const toast = useToast();
  const queryClient = useQueryClient();
  const { mutate, isLoading } = useAuthMutation(
    endpoints.applyCredit,
    "POST",
    "applycredit",
    {
      onSuccess: () => {
        handleToastShow(toast, "Credit application submitted successfully!");
        Promise.all([
          queryClient.invalidateQueries({ queryKey: ["credit-history"] }),
          queryClient.invalidateQueries({ queryKey: ["credit-history-home"] }),
          queryClient.invalidateQueries({ queryKey: ["activecredit"] }),
        ]).then(() => {
          router.navigate("/credits");
        });
      },
      onError: (error: unknown) => {
        handleAuthApiError(error, formik, toast);
      },
    }
  );

  const formik = useFormik({
    initialValues: {
      apply_for: "myself" as ApplyForOption,
      farmer_ids: [] as number[],
      input_credit_category: "",
      input_credit: "",
      quantity: "",
      notes: "",
      quantity_metric: quantityMetrics[0]?.id ?? "",
    },
    validationSchema: applyCreditSchema,
    validateOnChange: true,
    validateOnBlur: true,
    onSubmit: async (values) => {
      mutate(buildApplyCreditPayload(values));
    },
  });

  const inputCreditsArray = React.useMemo(
    () =>
      inputCredits.filter(
        (credit) =>
          Number(credit?.category.id) ===
          Number(formik.values.input_credit_category)
      ) || [],
    [formik.values.input_credit_category, inputCredits]
  ) as inputCredit[];

  const isMyFarmer = formik.values.apply_for === "my_farmer";

  const toggleFarmerSelection = (farmerId: number) => {
    const currentIds = formik.values.farmer_ids;
    const nextIds = currentIds.includes(farmerId)
      ? currentIds.filter((id) => id !== farmerId)
      : [...currentIds, farmerId];

    formik.setFieldValue("farmer_ids", nextIds);
    formik.setFieldTouched("farmer_ids", true, false);
  };

  const handleApplyForChange = (value: ApplyForOption) => {
    formik.setFieldValue("apply_for", value);
    formik.setFieldValue("farmer_ids", []);
    formik.setFieldTouched("apply_for", true, false);

    if (value === "myself") {
      formik.setFieldError("farmer_ids", undefined);
    }
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
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.formSection}>
          {isLeaderFarmer ? (
            <>
              <ApplyForSelector
                value={formik.values.apply_for}
                onChange={handleApplyForChange}
              />
              <FormErrorMessage
                error={
                  (formik.touched.apply_for &&
                    formik.errors.apply_for) as string
                }
              />
            </>
          ) : null}

          <InputCreditSelector
            label="Input Credits"
            placeholder="Select input credit"
            data={creditCategories}
            field="input_credit_category"
            formik={formik}
            value={formik.values.input_credit_category}
          />
          <FormErrorMessage
            error={
              (formik.touched.input_credit_category &&
                formik.errors.input_credit_category) as string
            }
          />

          <InputCreditSelector
            label="Type"
            placeholder="Select type"
            data={inputCreditsArray}
            field="input_credit"
            formik={formik}
            value={formik.values.input_credit}
            disabled={!formik.values.input_credit_category}
          />
          <FormErrorMessage
            error={
              (formik.touched.input_credit &&
                formik.errors.input_credit) as string
            }
          />

          <AppTextInput
            error={formik.touched.quantity && formik.errors.quantity}
            label="Quantity"
            placeholder="0"
            style={{
              backgroundColor: isLoading
                ? colors.backgroundTertiary
                : colors.backgroundPrimary,
            }}
            required
            value={formik.values.quantity}
            autoCapitalize="none"
            autoCorrect={false}
            editable={!isLoading}
            keyboardType="numeric"
            onBlur={() => formik.setFieldTouched("quantity")}
            onChangeText={formik.handleChange("quantity")}
          />
          <FormErrorMessage
            error={
              (formik.touched.quantity && formik.errors.quantity) as string
            }
          />

          <AppTextInput
            error={formik.touched.notes && formik.errors.notes}
            label="Extra Information/Notes"
            placeholder="Traded for 25 bags of Maize, with the current price of a bag of Maize being GH₵ 103"
            style={{
              backgroundColor: isLoading
                ? colors.backgroundTertiary
                : colors.backgroundPrimary,
            }}
            multiline={true}
            textAlignVertical="top"
            TextinputHeight={102}
            value={formik.values.notes}
            autoCapitalize="none"
            autoCorrect={false}
            editable={!isLoading}
            keyboardType="default"
            onBlur={() => formik.setFieldTouched("notes")}
            onChangeText={formik.handleChange("notes")}
          />
          <FormErrorMessage
            error={(formik.touched.notes && formik.errors.notes) as string}
          />
        </View>

        {isLeaderFarmer ? (
          <View style={styles.recentlyAddedSection}>
            <AppText fontFamily="SemiBold" fontSize={16} color="black">
              Recently Added
            </AppText>

            {recentlyAddedFarmers.length > 0 ? (
              <View style={styles.recentlyAddedList}>
                {recentlyAddedFarmers.map((item, index) => (
                  <SmallFarmerCard
                    key={item.id}
                    item={item}
                    avatarSize={40}
                    showNewBadge={!isMyFarmer && index < 5}
                    showCheckbox={isMyFarmer}
                    checked={formik.values.farmer_ids.includes(item.id)}
                    onCheckToggle={() => toggleFarmerSelection(item.id)}
                  />
                ))}
              </View>
            ) : (
              <AppText fontFamily="Medium" fontSize={14} color="formInputText">
                {isMyFarmer
                  ? "No farmers available to select yet. Add a farmer first."
                  : "No recently added farmers yet."}
              </AppText>
            )}

            {isMyFarmer ? (
              <FormErrorMessage
                error={
                  (formik.touched.farmer_ids &&
                    formik.errors.farmer_ids) as string
                }
              />
            ) : null}
          </View>
        ) : null}
      </KeyboardAwareScrollView>

      <View style={[styles.footer, { paddingBottom: bottomInset + 23 }]}>
        <AppButton
          title="Submit Credit Application"
          textColor="white"
          btnColor="buttonPrimary"
          borderRadius={8}
          onPress={formik.submitForm}
          loading={isLoading}
          disabled={isLoading || !formik.isValid}
        />
      </View>
    </View>
  );
};

export default ApplyCredit;

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
