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
    console.log('[DEBUG] API Request:', {
      url: args.url,
      method: args.method || 'GET',
      body: args.body
    });
    
    const result = await customBaseQuery(args, api, extraOptions);
    
    console.log('[DEBUG] API Response:', {
      status: result.status,
      data: result.data,
      error: result.error
    });

    if (result.error) {
      console.error('[DEBUG] API Error:', {
        status: result.error.status,
        data: result.error.data,
        originalError: result.error
      });
    }

    return result;
  } catch (error) {
    console.error('[DEBUG] API Exception:', {
      message: error.message,
      stack: error.stack,
      originalError: error
    });
    return { error: { status: 'CUSTOM_ERROR', data: error.message } };
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
    "Accounts",
    "Comments",
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
        url: `reports/${id}`,
        method: 'PATCH',
        body: { status },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Post', id },
        { type: 'Post', id: 'LIST' }
      ],
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
      query: () => {
        console.log('[DEBUG] Fetching analytics data...');
        return "analytics/interventions";
      },
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
      query: ({ barangay_name, number_of_weeks }) => {
        console.log('[DEBUG] Fetching weekly trends for:', { barangay_name, number_of_weeks });
        return {
          url: 'analytics/get-barangay-weekly-trends',
          method: 'POST',
          body: {
            barangay_name,
            number_of_weeks
          }
        };
      },
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

    getAccounts: builder.query({
      query: () => ({
        url: '/accounts',
        method: 'GET',
      }),
      providesTags: ['Accounts'],
    }),

    // Create admin account
    createAdmin: builder.mutation({
      query: (adminData) => ({
        url: 'accounts',
        method: 'POST',
        body: adminData,
      }),
      invalidatesTags: ['Accounts'],
    }),

    // Verify OTP
    verifyAdminOTP: builder.mutation({
      query: (otpData) => ({
        url: 'auth/verify-otp',
        method: 'POST',
        body: otpData,
      }),
      invalidatesTags: ['Accounts'],
    }),

    // Add this to the endpoints object
    deleteAccount: builder.mutation({
      query: (id) => ({
        url: `accounts/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Accounts'],
    }),

    // Add this to the endpoints object
    toggleAccountStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `accounts/${id}/toggle-status`,
        method: 'PATCH',
        body: { status },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Accounts', id },
        { type: 'Accounts', id: 'LIST' }
      ],
      // Add optimistic update
      async onQueryStarted({ id, status }, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
        } catch (error) {
          console.error('Error updating account status:', error);
        }
      }
    }),

    // Add this to the endpoints object in dengueApi
    getUsers: builder.query({
      query: () => ({
        url: '/accounts/role/user',
        method: 'GET',
      }),
      providesTags: ['Accounts'],
    }),

    // Add this to the endpoints object
    analyzeInterventionEffectivity: builder.mutation({
      query: (interventionId) => ({
        url: 'analytics/analyze-intervention-effectivity',
        method: 'POST',
        body: { intervention_id: interventionId }
      }),
      providesTags: (result, error, id) => [{ type: 'Intervention', id }]
    }),

    upvoteReport: builder.mutation({
      query: (reportId) => {
        console.log('[DEBUG] Upvoting report:', reportId);
        return {
          url: `reports/${reportId}/upvote`,
          method: "POST",
        };
      },
      async onQueryStarted(reportId, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          console.log('[DEBUG] Upvote successful:', data);
          
          // Update the cache for both the specific post and the post list
          dispatch(
            dengueApi.util.updateQueryData('getPosts', undefined, (draft) => {
              const post = draft.find(p => p._id === reportId);
              if (post) {
                post.upvotes = data.upvotes;
                post.downvotes = data.downvotes;
              }
            })
          );
        } catch (error) {
          console.error('[DEBUG] Upvote failed:', error);
        }
      },
      invalidatesTags: (result, error, reportId) => [
        { type: "Post", id: reportId },
        { type: "Post", id: "LIST" }
      ],
    }),
    downvoteReport: builder.mutation({
      query: (reportId) => {
        console.log('[DEBUG] Downvoting report:', reportId);
        return {
          url: `reports/${reportId}/downvote`,
          method: "POST",
        };
      },
      async onQueryStarted(reportId, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          console.log('[DEBUG] Downvote successful:', data);
          
          // Update the cache for both the specific post and the post list
          dispatch(
            dengueApi.util.updateQueryData('getPosts', undefined, (draft) => {
              const post = draft.find(p => p._id === reportId);
              if (post) {
                post.upvotes = data.upvotes;
                post.downvotes = data.downvotes;
              }
            })
          );
        } catch (error) {
          console.error('[DEBUG] Downvote failed:', error);
        }
      },
      invalidatesTags: (result, error, reportId) => [
        { type: "Post", id: reportId },
        { type: "Post", id: "LIST" }
      ],
    }),
    removeUpvote: builder.mutation({
      query: (reportId) => {
        console.log('[DEBUG] Removing upvote from report:', reportId);
        return {
          url: `reports/${reportId}/upvote`,
          method: "DELETE",
        };
      },
      async onQueryStarted(reportId, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          console.log('[DEBUG] Remove upvote successful:', data);
          
          // Update the cache for both the specific post and the post list
          dispatch(
            dengueApi.util.updateQueryData('getPosts', undefined, (draft) => {
              const post = draft.find(p => p._id === reportId);
              if (post) {
                post.upvotes = data.upvotes;
                post.downvotes = data.downvotes;
              }
            })
          );
        } catch (error) {
          console.error('[DEBUG] Remove upvote failed:', error);
        }
      },
      invalidatesTags: (result, error, reportId) => [
        { type: "Post", id: reportId },
        { type: "Post", id: "LIST" }
      ],
    }),
    removeDownvote: builder.mutation({
      query: (reportId) => {
        console.log('[DEBUG] Removing downvote from report:', reportId);
        return {
          url: `reports/${reportId}/downvote`,
          method: "DELETE",
        };
      },
      async onQueryStarted(reportId, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          console.log('[DEBUG] Remove downvote successful:', data);
          
          // Update the cache for both the specific post and the post list
          dispatch(
            dengueApi.util.updateQueryData('getPosts', undefined, (draft) => {
              const post = draft.find(p => p._id === reportId);
              if (post) {
                post.upvotes = data.upvotes;
                post.downvotes = data.downvotes;
              }
            })
          );
        } catch (error) {
          console.error('[DEBUG] Remove downvote failed:', error);
        }
      },
      invalidatesTags: (result, error, reportId) => [
        { type: "Post", id: reportId },
        { type: "Post", id: "LIST" }
      ],
    }),
    addComment: builder.mutation({
      query: ({ reportId, content }) => ({
        url: `reports/${reportId}/comments`,
        method: "POST",
        body: { content },
      }),
      invalidatesTags: (result, error, { reportId }) => [
        { type: "Post", id: reportId },
        { type: "Comments", id: reportId }
      ],
    }),
    getComments: builder.query({
      query: (reportId) => `reports/${reportId}/comments`,
      providesTags: (result, error, reportId) => [
        { type: "Comments", id: reportId }
      ],
    }),

    // Test endpoint to verify API connectivity
    testApiConnection: builder.query({
      query: () => ({
        url: 'health',
        method: 'GET',
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

  useGetAccountsQuery,

  // Add this to the exported hooks
  useCreateAdminMutation,

  // Add this to the exported hooks
  useVerifyAdminOTPMutation,

  // Add this to the exported hooks
  useDeleteAccountMutation,

  // Add this to the exported hooks
  useToggleAccountStatusMutation,

  // Add this to the exported hooks
  useGetUsersQuery,

  // Add this to the exported hooks
  useAnalyzeInterventionEffectivityMutation,

  useGetCommentsQuery,
  useUpvoteReportMutation,
  useDownvoteReportMutation,
  useRemoveUpvoteMutation,
  useRemoveDownvoteMutation,
  useAddCommentMutation,

  // Add the test endpoint hook
  useTestApiConnectionQuery,
} = dengueApi;
