export const navLinks = [
  { name: "Home", to: "/home" },
  { name: "Mapping", to: "/mapping" },
  { name: "Community", to: "/community" },
  { name: "Prevention", to: "/Prevention" },
  { name: "About", to: "/about" },
];

export const reports = [
  {
    id: "RPT-00123",
    location: "Barangay Commonwealth",
    date: "2025-03-01",
    status: "Verified",
  },
  {
    id: "RPT-00124",
    location: "Barangay Holy Spirit",
    date: "2025-03-03",
    status: "Pending",
  },
  {
    id: "RPT-00125",
    location: "Barangay Batasan Hills",
    date: "2025-03-05",
    status: "Rejected",
  },
  {
    id: "RPT-00126",
    location: "Barangay Tandang Sora",
    date: "2025-03-06",
    status: "Verified",
  },
  {
    id: "RPT-00127",
    location: "Barangay Payatas",
    date: "2025-03-07",
    status: "Pending",
  },
];
export const alerts = [
  {
    title: "Dengue Spike in Holy Spirit",
    borderColor: "border-error",
    bgColor: "bg-error",
    messages: [
      { label: "Last 3 Weeks:", text: "30% Increase in cases" },
      { label: "Suggested Action:", text: "Immediate fogging required" },
      { label: "Barangays Affected:", text: "Holy Spirit, Payatas" },
    ],
  },
  {
    title: "Gradual Rise in Payatas",
    borderColor: "border-warning",
    bgColor: "bg-warning",
    messages: [
      { label: "Last Month:", text: "Cases up by 10%" },
      { label: "Suggested Action:", text: "Increase awareness campaign" },
    ],
  },
  {
    title: "Stable in Batasan Hills",
    borderColor: "border-success",
    bgColor: "bg-success",
    messages: [{ label: "", text: "No new cases reported in 3 weeks" }],
  },
  {
    title: "Cluster Detected - Barangay Talipapa",
    borderColor: "border-error",
    bgColor: "bg-error",
    messages: [
      { label: "", text: "5 cases reported in the same area" },
      { label: "Suggested Action:", text: "Targeted Intervention" },
    ],
  },
];
