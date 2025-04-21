import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const dengueApi = createApi({
  reducerPath: "dengueApi",
  baseQuery: fetchBaseQuery({ baseUrl: "http://localhost:4000/api/v1/" }),
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (credentials) => ({
        url: "auth/login",
        method: "POST",
        body: credentials,
      }),
    }),
    signUp: builder.mutation({
      query: (credentials) => {
        console.log(credentials);
        return {
          url: "auth/register",
          method: "POST",
          body: credentials,
        };
      },
    }),
  }),
});

export const { useLoginMutation, useSignUpMutation } = dengueApi;
