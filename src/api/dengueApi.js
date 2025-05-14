// api/dengueApi.js
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// Custom error handler
const customBaseQuery = fetchBaseQuery({
  baseUrl: "http://localhost:4000/api/v1/",
  prepareHeaders: (headers, { getState }) => {
    const token = getState().auth.token;
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

// Wrap the base query with error handling
const baseQueryWithErrorHandling = async (args, api, extraOptions) => {
  try {
    const result = await customBaseQuery(args, api, extraOptions);
    
    if (result.error) {
      
      // Helper to ensure a message is always present
      const getErrorData = (defaultMsg) => {
        // Check for nested error message in data
        if (result.error.data?.message) {
          return result.error.data;
        }
        // Check for error message in data.status
        if (result.error.data?.status === 'error' && result.error.data?.message) {
          return result.error.data;
        }
        return { message: defaultMsg };
      };

      // Handle different error status codes
      switch (result.error.status) {
        case 401:
          return {
            error: {
              status: 401,
              data: getErrorData('Please log in to continue')
            }
          };
        case 403:
          return {
            error: {
              status: 403,
              data: getErrorData('You do not have permission to perform this action')
            }
          };
        case 404:
          return {
            error: {
              status: 404,
              data: getErrorData('The requested resource was not found')
            }
          };
        case 500:
          // Special handling for 500 errors that might contain specific error messages
          const errorData = getErrorData('Server error occurred. Please try again later');
          return {
            error: {
              status: 500,
              data: errorData
            }
          };
        default:
          return {
            error: {
              status: result.error.status,
              data: getErrorData('Something went wrong. Please try again later')
            }
          };
      }
    }
    return result;
  } catch (error) {
    // Handle network errors (e.g., server unreachable)
    return {
      error: {
        status: 'NETWORK_ERROR',
        data: { message: 'Network error. Please check your connection and try again.' }
      }
    };
  }
};

export const dengueApi = createApi({
  reducerPath: "dengueApi",
  baseQuery: baseQueryWithErrorHandling,
  tagTypes: [
    "Post",
    "Auth",
    "OTP",
    "Intervention",
    "Analytics",
    "PatternRecognition",
    "Barangay",
    "Alert",
  ],
  endpoints: (builder) => ({
    // Authentication Endpoints
    register: builder.mutation({
      query: (credentials) => ({
        url: "auth/register",
        method: "POST",
        body: credentials,
      }),
      invalidatesTags: ["Auth"],
      // Add optimistic update
      async onQueryStarted(credentials, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
        } catch (error) {
          // Handle registration error
          console.error('Registration failed:', error);
        }
      }
    }),

    login: builder.mutation({
      query: (credentials) => {
        return {
          url: "auth/login",
          method: "POST", 
          body: credentials,
        };
      },
      invalidatesTags: ["Auth"],
      async onQueryStarted(credentials, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
        } catch (error) {
          if (error.error?.status === 500) {
            throw new Error('Network error. Please try again later.');
          }
          throw error;
        }
      }
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
      query: ({ 
        search,
        barangay,
        report_type,
        status,
        startDate,
        endDate,
        sortBy,
        sortOrder,
        username,
        description
      } = {}) => {
        let url = 'reports';
        const params = new URLSearchParams();

        // Add all search parameters if they exist
        if (search) params.append('search', search);
        if (barangay) params.append('barangay', barangay);
        if (report_type) params.append('report_type', report_type);
        if (status) params.append('status', status);
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        if (sortBy) params.append('sortBy', sortBy);
        if (sortOrder) params.append('sortOrder', sortOrder);
        if (username) params.append('username', username);
        if (description) params.append('description', description);

        // Add the query string if we have any parameters
        const queryString = params.toString();
        if (queryString) {
          url += `?${queryString}`;
        }

        // Log the final URL
        console.log('API Request URL:', url);
        return url;
      },
      providesTags: (result) => 
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Post', id })),
              { type: 'Post', id: 'LIST' },
            ]
          : [{ type: 'Post', id: 'LIST' }],
    }),

    getPostById: builder.query({
      query: (id) => `reports/${id}`,
      providesTags: (result, error, id) => [{ type: "Post", id }],
    }),

    createPost: builder.mutation({
      query: (postData) => ({
        url: "reports",
        method: "POST",
        body: postData,
      }),
      invalidatesTags: [{ type: "Post", id: "LIST" }],
      // Add optimistic update
      async onQueryStarted(postData, { dispatch, queryFulfilled }) {
        const optimisticPost = { 
          ...postData, 
          id: Date.now(),
          createdAt: new Date().toISOString(),
          likesCount: 0,
          commentsCount: 0
        };
        
        // Optimistically update the cache
        dispatch(
          dengueApi.util.updateQueryData('getPosts', undefined, (draft) => {
            draft.unshift(optimisticPost);
          })
        );

        try {
          await queryFulfilled;
        } catch {
          // Revert on error
          dispatch(
            dengueApi.util.updateQueryData('getPosts', undefined, (draft) => {
              draft.shift();
            })
          );
        }
      }
    }),

    createPostWithImage: builder.mutation({
      query: (formData) => ({
        url: "reports",
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
      query: ({ id, status }) => ({
        url: `reports/${id}`, // your backend URL is /api/v1/reports/:id
        method: "PATCH",
        body: { status }, // send the status inside the request body
      }),
      invalidatesTags: [{ type: "Post", id: "LIST" }],
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
    // Intervention Endpoints

    // Create an intervention
    createIntervention: builder.mutation({
      query: (interventionData) => ({
        url: "interventions", // The endpoint for creating interventions
        method: "POST",
        body: interventionData,
      }),
      invalidatesTags: [{ type: "Intervention", id: "LIST" }],
    }),

    // Get all interventions
    getAllInterventions: builder.query({
      query: () => "interventions", // The endpoint to get all interventions
      providesTags: (result) => {
        if (result) {
          return [
            ...result.map((intervention) => ({
              type: "Intervention",
              id: intervention._id,
            })),
            { type: "Intervention", id: "LIST" },
          ];
        } else {
          return [{ type: "Intervention", id: "LIST" }];
        }
      },
    }),

    // Get a single intervention by ID
    getIntervention: builder.query({
      query: (id) => `interventions/${id}`, // The endpoint to get a single intervention
      providesTags: (result, error, id) => [{ type: "Intervention", id }],
    }),

    // Update an intervention
    updateIntervention: builder.mutation({
      query: ({ id, updatedData }) => ({
        url: `interventions/${id}`, // The endpoint to update intervention by ID
        method: "PATCH",
        body: updatedData,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Intervention", id },
      ],
    }),

    // Delete an intervention
    deleteIntervention: builder.mutation({
      query: (id) => ({
        url: `interventions/${id}`, // The endpoint to delete an intervention by ID
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [{ type: "Intervention", id }],
    }),

    //PATTERN RECOGNITION
    getPatternRecognitionResults: builder.query({
      query: () => "analytics/retrieve-pattern-recognition-results",
      providesTags: ["PatternRecognition"],
    }),

    // Add this to the endpoints object
    getInterventionsInProgress: builder.query({
      query: (barangay) => `interventions/in-progress/${barangay}`,
      providesTags: (result, error, barangay) => [{ type: "Intervention", id: barangay }],
    }),

    // Get all barangays
    getBarangays: builder.query({
      query: () => "barangays/get-all-barangays",
      providesTags: ["Barangay"],
      transformResponse: (response) => {
        // If response is an array, sort it alphabetically by name/displayName
        if (Array.isArray(response)) {
          return response.sort((a, b) => {
            // Use displayName if available, otherwise fallback to name
            const nameA = (a.displayName || a.name || "").toLowerCase();
            const nameB = (b.displayName || b.name || "").toLowerCase();
            return nameA.localeCompare(nameB);
          });
        }
        return response;
      },
    }),

    // Send dengue alert
    sendDengueAlert: builder.mutation({
      query: (alertData) => ({
        url: "alerts",
        method: "POST",
        body: alertData,
      }),
      invalidatesTags: ["Alert"],
    }),

    createAdminPost: builder.mutation({
      query: (formData) => ({
        url: "adminPosts",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: [{ type: "Post", id: "LIST" }],
    }),

    // Get all admin posts (requires token)
    getAllAdminPosts: builder.query({
      query: () => "adminPosts",
      providesTags: ["Post"],
    }),

    // Update an admin post
    updateAdminPost: builder.mutation({
      query: ({ id, formData }) => ({
        url: `adminPosts/${id}`,
        method: 'PATCH',
        body: formData,
      }),
      invalidatesTags: ["Post"],
    }),

    // Delete an admin post
    deleteAdminPost: builder.mutation({
      query: (id) => ({
        url: `adminPosts/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Post"],
    }),

    // Get all alerts
    getAllAlerts: builder.query({
      query: () => "alerts",
      providesTags: ["Alert"],
    }),

    // Update an alert
    updateAlert: builder.mutation({
      query: ({ id, updatedData }) => ({
        url: `alerts/${id}`,
        method: "PATCH",
        body: updatedData,
      }),
      invalidatesTags: ["Alert"],
    }),

    // Delete an alert
    deleteAlert: builder.mutation({
      query: (id) => ({
        url: `alerts/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Alert"],
    }),

    // Add this to your endpoints object in dengueApi
    getBarangayWeeklyTrends: builder.query({
      query: ({ barangay_name, number_of_weeks }) => ({
        url: 'analytics/get-barangay-weekly-trends',
        method: 'POST',
        body: {
          barangay_name,
          number_of_weeks
        }
      }),
      providesTags: ['Analytics']
    }),

    // Get a single admin post by ID
    getSingleAdminPost: builder.query({
      query: (id) => `adminPosts/${id}`,
      providesTags: (result, error, id) => [{ type: "Post", id }],
    }),

    getNearbyReports: builder.mutation({
      query: (body) => ({
        url: "reports/nearby",
        method: "POST",
        body,
      }),
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

  //Intervention hooks
  useGetInterventionQuery,
  useGetAllInterventionsQuery,
  useCreateInterventionMutation,
  useDeleteInterventionMutation,
  useUpdateInterventionMutation,

  // Analytics hooks
  useGetAnalyticsQuery,

  // Test hooks
  useUploadTestReportsMutation,
  useDeleteAllReportsMutation,

  //Pattern Recognition
  useGetPatternRecognitionResultsQuery,

  // Add this to the exported hooks
  useGetInterventionsInProgressQuery,

  // Barangay hooks
  useGetBarangaysQuery,

  // Alert hooks
  useSendDengueAlertMutation,

  useCreateAdminPostMutation,

  // Admin hooks
  useGetAllAdminPostsQuery,
  useGetAllAlertsQuery,
  useUpdateAdminPostMutation,
  useDeleteAdminPostMutation,

  // Update alert
  useUpdateAlertMutation,

  // Delete alert
  useDeleteAlertMutation,

  // Add this to your exported hooks
  useGetBarangayWeeklyTrendsQuery,

  // Add this to the exported hooks
  useGetSingleAdminPostQuery,

  useGetNearbyReportsMutation,
} = dengueApi;
