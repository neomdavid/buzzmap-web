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
            email: "rapi.role.test@gmail.com",
            password: "roletest",
          },
        };
      },
    }),
  }),
});

export const { useLoginMutation } = dengueApi;
