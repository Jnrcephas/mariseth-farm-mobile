import apiClient from "@/network/apiclient";
import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import { ApiResponse } from "apisauce";
const httpMethods = {
  POST: apiClient.post,
  PUT: apiClient.put,
  DELETE: apiClient.delete,
  PATCH: apiClient.patch,
};

function useAuthMutation(
  endpoint: string,
  method: keyof typeof httpMethods,
  key: string,
  options?: UseMutationOptions<any>
): any {
  const {
    mutate,
    isPending: isLoading,
    error,
  } = useMutation({
    mutationKey: [key],
    mutationFn: async (data: any) => {
      const response: ApiResponse<any> = await httpMethods[method](
        endpoint,
        data
      );
      if (response.ok) {
        return response.data as any;
      } else {
        const error = {
          problem: response.problem,
          message: response.data,
        };
        throw error;
      }
    },
    ...options,
  });

  return { mutate, isLoading, error };
}

export default useAuthMutation;
