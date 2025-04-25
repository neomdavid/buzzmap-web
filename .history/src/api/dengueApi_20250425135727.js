// api/dengueApi.js
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const dengueApi = createApi({
  reducerPath: "dengueApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:4000/api/v1/",
    prepareHeaders: (headers, { getState }) => {
      const token = getState().auth.token;
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["Post", "Auth", "OTP"],
  endpoints: (builder) => ({
    // Authentication Endpoints
    register: builder.mutation({
      query: (credentials) => ({
        url: "auth/register",
        method: "POST",
        body: credentials,
      }),
      invalidatesTags: ["Auth"],
    }),

    login: builder.mutation({
      query: (credentials) => ({
        url: "auth/login",
        method: "POST",
        body: credentials,
      }),
      invalidatesTags: ["Auth"],
    }),

    verifyOtp: builder.mutation({
      query: (otpData) => ({
        url: "auth/verify-otp",
        method: "POST",
        body: otpData,
      }),
      invalidatesTags: ["OTP", "Auth"],
    }),

    resendOtp: builder.mutation({
      query: (email) => ({
        url: "auth/resend-otp",
        method: "POST",
        body: { email },
      }),
      invalidatesTags: ["OTP"],
    }),

    forgotPassword: builder.mutation({
      query: (email) => ({
        url: "auth/forgot-password",
        method: "POST",
        body: { email },
      }),
      invalidatesTags: ["Auth"],
    }),

    resetPassword: builder.mutation({
      query: ({ resetToken, newPassword }) => ({
        url: "auth/reset-password",
        method: "POST",
        body: { resetToken, newPassword },
      }),
      invalidatesTags: ["Auth"],
    }),

    // Posts/Reports Endpoints
    getPosts: builder.query({
      query: ({ page = 1, limit = 10, filter = "latest" } = {}) =>
        `reports?page=${page}&limit=${limit}&sort=${
          filter === "latest" ? "-createdAt" : "-likesCount"
        }`,
      providesTags: (result, error, arg) => {
        // Handle cases where result might be undefined or have different structure
        if (!result) return [{ type: "Post", id: "LIST" }];

        // Check for different possible response structures
        const posts = result.data || result.docs || result.posts || result;

        if (Array.isArray(posts)) {
          return [
            ...posts.map((post) => ({ type: "Post", id: post._id || post.id })),
            { type: "Post", id: "LIST" },
          ];
        }

        // Fallback if the structure is unexpected
        return [{ type: "Post", id: "LIST" }];
      },
    }),

    getPostById: builder.query({
      query: (id) => `posts/${id}`,
      providesTags: (result, error, id) => [{ type: "Post", id }],
    }),

    createPost: builder.mutation({
      query: (postData) => ({
        url: "reports",
        method: "POST",
        body: postData,
      }),
      invalidatesTags: [{ type: "Post", id: "LIST" }],
    }),

    createPostWithImage: builder.mutation({
      query: (formData) => ({
        url: "posts",
        method: "POST",
        body: formData,
        headers: {
          // Let the browser set the Content-Type with boundary
          // when using FormData
        },
      }),
      invalidatesTags: [{ type: "Post", id: "LIST" }],
    }),

    deletePost: builder.mutation({
      query: (id) => ({
        url: `posts/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [{ type: "Post", id }],
    }),

    validatePost: builder.mutation({
      query: (id) => ({
        url: `posts/${id}`,
        method: "PATCH",
      }),
      invalidatesTags: (result, error, id) => [{ type: "Post", id }],
    }),

    likePost: builder.mutation({
      query: (id) => ({
        url: `posts/${id}/like`,
        method: "PATCH",
      }),
      invalidatesTags: (result, error, id) => [{ type: "Post", id }],
    }),

    // Analytics Endpoints
    getAnalytics: builder.query({
      query: () => "analytics/interventions",
      providesTags: ["Analytics"],
    }),

    // Test Endpoints (for development)
    uploadTestReports: builder.mutation({
      query: () => ({
        url: "test/upload-test-reports",
        method: "POST",
      }),
      invalidatesTags: [{ type: "Post", id: "LIST" }],
    }),

    deleteAllReports: builder.mutation({
      query: () => ({
        url: "test/delete-all-reports",
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Post", id: "LIST" }],
    }),
  }),
});

// Export hooks for usage in functional components
export const {
  // Auth hooks
  useRegisterMutation,
  useLoginMutation,
  useVerifyOtpMutation,
  useResendOtpMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,

  // Post hooks
  useGetPostsQuery,
  useLazyGetPostsQuery,
  useGetPostByIdQuery,
  useCreatePostMutation,
  useCreatePostWithImageMutation,
  useDeletePostMutation,
  useValidatePostMutation,
  useLikePostMutation,

  // Analytics hooks
  useGetAnalyticsQuery,

  // Test hooks
  useUploadTestReportsMutation,
  useDeleteAllReportsMutation,
} = dengueApi;
