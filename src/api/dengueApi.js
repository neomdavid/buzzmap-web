import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const dengueApi = createApi({
  reducerPath: "dengueApi",
  baseQuery: fetchBaseQuery({ baseUrl: "http://localhost:4000/api/v1/" }),
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (credentials) => {
        console.log("Login request body: ", credentials);

        return {
          url: "auth/login",
          method: "POST",
          body: {
            email: "rapi.testing1@gmail.com",
            password: "testing2123",
          },
        };
      },
    }),
  }),
});

export const { useLoginMutation } = dengueApi;
