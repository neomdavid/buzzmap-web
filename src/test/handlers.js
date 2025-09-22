import { http, HttpResponse } from "msw";

// Adjust basePath if your services call absolute URLs
const basePath = "/api";

export const handlers = [
  // Example dengue API list
  http.get(`${basePath}/dengue/:path*`, () => {
    return HttpResponse.json({ data: [] }, { status: 200 });
  }),
];
