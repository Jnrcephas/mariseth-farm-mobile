import apiClient from "@/network/apiclient";
import { getErrorMessage } from "@/utils/apierrorhandler";
import {
  useInfiniteQuery,
  useQuery,
  UseQueryOptions,
} from "@tanstack/react-query";
import { ApiResponse } from "apisauce";
import React from "react";
const API_KEY = process.env.EXPO_PUBLIC_WEATHER_API_KEY;
function useFetchQuery(
  endpoint: string,
  key: string,
  options?: UseQueryOptions<any>
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

  options?: UseQueryOptions
) {
  const query = useInfiniteQuery<PaginatedResponse<T>>({
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

interface CurrentWeatherResponse {
  location: WeatherLocation;
  current: CurrentWeather;
  forecast?: {
    forecastday: Array<{
      day: {
        daily_chance_of_rain: number;
      };
    }>;
  };
}

interface ApiError {
  message: string;
  status?: number;
}

function useCurrentWeather(
  location: string,
  options?: UseQueryOptions<CurrentWeatherResponse, ApiError>
) {
  const url = `https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${location}&days=1&aqi=no`;

  const { data, isLoading, error } = useQuery<CurrentWeatherResponse, ApiError>(
    {
      queryKey: ["current-weather", location],
      staleTime: 5 * 60 * 1000,
      queryFn: async () => {
        const response = await fetch(url, {
          method: "GET",
        });
        if (!response.ok) {
          const body = await response.text();

          console.log(body);

          throw {
            message: getErrorMessage(response.status, body),
            status: response.status,
          };
        }
        return (await response.json()) as CurrentWeatherResponse;
      },

      ...options,
    }
  );

  return { data, isLoading, error };
}

export { useCurrentWeather, useFetchQuery, usePaginatedInfiniteQuery };
