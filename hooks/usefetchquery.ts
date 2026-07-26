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
        return response.data;
      } else {
        const error = {
          problem: response.problem,
          message: response.data,
          status: response.status,
        };
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
// farmer's registered village name as a free-text location. Now that the
// backend has its own weather endpoint tied to a specific farm's
// boundary (GET api/v1/weather/{farm_id} - see constants/endpoints.ts),
// weather is fetched through the normal apiClient instead, keyed by farm
// id rather than a location string. Farms without a boundary set will
// get an error back - see isBoundaryMissingError below.
//
// ASSUMPTION: kept the exact same response shape WeatherCard already
// depends on (location/current/forecast/alerts, WeatherAPI.com-style
// field names like temp_c, condition.text, daily_chance_of_rain) on the
// assumption the backend proxies/forwards a WeatherAPI.com-compatible
// payload rather than reshaping it. If the real response differs, this
// interface and WeatherCard's field access are the two places to update
// - nothing else should need to change.
interface WeatherCondition {
  text: string;
  icon: string;
  code: number;
}

interface CurrentWeather {
  last_updated: string;
  temp_c: number;
  temp_f: number;
  is_day: number;
  condition: WeatherCondition;
  wind_kph: number;
  humidity: number;
  feelslike_c: number;
  uv: number;
  pressure_mb: number;
  vis_km: number;
}

interface WeatherLocation {
  name: string;
  region: string;
  country: string;
  localtime: string;
}

export interface FarmWeatherResponse {
  location: WeatherLocation;
  current: CurrentWeather;
  forecast?: {
    forecastday: Array<{
      date: string;
      day: {
        maxtemp_c: number;
        mintemp_c: number;
        condition: WeatherCondition;
        daily_chance_of_rain: number;
      };
    }>;
  };
  alerts?: {
    alert: Array<{
      headline: string;
      severity: string;
      event: string;
      desc: string;
    }>;
  };
}

interface ApiError {
  message: string;
  status?: number;
  payload?: any;
}

// The backend returns an error (400/404, exact shape TBC with backend
// team) when a farm has no boundary set yet - this heuristic flags that
// case so the UI can show "set your farm boundary" instead of a generic
// error. Tighten this once the exact error shape is confirmed.
export function isBoundaryMissingError(error: any): boolean {
  if (!error) return false;
  const text = JSON.stringify(error).toLowerCase();
  return (
    (error?.status === 400 || error?.status === 404) &&
    text.includes("boundary")
  );
}

function useFarmWeather(
  farmId: number | string | undefined,
  options?: Omit<UseQueryOptions<FarmWeatherResponse, ApiError>, "queryKey" | "queryFn" | "enabled">
) {
  const { data, isLoading, error } = useQuery<FarmWeatherResponse, ApiError>({
    queryKey: ["farm-weather", farmId],
    enabled: !!farmId,
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      const response: ApiResponse<FarmWeatherResponse> = await apiClient.get(
        endpoints.weather(farmId as number | string)
      );

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

  return { data, isLoading, error };
}

export { useFarmWeather, useFetchQuery, usePaginatedInfiniteQuery };
