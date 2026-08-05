import apiClient from "@/network/apiclient";
import { endpoints } from "@/constants/endpoints";
import { getErrorMessage } from "@/utils/apierrorhandler";
import {
  useInfiniteQuery,
  useQuery,
  UseQueryOptions,
  UseInfiniteQueryOptions,
  InfiniteData,
} from "@tanstack/react-query";
import { ApiResponse } from "apisauce";
import React from "react";
function useFetchQuery(
  endpoint: string,
  key: string,
  options?: Omit<UseQueryOptions<any, any, any, any>, "queryKey" | "queryFn">
): any {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: [key],
    // staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      const response: ApiResponse<any> = await apiClient.get(endpoint);
      if (response.ok) {
        console.log(`[useFetchQuery:${key}] success`, {
          endpoint,
          data: response.data,
        });
        return response.data;
      } else {
        const error = {
          problem: response.problem,
          message: response.data,
          status: response.status,
        };
        console.log(`[useFetchQuery:${key}] request failed`, {
          endpoint,
          status: response.status,
          problem: response.problem,
          data: response.data,
        });
        throw error;
      }
    },
    ...options,
  });

  return { data, isLoading, error, refetch };
}

interface Pagination {
  total: number;
  page: number;
  pages: number;
  has_next: boolean;
  has_previous: boolean;
}

interface PaginatedResponse<T> {
  results: T[];
  pagination: Pagination;
}

function usePaginatedInfiniteQuery<T>(
  endpoint: string,
  key: string,
  params: object = {},

  options?: Omit<
    UseInfiniteQueryOptions<
      PaginatedResponse<T>,
      Error,
      InfiniteData<PaginatedResponse<T>>,
      readonly unknown[],
      unknown
    >,
    "queryKey" | "queryFn" | "getNextPageParam" | "initialPageParam"
  >
) {
  const query = useInfiniteQuery<
    PaginatedResponse<T>,
    Error,
    InfiniteData<PaginatedResponse<T>>,
    readonly unknown[],
    unknown
  >({
    queryKey: [key, params],
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    queryFn: async ({ pageParam = 1 }) => {
      const response: ApiResponse<PaginatedResponse<T>> = await apiClient.get(
        endpoint,
        {
          ...params,
          page: pageParam,
        }
      );

      if (response.ok && response.data) {
        return response.data;
      } else {
        console.log("[usePaginatedInfiniteQuery] request failed", {
          endpoint,
          params,
          pageParam,
          problem: response.problem,
          status: response.status,
          data: response.data,
          originalError: (response as any).originalError,
        });
        throw {
          problem: response.problem,
          message: response.data,
          status: response.status,
        };
      }
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      return lastPage?.pagination?.has_next
        ? lastPage?.pagination?.page + 1
        : undefined;
    },
    ...options,
  });

  const items = React.useMemo(
    () => query.data?.pages.flatMap((page) => page.results) ?? [],
    [query.data]
  );

  return {
    ...query,
    items,
  };
}

// NOTE: previously this called WeatherAPI.com directly using the
// farmer's registered village name as a free-text location. The backend
// now has its own weather endpoint tied to a specific farm
// (GET api/v1/agro-monitoring/{farm_id}/weather - see
// constants/endpoints.ts), keyed by farm id. Confirmed with the backend
// team: this does NOT require the farm to have a boundary set - it
// resolves location purely from the farm id server-side. (The previous
// `weather/{farmId}` path used here, and the "boundary required" gating
// that used to live in this file/WeatherCard/Geofencing, were based on a
// different/incorrect endpoint - see git history.)
//
// The real response is an OpenWeatherMap-style "current weather" object -
// NOT the WeatherAPI.com shape (location/current/forecast/alerts) this
// used to assume. Confirmed against a real response, e.g.:
// { "temp": 298.01, "pressure": 1015.0, "humidity": 75.0, "clouds": 19.0,
//   "wind_speed": 3.15, "wind_deg": 208.0,
//   "weather": [{ "main": "Clouds", "description": "few clouds", "icon": "02n" }],
//   "farm": null, ... }
// Notably there is no forecast or alerts data, and temp/wind are in
// Kelvin/m-per-s rather than °C/km-h, so those need converting before
// display.
export function kelvinToCelsius(kelvin: number): number {
  return kelvin - 273.15;
}

export function mpsToKph(metersPerSecond: number): number {
  return metersPerSecond * 3.6;
}

export interface WeatherConditionEntry {
  id: number;
  main: string;
  description: string;
  icon: string;
}

export interface FarmWeatherResponse {
  id: number;
  hour_key?: string;
  lat: number | null;
  lon: number | null;
  sunrise?: string | null;
  sunset?: string | null;
  temp: number | null; // Kelvin
  temp_max: number | null;
  temp_min: number | null;
  pressure: number | null;
  humidity: number | null;
  dew_point?: number | null;
  uvi?: number | null;
  clouds: number | null;
  visibility?: number | null;
  wind_speed: number | null; // m/s
  wind_deg: number | null;
  wind_gust?: number | null;
  weather: WeatherConditionEntry[];
  farm: number | null;
}

interface ApiError {
  message: string;
  status?: number;
  payload?: any;
}

function useFarmWeather(
  farmId: number | string | undefined,
  options?: Omit<UseQueryOptions<FarmWeatherResponse, ApiError>, "queryKey" | "queryFn" | "enabled">
) {
  console.log("[useFarmWeather] called with", { farmId, enabled: !!farmId });

  const { data, isLoading, error } = useQuery<FarmWeatherResponse, ApiError>({
    queryKey: ["farm-weather", farmId],
    enabled: !!farmId,
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      const url = endpoints.weather(farmId as number | string);
      console.log("[useFarmWeather] fetching", { url, farmId });

      const response: ApiResponse<FarmWeatherResponse> = await apiClient.get(url);

      console.log("[useFarmWeather] response", {
        url,
        ok: response.ok,
        status: response.status,
        problem: response.problem,
        data: response.data,
      });

      if (response.ok && response.data) {
        return response.data;
      }

      throw {
        message: getErrorMessage(
          response.status ?? 0,
          typeof response.data === "string"
            ? response.data
            : JSON.stringify(response.data ?? {})
        ),
        status: response.status,
        payload: response.data,
      };
    },
    ...options,
  });

  console.log("[useFarmWeather] state", {
    farmId,
    isLoading,
    hasData: !!data,
    error,
  });

  return { data, isLoading, error };
}

// Same shape/relationship as weather above - keyed by farm id, no
// boundary required. Confirmed against a real response, e.g.:
// { "provider": "open_weatherapi", "dt": "2026-08-04T12:00:00Z",
//   "t10": 297.065 (subsoil temp, Kelvin), "moisture": 0.218 (fraction,
//   multiply by 100 for %), "t0": 300.663 (topsoil temp, Kelvin),
//   "farm": 9264 }
export interface FarmSoilQualityResponse {
  id: number;
  provider?: string | null;
  hour_key?: string;
  dt?: string | null; // reading timestamp
  t10: number | null; // subsoil (10cm) temp, Kelvin
  moisture: number | null; // fraction, e.g. 0.218 = 21.8%
  t0: number | null; // topsoil temp, Kelvin
  farm: number | null;
}

function useFarmSoilQuality(
  farmId: number | string | undefined,
  options?: Omit<UseQueryOptions<FarmSoilQualityResponse, ApiError>, "queryKey" | "queryFn" | "enabled">
) {
  console.log("[useFarmSoilQuality] called with", { farmId, enabled: !!farmId });

  const { data, isLoading, error } = useQuery<FarmSoilQualityResponse, ApiError>({
    queryKey: ["farm-soil-quality", farmId],
    enabled: !!farmId,
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      const url = endpoints.soilQuality(farmId as number | string);
      console.log("[useFarmSoilQuality] fetching", { url, farmId });

      const response: ApiResponse<FarmSoilQualityResponse> = await apiClient.get(url);

      console.log("[useFarmSoilQuality] response", {
        url,
        ok: response.ok,
        status: response.status,
        problem: response.problem,
        data: response.data,
      });

      if (response.ok && response.data) {
        return response.data;
      }

      throw {
        message: getErrorMessage(
          response.status ?? 0,
          typeof response.data === "string"
            ? response.data
            : JSON.stringify(response.data ?? {})
        ),
        status: response.status,
        payload: response.data,
      };
    },
    ...options,
  });

  console.log("[useFarmSoilQuality] state", {
    farmId,
    isLoading,
    hasData: !!data,
    error,
  });

  return { data, isLoading, error };
}

export { useFarmWeather, useFarmSoilQuality, useFetchQuery, usePaginatedInfiniteQuery };