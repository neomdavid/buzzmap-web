import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const dengueApi = createApi({
  reducerPath: "dengueApi", // name of the slice in the Redux store
  baseQuery: fetchBaseQuery({ baseUrl: "http://localhost:4000/api/v1" }), // base URL of your backend
  endpoints: (builder) => ({
    getCases: builder.query({
      query: () => "dengue-cases", // this becomes http://localhost:5000/api/dengue-cases
    }),
  }),
});

export const { useGetCasesQuery } = dengueApi;
