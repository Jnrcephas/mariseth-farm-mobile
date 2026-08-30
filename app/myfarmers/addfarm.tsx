import FarmForm from "@/components/ui/farmform";
import { pointsToGeoJSON } from "@/components/ui/farmboundarycapture";
import { usePaginatedInfiniteQuery } from "@/hooks/usefetchquery";
import useAuthMutation from "@/hooks/usemutation";
import { userStore } from "@/stores/userstore";
import { smallHolder } from "@/types/farmers";
import { handleAuthApiError } from "@/utils/apierrorhandler";
import { dataDecoder, handleToastShow } from "@/utils/commonmethods";
import { getAddFarmSource, getFarmerListSource } from "@/utils/farmdatasource";
import { isFieldOfficerExperience } from "@/utils/userroles";
import { addFarmSchema } from "@/utils/validationschema";
import { useQueryClient } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import { useFormik } from "formik";
import React from "react";
import { useToast } from "react-native-toast-notifications";
import { useStore } from "zustand";

const AddFarm = () => {
  const params = useLocalSearchParams<{ data: string }>();
  const preselectedFarmer: smallHolder | null = params?.data
    ? dataDecoder(params.data)
    : null;

  const user = useStore(userStore, (state) => state.user);
  const isLeaderFarmer = user?.farmer?.type === "lead";
  // Field officers (now including admins - the backend reuses admin
  // credentials for them, see isFieldOfficerExperience) have no farm of
  // their own, so "Apply for myself" never makes sense - every farm they
  // add must be assigned to a farmer they've onboarded, same as a lead
  // farmer's "my_farmer" path.
  const isFieldOfficer = isFieldOfficerExperience(user);
  const metrics = userStore((state) => state.metrics);
  const sizeMetrics = metrics.filter(
    (metric) => metric.category_name === "size_metric"
  );
  const regions = userStore((state) => state.regions);

  const { endpoint: farmerEndpoint, queryKey: farmerQueryKey } =
    getFarmerListSource(user);
  const { endpoint: addFarmEndpoint, queryKey: farmQueryKey } =
    getAddFarmSource(user);

  const { items: farmers } = usePaginatedInfiniteQuery<any>(
    farmerEndpoint,
    farmerQueryKey,
    {
      page_size: 10,
      query: "",
    }
  );

  const recentlyAddedFarmers = farmers?.slice(0, 7) ?? [];

  const toast = useToast();
  const queryClient = useQueryClient();
  const { mutate, isLoading } = useAuthMutation(
    addFarmEndpoint,
    "POST",
    "addfarm",
    {
      onSuccess: () => {
        handleToastShow(toast, "Farm has been added successfully!");
        queryClient
          .invalidateQueries({ queryKey: [farmQueryKey] })
          .then(() => {
            queryClient.invalidateQueries({ queryKey: [farmerQueryKey] });
            router.back();
          });
      },

      onError: (error: any) => {
        handleAuthApiError(error, formik, toast);
      },
    }
  );

  const formik = useFormik({
    initialValues: {
      apply_for:
        preselectedFarmer || isFieldOfficer ? "my_farmer" : "myself",
      farmer_ids: preselectedFarmer ? [preselectedFarmer.id] : ([] as number[]),
      farm_type: "external",
      name: "",
      location: "",
      region: "",
      district: "",
      size: "",
      size_metric: sizeMetrics[0]?.id || "",
      land_ownership: "",
      crops: [],
      livestock: [],
      use_of_fertilizers: [],
      farming_methods: [],
      irrigation: false,
      has_access_to_market: false,
      boundary: [] as { latitude: number; longitude: number }[],
    },
    validationSchema: addFarmSchema,
    onSubmit: async (values) => {
      // Boundary is optional - it's only used for the Geofencing/asset-
      // tracking feature (confirmed with backend: weather and soil
      // quality are resolved purely from the farm id and don't need
      // it). If the farmer hasn't drawn one, just submit without it.
      // Only block if they've started marking points but haven't
      // finished (need 3+ to form a valid shape).
      const { boundary: boundaryPoints, ...rest } = values;
      if (boundaryPoints.length > 0 && boundaryPoints.length < 3) {
        handleToastShow(
          toast,
          "Add at least 3 points to complete the boundary, or clear them to skip it for now."
        );
        return;
      }
      const boundary = pointsToGeoJSON(boundaryPoints);
      const withBoundary = boundary ? { ...rest, boundary } : rest;

      if (isFieldOfficer) {
        // The lead-farmer endpoint takes `apply_for` + `farmer_ids` (an
        // array, since a lead farmer picks from a checklist); the admin
        // farm-management endpoint has no such concept and just wants a
        // single `farmer` id. Known limitation: if more than one farmer is
        // checked, only the first is used - the checklist UI is shared
        // with the lead-farmer flow and doesn't (yet) restrict field
        // officers to a single selection.
        const { apply_for, farmer_ids, ...adminRest } = withBoundary;
        mutate({
          ...adminRest,
          farmer: farmer_ids?.[0] ?? null,
        });
        return;
      }

      mutate(withBoundary);
    },
  });

  const districts = React.useMemo(
    () =>
      regions.find((region) => region.id === Number(formik.values.region))
        ?.districts || [],
    [formik.values.region, regions]
  );

  return (
    <FarmForm
      formik={formik}
      isLoading={isLoading}
      type="add"
      districts={districts}
      isLeaderFarmer={isLeaderFarmer}
      isFieldOfficer={isFieldOfficer}
      recentlyAddedFarmers={recentlyAddedFarmers}
    />
  );
};

export default AddFarm;