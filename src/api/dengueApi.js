// api/dengueApi.js
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// Debug environment variables
console.log("Current Mode:", import.meta.env.MODE);
console.log("VITE_API_BASE_URL:", import.meta.env.VITE_API_BASE_URL);
console.log("VITE_MODE:", import.meta.env.VITE_MODE);

// Determine base URL based on environment
const BASE_URL =
  import.meta.env.VITE_MODE === "PROD" || import.meta.env.MODE === "PROD"
    ? import.meta.env.VITE_API_BASE_URL
    : "http://localhost:4000/";

console.log("Final BASE_URL:", BASE_URL);

const customBaseQuery = fetchBaseQuery({
  baseUrl: BASE_URL + "api/v1/",
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

    // Check for 401 Unauthorized response
    if (result.error?.status === 401) {
      // Preserve the original error message from the backend
      return {
        error: {
          status: "UNAUTHORIZED",
          data: result.error.data || "Please log in to perform this action",
        },
      };
    }

    return result;
  } catch (error) {
    // Handle connection refused errors
    if (
      error.message?.includes("Failed to fetch") ||
      error.message?.includes("NetworkError")
    ) {
      console.error("Connection error:", error);
      return {
        error: {
          status: "CONNECTION_ERROR",
          data: "Unable to connect to the server. Please check if the server is running.",
        },
      };
    }

    return { error: { status: "CUSTOM_ERROR", data: error.message } };
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
          console.error("Registration failed:", error);
        }
      },
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
          // Don't handle the error here, let it propagate to the component
          console.log("Login error in onQueryStarted:", error);
        }
      },
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
      query: (data) => ({
        url: "auth/resend-otp",
        method: "POST",
        body: {
          email: data.email,
          purpose: data.purpose || "account-verification",
        },
      }),
      invalidatesTags: ["OTP"],
    }),

    forgotPassword: builder.mutation({
      query: (email) => ({
        url: "auth/forgot-password",
        method: "POST",
        body: { email: email },
      }),
      invalidatesTags: ["Auth"],
    }),

    verifyResetOtp: builder.mutation({
      query: (otpData) => ({
        url: "auth/verify-otp",
        method: "POST",
        body: otpData,
      }),
      invalidatesTags: ["OTP", "Auth"],
    }),

    resetPassword: builder.mutation({
      query: (resetData) => ({
        url: "auth/reset-password",
        method: "POST",
        body: resetData,
      }),
      invalidatesTags: ["Auth"],
    }),

    resendResetOtp: builder.mutation({
      query: (email) => ({
        url: "auth/resend-otp",
        method: "POST",
        body: { email: email, purpose: "password-reset" },
      }),
      invalidatesTags: ["OTP"],
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
        description,
        page = 1,
        limit = 10,
      } = {}) => {
        let url = "reports";
        const params = new URLSearchParams();

        // Add all search parameters if they exist
        if (search) params.append("search", search);
        if (barangay) params.append("barangay", barangay);
        if (report_type) params.append("report_type", report_type);
        if (status) params.append("status", status);
        if (startDate) params.append("startDate", startDate);
        if (endDate) params.append("endDate", endDate);
        if (sortBy) params.append("sortBy", sortBy);
        if (sortOrder) params.append("sortOrder", sortOrder);
        if (username) params.append("username", username);
        if (description) params.append("description", description);

        // Remove pagination params
        // params.append('page', page);
        // params.append('limit', limit);

        // Add the query string if we have any parameters
        const queryString = params.toString();
        if (queryString) {
          url += `?${queryString}`;
        }

        // Log the final URL
        console.log("API Request URL:", url);
        return url;
      },
      async onQueryStarted(arg, { dispatch, queryFulfilled, getState }) {
        try {
          // Check if user is admin and trigger analysis before fetching posts
          const state = getState();
          const user = state.auth?.user;

          if (user?.role === "admin") {
            console.log(
              "[DEBUG] Admin fetching posts, triggering crowdsourced analysis first..."
            );
            // Trigger analysis before fetching posts
            await dispatch(
              dengueApi.endpoints.analyzeCrowdsourcedReports.initiate()
            ).unwrap();
            console.log(
              "[DEBUG] Crowdsourced analysis completed, now fetching posts..."
            );
          }

          await queryFulfilled;
        } catch (error) {
          console.error("[DEBUG] Error in getPosts onQueryStarted:", error);
          // Still allow posts to be fetched even if analysis fails
        }
      },
      transformResponse: (response, meta, arg) => {
        // No more paginated format, just return the array directly
        return response;
      },
      providesTags: (result) =>
        Array.isArray(result)
          ? [
              ...result.map(({ id, _id }) => ({ type: "Post", id: id || _id })),
              { type: "Post", id: "LIST" },
            ]
          : [{ type: "Post", id: "LIST" }],
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
          commentsCount: 0,
        };

        // Optimistically update the cache
        dispatch(
          dengueApi.util.updateQueryData("getPosts", undefined, (draft) => {
            draft.unshift(optimisticPost);
          })
        );

        try {
          await queryFulfilled;
        } catch {
          // Revert on error
          dispatch(
            dengueApi.util.updateQueryData("getPosts", undefined, (draft) => {
              draft.shift();
            })
          );
        }
      },
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
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Post", id },
        { type: "Post", id: "LIST" },
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
        console.log("[DEBUG] Fetching analytics data...");
        return "analytics/interventions";
      },
      providesTags: ["Analytics"],
    }),

    // Analyze crowdsourced reports
    analyzeCrowdsourcedReports: builder.mutation({
      query: () => ({
        url: "analytics/analyze-crowdsourced-reports",
        method: "GET",
      }),
      transformResponse: (response) => {
        console.log("[DEBUG] Crowdsourced analysis response:", response);
        return response;
      },
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

    // Get all interventions (paginated)
    getAllInterventions: builder.query({
      query: () => `interventions`,
      transformResponse: (response) => {
        console.log("[DEBUG] All interventions response:", response);
        return response;
      },
      providesTags: (result) => {
        if (!Array.isArray(result))
          return [{ type: "Intervention", id: "LIST" }];

        // Create tags for each barangay that has interventions
        const barangayTags = [...new Set(result.map((i) => i.barangay))].map(
          (barangay) => ({
            type: "Intervention",
            id: barangay,
          })
        );

        return [...barangayTags, { type: "Intervention", id: "LIST" }];
      },
    }),

    // Get interventions for a specific barangay
    getInterventionsInProgress: builder.query({
      query: (barangay) => `interventions/in-progress/${barangay}`,
      transformResponse: (response) => {
        console.log("[DEBUG] Interventions for barangay response:", response);
        return response;
      },
      providesTags: (result, error, barangay) => [
        { type: "Intervention", id: barangay },
        { type: "Intervention", id: "LIST" },
      ],
    }),

    // Create an intervention
    createIntervention: builder.mutation({
      query: (interventionData) => ({
        url: "interventions",
        method: "POST",
        body: interventionData,
      }),
      invalidatesTags: (result, error, { barangay }) => [
        { type: "Intervention", id: barangay },
        { type: "Intervention", id: "LIST" },
      ],
    }),

    // Get a single intervention by ID
    getIntervention: builder.query({
      query: (id) => `interventions/${id}`, // The endpoint to get a single intervention
      providesTags: (result, error, id) => [{ type: "Intervention", id }],
    }),

    // Update an intervention
    updateIntervention: builder.mutation({
      query: ({ id, updatedData }) => ({
        url: `interventions/${id}`,
        method: "PATCH",
        body: updatedData,
      }),
      invalidatesTags: (result, error, { id, updatedData }) => [
        { type: "Intervention", id },
        { type: "Intervention", id: updatedData.barangay },
        { type: "Intervention", id: "LIST" },
      ],
    }),

    // Delete an intervention
    deleteIntervention: builder.mutation({
      query: (id) => ({
        url: `interventions/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "Intervention", id },
        { type: "Intervention", id: "LIST" },
      ],
    }),

    //PATTERN RECOGNITION
    getPatternRecognitionResults: builder.query({
      query: () => "analytics/retrieve-pattern-recognition-results",
      providesTags: ["PatternRecognition"],
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

    // Get all admin posts (paginated)
    getAllAdminPosts: builder.query({
      query: () => `adminposts`,
      transformResponse: (response) => {
        return response;
      },
      providesTags: (result) =>
        Array.isArray(result)
          ? [
              ...result.map(({ id, _id }) => ({ type: "Post", id: id || _id })),
              { type: "Post", id: "LIST" },
            ]
          : [{ type: "Post", id: "LIST" }],
    }),

    // Update an admin post
    updateAdminPost: builder.mutation({
      query: ({ id, formData }) => ({
        url: `adminPosts/${id}`,
        method: "PATCH",
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

    // Get all alerts (paginated)
    getAllAlerts: builder.query({
      query: () => `alerts`,
      transformResponse: (response) => {
        return response;
      },
      providesTags: (result) =>
        Array.isArray(result)
          ? [
              ...result.map(({ id, _id }) => ({
                type: "Alert",
                id: id || _id,
              })),
              { type: "Alert", id: "LIST" },
            ]
          : [{ type: "Alert", id: "LIST" }],
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
        console.log("[DEBUG] Fetching weekly trends for:", {
          barangay_name,
          number_of_weeks,
        });
        return {
          url: "analytics/get-barangay-weekly-trends",
          method: "POST",
          body: {
            barangay_name,
            number_of_weeks,
          },
        };
      },
      providesTags: ["Analytics"],
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

    // Get all accounts (paginated)
    getAccounts: builder.query({
      query: () => `accounts`,
      transformResponse: (response) => {
        return response;
      },
      providesTags: (result) =>
        Array.isArray(result)
          ? [
              ...result.map(({ id, _id }) => ({
                type: "Accounts",
                id: id || _id,
              })),
              { type: "Accounts", id: "LIST" },
            ]
          : [{ type: "Accounts", id: "LIST" }],
    }),

    // Add this new endpoint
    getDeletedAccounts: builder.query({
      query: () => ({
        url: "/accounts/deleted",
        method: "GET",
      }),
      providesTags: ["Accounts"],
    }),

    // Add this new endpoint
    getBasicProfiles: builder.query({
      query: () => ({
        url: "/accounts/basic",
        method: "GET",
      }),
      providesTags: ["Accounts"],
    }),

    // Create admin account
    createAdmin: builder.mutation({
      query: (adminData) => ({
        url: "accounts",
        method: "POST",
        body: adminData,
      }),
      invalidatesTags: ["Accounts"],
    }),

    // Verify OTP
    verifyAdminOTP: builder.mutation({
      query: (otpData) => ({
        url: "auth/verify-otp",
        method: "POST",
        body: otpData,
      }),
      invalidatesTags: ["Accounts"],
    }),

    // Add this to the endpoints object
    deleteAccount: builder.mutation({
      query: (id) => ({
        url: `accounts/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Accounts"],
    }),

    // Add this to the endpoints object
    toggleAccountStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `accounts/${id}/toggle-status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Accounts", id },
        { type: "Accounts", id: "LIST" },
      ],
      // Add optimistic update
      async onQueryStarted({ id, status }, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
        } catch (error) {
          console.error("Error updating account status:", error);
        }
      },
    }),

    // Add this to the endpoints object in dengueApi
    getUsers: builder.query({
      query: () => ({
        url: "/accounts/role/user",
        method: "GET",
      }),
      providesTags: ["Accounts"],
    }),

    // Add this to the endpoints object
    analyzeInterventionEffectivity: builder.mutation({
      query: (interventionId) => ({
        url: "analytics/analyze-intervention-effectivity",
        method: "POST",
        body: { intervention_id: interventionId },
      }),
      providesTags: (result, error, id) => [{ type: "Intervention", id }],
    }),

    upvoteReport: builder.mutation({
      query: (reportId) => {
        console.log("[DEBUG] Upvoting report:", reportId);
        return {
          url: `reports/${reportId}/upvote`,
          method: "POST",
        };
      },
      async onQueryStarted(reportId, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          console.log("[DEBUG] Upvote successful:", data);

          // Update the cache for both the specific post and the post list
          dispatch(
            dengueApi.util.updateQueryData("getPosts", undefined, (draft) => {
              const post = draft.find((p) => p._id === reportId);
              if (post) {
                post.upvotes = data.upvotes;
                post.downvotes = data.downvotes;
              }
            })
          );
        } catch (error) {
          console.error("[DEBUG] Upvote failed:", error);
          // The error will be handled by the component to show the toast
        }
      },
      invalidatesTags: (result, error, reportId) => [
        { type: "Post", id: reportId },
        { type: "Post", id: "LIST" },
      ],
    }),
    downvoteReport: builder.mutation({
      query: (reportId) => {
        console.log("[DEBUG] Downvoting report:", reportId);
        return {
          url: `reports/${reportId}/downvote`,
          method: "POST",
        };
      },
      async onQueryStarted(reportId, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          console.log("[DEBUG] Downvote successful:", data);

          // Update the cache for both the specific post and the post list
          dispatch(
            dengueApi.util.updateQueryData("getPosts", undefined, (draft) => {
              const post = draft.find((p) => p._id === reportId);
              if (post) {
                post.upvotes = data.upvotes;
                post.downvotes = data.downvotes;
              }
            })
          );
        } catch (error) {
          console.error("[DEBUG] Downvote failed:", error);
        }
      },
      invalidatesTags: (result, error, reportId) => [
        { type: "Post", id: reportId },
        { type: "Post", id: "LIST" },
      ],
    }),
    removeUpvote: builder.mutation({
      query: (reportId) => {
        console.log("[DEBUG] Removing upvote from report:", reportId);
        return {
          url: `reports/${reportId}/upvote`,
          method: "DELETE",
        };
      },
      async onQueryStarted(reportId, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          console.log("[DEBUG] Remove upvote successful:", data);

          // Update the cache for both the specific post and the post list
          dispatch(
            dengueApi.util.updateQueryData("getPosts", undefined, (draft) => {
              const post = draft.find((p) => p._id === reportId);
              if (post) {
                post.upvotes = data.upvotes;
                post.downvotes = data.downvotes;
              }
            })
          );
        } catch (error) {
          console.error("[DEBUG] Remove upvote failed:", error);
        }
      },
      invalidatesTags: (result, error, reportId) => [
        { type: "Post", id: reportId },
        { type: "Post", id: "LIST" },
      ],
    }),
    removeDownvote: builder.mutation({
      query: (reportId) => {
        console.log("[DEBUG] Removing downvote from report:", reportId);
        return {
          url: `reports/${reportId}/downvote`,
          method: "DELETE",
        };
      },
      async onQueryStarted(reportId, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          console.log("[DEBUG] Remove downvote successful:", data);

          // Update the cache for both the specific post and the post list
          dispatch(
            dengueApi.util.updateQueryData("getPosts", undefined, (draft) => {
              const post = draft.find((p) => p._id === reportId);
              if (post) {
                post.upvotes = data.upvotes;
                post.downvotes = data.downvotes;
              }
            })
          );
        } catch (error) {
          console.error("[DEBUG] Remove downvote failed:", error);
        }
      },
      invalidatesTags: (result, error, reportId) => [
        { type: "Post", id: reportId },
        { type: "Post", id: "LIST" },
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
        { type: "Comments", id: reportId },
      ],
    }),
    getComments: builder.query({
      query: (postId) => {
        console.log("[DEBUG] Fetching comments for postId:", postId);
        const url = `reports/${postId}/comments`;
        console.log("[DEBUG] Comments API URL:", url);
        return {
          url,
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        };
      },
      transformResponse: (response, meta, arg) => {
        console.log("[DEBUG] Raw Comments API Response:", response);
        console.log("[DEBUG] Response type:", typeof response);
        console.log("[DEBUG] Is Array?", Array.isArray(response));

        try {
          // If response is an array, return it directly
          if (Array.isArray(response)) {
            console.log(
              "[DEBUG] Response is an array with length:",
              response.length
            );
            return response;
          }

          // If response is an object with a data property, return that
          if (response && response.data) {
            console.log(
              "[DEBUG] Response has data property with length:",
              response.data.length
            );
            return response.data;
          }

          // If response is empty or null, return empty array
          console.log("[DEBUG] Response is empty or null");
          return [];
        } catch (error) {
          console.error("[DEBUG] Error transforming comments response:", error);
          return [];
        }
      },
      transformErrorResponse: (response, meta, arg) => {
        console.error("[DEBUG] Comments API Error:", response);
        console.error("[DEBUG] Error meta:", meta);
        console.error("[DEBUG] Error arg:", arg);
        return response;
      },
      providesTags: (result, error, postId) => {
        console.log("[DEBUG] Comments cache tags for postId:", postId);
        console.log("[DEBUG] Comments result:", result);
        console.log("[DEBUG] Comments error:", error);
        return [{ type: "Comments", id: postId }];
      },
    }),

    // Test endpoint to verify API connectivity
    testApiConnection: builder.query({
      query: () => ({
        url: "health",
        method: "GET",
      }),
    }),

    // Add comment voting endpoints
    upvoteComment: builder.mutation({
      query: (commentId) => ({
        url: `comments/${commentId}/upvote`,
        method: "POST",
      }),
      async onQueryStarted(commentId, { dispatch, queryFulfilled, getState }) {
        try {
          const { data } = await queryFulfilled;
          console.log("[DEBUG] Comment upvote successful:", data);

          // Get the report ID from the comment data
          const reportId = data.report;

          // Update the cache for the specific report's comments
          dispatch(
            dengueApi.util.updateQueryData("getComments", reportId, (draft) => {
              const comment = draft.find((c) => c._id === commentId);
              if (comment) {
                comment.upvotes = data.upvotes;
                comment.downvotes = data.downvotes;
              }
            })
          );
        } catch (error) {
          console.error("[DEBUG] Comment upvote failed:", error);
        }
      },
      invalidatesTags: (result, error, commentId) => [
        { type: "Comments", id: "LIST" },
      ],
    }),

    downvoteComment: builder.mutation({
      query: (commentId) => ({
        url: `comments/${commentId}/downvote`,
        method: "POST",
      }),
      async onQueryStarted(commentId, { dispatch, queryFulfilled, getState }) {
        try {
          const { data } = await queryFulfilled;
          console.log("[DEBUG] Comment downvote successful:", data);

          // Get the report ID from the comment data
          const reportId = data.report;

          // Update the cache for the specific report's comments
          dispatch(
            dengueApi.util.updateQueryData("getComments", reportId, (draft) => {
              const comment = draft.find((c) => c._id === commentId);
              if (comment) {
                comment.upvotes = data.upvotes;
                comment.downvotes = data.downvotes;
              }
            })
          );
        } catch (error) {
          console.error("[DEBUG] Comment downvote failed:", error);
        }
      },
      invalidatesTags: (result, error, commentId) => [
        { type: "Comments", id: "LIST" },
      ],
    }),

    removeCommentUpvote: builder.mutation({
      query: (commentId) => ({
        url: `comments/${commentId}/upvote`,
        method: "DELETE",
      }),
      async onQueryStarted(commentId, { dispatch, queryFulfilled, getState }) {
        try {
          const { data } = await queryFulfilled;
          console.log("[DEBUG] Remove comment upvote successful:", data);

          // Get the report ID from the comment data
          const reportId = data.report;

          // Update the cache for the specific report's comments
          dispatch(
            dengueApi.util.updateQueryData("getComments", reportId, (draft) => {
              const comment = draft.find((c) => c._id === commentId);
              if (comment) {
                comment.upvotes = data.upvotes;
                comment.downvotes = data.downvotes;
              }
            })
          );
        } catch (error) {
          console.error("[DEBUG] Remove comment upvote failed:", error);
        }
      },
      invalidatesTags: (result, error, commentId) => [
        { type: "Comments", id: "LIST" },
      ],
    }),

    removeCommentDownvote: builder.mutation({
      query: (commentId) => ({
        url: `comments/${commentId}/downvote`,
        method: "DELETE",
      }),
      async onQueryStarted(commentId, { dispatch, queryFulfilled, getState }) {
        try {
          const { data } = await queryFulfilled;
          console.log("[DEBUG] Remove comment downvote successful:", data);

          // Get the report ID from the comment data
          const reportId = data.report;

          // Update the cache for the specific report's comments
          dispatch(
            dengueApi.util.updateQueryData("getComments", reportId, (draft) => {
              const comment = draft.find((c) => c._id === commentId);
              if (comment) {
                comment.upvotes = data.upvotes;
                comment.downvotes = data.downvotes;
              }
            })
          );
        } catch (error) {
          console.error("[DEBUG] Remove comment downvote failed:", error);
        }
      },
      invalidatesTags: (result, error, commentId) => [
        { type: "Comments", id: "LIST" },
      ],
    }),

    // Admin post voting endpoints
    upvoteAdminPost: builder.mutation({
      query: (postId) => ({
        url: `adminposts/${postId}/upvote`,
        method: "POST",
      }),
      async onQueryStarted(postId, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          console.log("[DEBUG] Admin post upvote successful:", data);

          // Update the cache for admin posts
          dispatch(
            dengueApi.util.updateQueryData(
              "getAllAdminPosts",
              undefined,
              (draft) => {
                const post = draft.find((p) => p._id === postId);
                if (post) {
                  post.upvotes = data.upvotes;
                  post.downvotes = data.downvotes;
                }
              }
            )
          );
        } catch (error) {
          console.error("[DEBUG] Admin post upvote failed:", error);
        }
      },
      invalidatesTags: ["Post"],
    }),

    downvoteAdminPost: builder.mutation({
      query: (postId) => ({
        url: `adminposts/${postId}/downvote`,
        method: "POST",
      }),
      async onQueryStarted(postId, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          console.log("[DEBUG] Admin post downvote successful:", data);

          // Update the cache for admin posts
          dispatch(
            dengueApi.util.updateQueryData(
              "getAllAdminPosts",
              undefined,
              (draft) => {
                const post = draft.find((p) => p._id === postId);
                if (post) {
                  post.upvotes = data.upvotes;
                  post.downvotes = data.downvotes;
                }
              }
            )
          );
        } catch (error) {
          console.error("[DEBUG] Admin post downvote failed:", error);
        }
      },
      invalidatesTags: ["Post"],
    }),

    removeAdminPostUpvote: builder.mutation({
      query: (postId) => ({
        url: `adminposts/${postId}/upvote`,
        method: "DELETE",
      }),
      async onQueryStarted(postId, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          console.log("[DEBUG] Remove admin post upvote successful:", data);

          // Update the cache for admin posts
          dispatch(
            dengueApi.util.updateQueryData(
              "getAllAdminPosts",
              undefined,
              (draft) => {
                const post = draft.find((p) => p._id === postId);
                if (post) {
                  post.upvotes = data.upvotes;
                  post.downvotes = data.downvotes;
                }
              }
            )
          );
        } catch (error) {
          console.error("[DEBUG] Remove admin post upvote failed:", error);
        }
      },
      invalidatesTags: ["Post"],
    }),

    removeAdminPostDownvote: builder.mutation({
      query: (postId) => ({
        url: `adminposts/${postId}/downvote`,
        method: "DELETE",
      }),
      async onQueryStarted(postId, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          console.log("[DEBUG] Remove admin post downvote successful:", data);

          // Update the cache for admin posts
          dispatch(
            dengueApi.util.updateQueryData(
              "getAllAdminPosts",
              undefined,
              (draft) => {
                const post = draft.find((p) => p._id === postId);
                if (post) {
                  post.upvotes = data.upvotes;
                  post.downvotes = data.downvotes;
                }
              }
            )
          );
        } catch (error) {
          console.error("[DEBUG] Remove admin post downvote failed:", error);
        }
      },
      invalidatesTags: ["Post"],
    }),

    // Admin post comments endpoints
    getAdminPostComments: builder.query({
      query: (postId) => `comments/${postId}`,
      providesTags: (result, error, postId) => [
        { type: "Comments", id: postId },
      ],
    }),

    addAdminPostComment: builder.mutation({
      query: ({ postId, content }) => ({
        url: `comments/${postId}`,
        method: "POST",
        body: { content },
      }),
      invalidatesTags: (result, error, { postId }) => [
        { type: "Comments", id: postId },
      ],
    }),

    upvoteAdminPostComment: builder.mutation({
      query: (commentId) => ({
        url: `comments/${commentId}/upvote`,
        method: "POST",
      }),
      async onQueryStarted(commentId, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          console.log("[DEBUG] Admin post comment upvote successful:", data);

          // Update the cache for admin post comments
          dispatch(
            dengueApi.util.updateQueryData(
              "getAdminPostComments",
              data.adminPost,
              (draft) => {
                const comment = draft.find((c) => c._id === commentId);
                if (comment) {
                  comment.upvotes = data.upvotes;
                  comment.downvotes = data.downvotes;
                }
              }
            )
          );
        } catch (error) {
          console.error("[DEBUG] Admin post comment upvote failed:", error);
        }
      },
      invalidatesTags: (result, error, commentId) => [
        { type: "Comments", id: "LIST" },
      ],
    }),

    downvoteAdminPostComment: builder.mutation({
      query: (commentId) => ({
        url: `comments/${commentId}/downvote`,
        method: "POST",
      }),
      async onQueryStarted(commentId, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          console.log("[DEBUG] Admin post comment downvote successful:", data);

          // Update the cache for admin post comments
          dispatch(
            dengueApi.util.updateQueryData(
              "getAdminPostComments",
              data.adminPost,
              (draft) => {
                const comment = draft.find((c) => c._id === commentId);
                if (comment) {
                  comment.upvotes = data.upvotes;
                  comment.downvotes = data.downvotes;
                }
              }
            )
          );
        } catch (error) {
          console.error("[DEBUG] Admin post comment downvote failed:", error);
        }
      },
      invalidatesTags: (result, error, commentId) => [
        { type: "Comments", id: "LIST" },
      ],
    }),

    removeAdminPostCommentUpvote: builder.mutation({
      query: (commentId) => ({
        url: `comments/${commentId}/upvote`,
        method: "DELETE",
      }),
      async onQueryStarted(commentId, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          console.log(
            "[DEBUG] Remove admin post comment upvote successful:",
            data
          );

          // Update the cache for admin post comments
          dispatch(
            dengueApi.util.updateQueryData(
              "getAdminPostComments",
              data.adminPost,
              (draft) => {
                const comment = draft.find((c) => c._id === commentId);
                if (comment) {
                  comment.upvotes = data.upvotes;
                  comment.downvotes = data.downvotes;
                }
              }
            )
          );
        } catch (error) {
          console.error(
            "[DEBUG] Remove admin post comment upvote failed:",
            error
          );
        }
      },
      invalidatesTags: (result, error, commentId) => [
        { type: "Comments", id: "LIST" },
      ],
    }),

    removeAdminPostCommentDownvote: builder.mutation({
      query: (commentId) => ({
        url: `comments/${commentId}/downvote`,
        method: "DELETE",
      }),
      async onQueryStarted(commentId, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          console.log(
            "[DEBUG] Remove admin post comment downvote successful:",
            data
          );

          // Update the cache for admin post comments
          dispatch(
            dengueApi.util.updateQueryData(
              "getAdminPostComments",
              data.adminPost,
              (draft) => {
                const comment = draft.find((c) => c._id === commentId);
                if (comment) {
                  comment.upvotes = data.upvotes;
                  comment.downvotes = data.downvotes;
                }
              }
            )
          );
        } catch (error) {
          console.error(
            "[DEBUG] Remove admin post comment downvote failed:",
            error
          );
        }
      },
      invalidatesTags: (result, error, commentId) => [
        { type: "Comments", id: "LIST" },
      ],
    }),

    // Add this to the endpoints object
    getRecentReportsForBarangay: builder.mutation({
      query: (barangayName) => ({
        url: "barangays/get-recent-reports-for-barangay",
        method: "POST",
        body: { barangay_name: barangayName },
      }),
      transformResponse: (response) => {
        console.log("[DEBUG] Recent reports for barangay response:", response);
        return response;
      },
    }),

    // Update profile photo
    updateProfilePhoto: builder.mutation({
      query: (formData) => ({
        url: "accounts/profile-photo",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["Accounts"],
    }),

    // Update user bio
    updateBio: builder.mutation({
      query: ({ id, bio }) => ({
        url: `accounts/${id}/bio`,
        method: "PATCH",
        body: { bio },
      }),
      invalidatesTags: ["Accounts"],
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
  useVerifyResetOtpMutation,
  useResetPasswordMutation,
  useResendResetOtpMutation,

  // Post hooks
  useGetPostsQuery,
  useLazyGetPostsQuery,
  useGetPostByIdQuery,
  useCreatePostMutation,
  useCreatePostWithImageMutation,
  useDeletePostMutation,
  useValidatePostMutation,
  useLikePostMutation,

  // Comment hooks
  useGetCommentsQuery,
  useAddCommentMutation,
  useUpvoteCommentMutation,
  useDownvoteCommentMutation,
  useRemoveCommentUpvoteMutation,
  useRemoveCommentDownvoteMutation,

  // Intervention hooks
  useGetInterventionQuery,
  useGetAllInterventionsQuery,
  useCreateInterventionMutation,
  useDeleteInterventionMutation,
  useUpdateInterventionMutation,

  // Analytics hooks
  useGetAnalyticsQuery,
  useAnalyzeCrowdsourcedReportsMutation,

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

  useUpvoteReportMutation,
  useDownvoteReportMutation,
  useRemoveUpvoteMutation,
  useRemoveDownvoteMutation,

  // Add the test endpoint hook
  useTestApiConnectionQuery,

  // Admin post voting endpoints
  useUpvoteAdminPostMutation,
  useDownvoteAdminPostMutation,
  useRemoveAdminPostUpvoteMutation,
  useRemoveAdminPostDownvoteMutation,

  // Admin post comments endpoints
  useGetAdminPostCommentsQuery,
  useAddAdminPostCommentMutation,
  useUpvoteAdminPostCommentMutation,
  useDownvoteAdminPostCommentMutation,
  useRemoveAdminPostCommentUpvoteMutation,
  useRemoveAdminPostCommentDownvoteMutation,

  // Add this new endpoint
  useGetDeletedAccountsQuery,

  // Add this new endpoint
  useGetBasicProfilesQuery,

  // Add this to the exported hooks
  useGetRecentReportsForBarangayMutation,

  // Profile photo update
  useUpdateProfilePhotoMutation,

  // Update user bio
  useUpdateBioMutation,
} = dengueApi;
