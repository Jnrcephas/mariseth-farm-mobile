import { colors } from "@/constants/colors";
import { largeScreen } from "@/constants/generalconstants";
import { icons } from "@/constants/icons";
import apiClient from "@/network/apiclient";
import { useUniversalStore } from "@/stores/useuniversalstore";
import { handleGenericApiError } from "@/utils/apierrorhandler";
import { handleToastShow } from "@/utils/commonmethods";
import { keepPreviousData, useQuery, useQueryClient } from "@tanstack/react-query";
import { Image } from "expo-image";
import { FormikProps } from "formik";
import React from "react";
import { Pressable, StyleSheet, TouchableHighlight, View } from "react-native";
import { useToast } from "react-native-toast-notifications";
import AppText from "./apptext";
import ModalSelector from "./modalselector";

type Option = { id: number | string; name: string };

interface RemoteSelectorProps {
  label: string;
  placeholder: string;
  /** Formik field that receives the chosen id (as a string). */
  field: string;
  /** Formik field that receives the chosen name, so it can be shown later. */
  labelField: string;
  formik: FormikProps<any>;
  endpoint: string;
  /** Extra query-string params, e.g. { farmer_type: "lead" }. */
  extraParams?: Record<string, string | number>;
  /** Turns one API row into { id, name }. Defaults to row.id / row.name. */
  mapItem?: (item: any) => Option;
  required?: boolean;
  /**
   * Hide the whole field if the server says this account can't use the
   * endpoint (401/403/404) instead of showing a picker that can never load.
   */
  hideWhenUnavailable?: boolean;
  /**
   * Inline creation (like the web's project picker). When set, typing a name
   * that has no exact match adds a "Create ..." row; picking it POSTs
   * `{ name }` to this endpoint, then selects the new item automatically.
   */
  createEndpoint?: string;
  /** Text for the create row, e.g. (term) => `Create project "${term}"`. */
  createLabel?: (term: string) => string;
}

const CREATE_ROW_ID = "__create__";

const PAGE_SIZE = 20;
const SEARCH_DEBOUNCE_MS = 300;
const UNAVAILABLE_STATUSES = [401, 403, 404];

const defaultMapItem = (item: any): Option => ({ id: item.id, name: item.name });

function useDebounced<T>(value: T, delay: number) {
  const [debounced, setDebounced] = React.useState(value);
  React.useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

/**
 * A dropdown whose options come from the server and are searched server-side
 * as you type (mirrors the web app's AsyncCombobox: Project and Lead Farmer
 * pickers). Only the first page of matches is loaded - type to narrow down.
 */
const RemoteSelector: React.FC<RemoteSelectorProps> = ({
  label,
  placeholder,
  field,
  labelField,
  formik,
  endpoint,
  extraParams,
  mapItem = defaultMapItem,
  required = false,
  hideWhenUnavailable = false,
  createEndpoint,
  createLabel = (term) => `Create "${term}"`,
}) => {
  const visible = useUniversalStore((state) => !!state.selectModalVisible[field]);
  const toast = useToast();
  const queryClient = useQueryClient();
  const [isCreating, setIsCreating] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const debouncedSearch = useDebounced(search, SEARCH_DEBOUNCE_MS);

  // Forget the search text each time the picker closes.
  React.useEffect(() => {
    if (!visible) setSearch("");
  }, [visible]);

  const { data, isFetching, error } = useQuery({
    queryKey: ["remote-select", endpoint, extraParams ?? {}, debouncedSearch],
    placeholderData: keepPreviousData,
    retry: false,
    queryFn: async () => {
      const response = await apiClient.get<any>(endpoint, {
        ...extraParams,
        query: debouncedSearch || undefined,
        page: 1,
        page_size: PAGE_SIZE,
      });
      if (response.ok) return response.data;
      throw { problem: response.problem, status: response.status };
    },
  });

  const options = React.useMemo<Option[]>(() => {
    const rows = Array.isArray(data) ? data : data?.results ?? [];
    return rows.map(mapItem);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  const value = formik.values[field];
  const hasError = formik.touched[field] && formik.errors[field];

  const handleVisibility = (isVisible: boolean) => {
    useUniversalStore.setState((state) => ({
      selectModalVisible: { ...state.selectModalVisible, [field]: isVisible },
    }));
    if (!isVisible) formik.setFieldTouched(field, true, false);
  };

  const handleSelect = (option: Option | null) => {
    formik.setFieldValue(field, option ? String(option.id) : "");
    formik.setFieldValue(labelField, option ? option.name : "");
    handleVisibility(false);
  };

  const trimmedTerm = search.trim();
  // Treat the debounce window as "still loading" so the Create row never
  // shows (or checks for a match) against stale results - otherwise a project
  // that already exists could be created twice.
  const isSettling = isFetching || debouncedSearch !== search;
  const canCreate =
    !!createEndpoint &&
    trimmedTerm.length > 0 &&
    !isSettling &&
    !isCreating &&
    !options.some(
      (o) => o.name.trim().toLowerCase() === trimmedTerm.toLowerCase()
    );

  const handleCreate = async () => {
    if (!createEndpoint || isCreating) return;
    setIsCreating(true);
    try {
      const response = await apiClient.post<any>(createEndpoint, {
        name: trimmedTerm,
      });
      if (!response.ok) {
        throw { problem: response.problem, message: response.data };
      }
      const created = mapItem(response.data);
      formik.setFieldValue(field, String(created.id));
      formik.setFieldValue(labelField, created.name || trimmedTerm);
      // Make every picker using this endpoint pick up the new item.
      queryClient.invalidateQueries({ queryKey: ["remote-select", endpoint] });
      handleVisibility(false);
      handleToastShow(toast, `"${created.name || trimmedTerm}" created`);
    } catch (e: any) {
      handleGenericApiError(e, toast);
    } finally {
      setIsCreating(false);
    }
  };

  const status = (error as { status?: number } | null)?.status;
  if (hideWhenUnavailable && status && UNAVAILABLE_STATUSES.includes(status)) {
    return null;
  }

  const displayName = value
    ? formik.values[labelField] ||
      options.find((o) => String(o.id) === String(value))?.name ||
      `#${value}`
    : "";

  // Optional fields get a "None" row so a chosen value can be cleared.
  const listData: Option[] = [
    ...(canCreate ? [{ id: CREATE_ROW_ID, name: createLabel(trimmedTerm) }] : []),
    ...(!required && value ? [{ id: "", name: "None" }] : []),
    ...options,
  ];

  return (
    <>
      {visible && (
        <ModalSelector
          visible={visible}
          onClose={() => handleVisibility(false)}
          label={label}
          data={listData}
          searchable
          searchPlaceholder={`Search ${label.toLowerCase()}...`}
          onQueryChange={setSearch}
          isLoading={isSettling}
          keyExtractor={(item, index) => `${item.id}-${index}`}
          renderItem={({ item }) => (
            <TouchableHighlight
              underlayColor={colors.buttonActionSheet}
              style={[
                styles.row,
                String(item.id) === String(value) &&
                  item.id !== "" && { backgroundColor: colors.buttonActionSheet },
              ]}
              onPress={() =>
                item.id === CREATE_ROW_ID
                  ? handleCreate()
                  : handleSelect(item.id === "" ? null : item)
              }
            >
              <AppText
                fontFamily={item.id === CREATE_ROW_ID ? "SemiBold" : "Medium"}
                fontSize={15}
                color={item.id === CREATE_ROW_ID ? "primary" : "textBold"}
                style={{ flex: 1 }}
              >
                {item.name}
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
              {`No ${label.toLowerCase()} found`}
            </AppText>
          }
        />
      )}

      <View style={{ width: "100%" }}>
        <View style={{ flexDirection: "row", marginBottom: 8 }}>
          <AppText fontSize={14} fontFamily="SemiBold" color="formLabelText">
            {label}
          </AppText>
          {required ? (
            <AppText
              fontSize={14}
              color="error"
              fontFamily="SemiBold"
              style={{ marginLeft: 4 }}
            >
              *
            </AppText>
          ) : null}
        </View>

        <Pressable
          style={[
            styles.selectButton,
            { borderColor: hasError ? colors.error : colors.formBorder },
          ]}
          onPress={() => handleVisibility(true)}
        >
          <AppText
            fontSize={17}
            fontFamily="Regular"
            color="formInputText"
            style={{ flex: 1 }}
            numberOfLines={1}
          >
            {displayName || placeholder}
          </AppText>
          <Image
            source={icons.arrowDown}
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

export default RemoteSelector;

const styles = StyleSheet.create({
  selectButton: {
    width: "100%",
    borderRadius: 10,
    borderWidth: 1,
    height: largeScreen ? 54 : 49,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  row: {
    paddingVertical: 15,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.light,
  },
});
