import { toast } from "react-toastify";
export const navLinks = [
  { name: "Home", to: "/home" },
  { name: "Mapping", to: "/mapping" },
  { name: "Community", to: "/community" },
  { name: "BuzzLine", to: "/buzzline" },
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
  {
    id: "RPT-00128",
    location: "Barangay Sauyo",
    date: "2025-03-08",
    status: "Verified",
  },
  {
    id: "RPT-00129",
    location: "Barangay Novaliches Proper",
    date: "2025-03-09",
    status: "Pending",
  },
  {
    id: "RPT-00130",
    location: "Barangay Bagbag",
    date: "2025-03-10",
    status: "Rejected",
  },
  {
    id: "RPT-00131",
    location: "Barangay Kaligayahan",
    date: "2025-03-11",
    status: "Verified",
  },
  {
    id: "RPT-00132",
    location: "Barangay San Bartolome",
    date: "2025-03-12",
    status: "Pending",
  },
  {
    id: "RPT-00133",
    location: "Barangay Sta. Lucia",
    date: "2025-03-13",
    status: "Verified",
  },
  {
    id: "RPT-00134",
    location: "Barangay Greater Lagro",
    date: "2025-03-14",
    status: "Rejected",
  },
  {
    id: "RPT-00135",
    location: "Barangay North Fairview",
    date: "2025-03-15",
    status: "Pending",
  },
  {
    id: "RPT-00136",
    location: "Barangay San Agustin",
    date: "2025-03-16",
    status: "Verified",
  },
  {
    id: "RPT-00137",
    location: "Barangay Gulod",
    date: "2025-03-17",
    status: "Verified",
  },
  {
    id: "RPT-00138",
    location: "Barangay Pasong Putik",
    date: "2025-03-18",
    status: "Pending",
  },
  {
    id: "RPT-00139",
    location: "Barangay Fairview",
    date: "2025-03-19",
    status: "Rejected",
  },
  {
    id: "RPT-00140",
    location: "Barangay Capri",
    date: "2025-03-20",
    status: "Verified",
  },
  {
    id: "RPT-00141",
    location: "Barangay Nagkaisang Nayon",
    date: "2025-03-21",
    status: "Pending",
  },
  {
    id: "RPT-00142",
    location: "Barangay Bagong Silangan",
    date: "2025-03-22",
    status: "Verified",
  },
  {
    id: "RPT-00143",
    location: "Barangay Old Balara",
    date: "2025-03-23",
    status: "Rejected",
  },
  {
    id: "RPT-00144",
    location: "Barangay Pansol",
    date: "2025-03-24",
    status: "Verified",
  },
  {
    id: "RPT-00145",
    location: "Barangay Krus na Ligas",
    date: "2025-03-25",
    status: "Pending",
  },
  {
    id: "RPT-00146",
    location: "Barangay Loyola Heights",
    date: "2025-03-26",
    status: "Verified",
  },
  {
    id: "RPT-00147",
    location: "Barangay UP Campus",
    date: "2025-03-27",
    status: "Rejected",
  },
  {
    id: "RPT-00148",
    location: "Barangay Vasra",
    date: "2025-03-28",
    status: "Pending",
  },
  {
    id: "RPT-00149",
    location: "Barangay Mariana",
    date: "2025-03-29",
    status: "Verified",
  },
  {
    id: "RPT-00150",
    location: "Barangay Immaculate Conception",
    date: "2025-03-30",
    status: "Pending",
  },
  {
    id: "RPT-00151",
    location: "Barangay Kamuning",
    date: "2025-03-31",
    status: "Verified",
  },
  {
    id: "RPT-00152",
    location: "Barangay Sacred Heart",
    date: "2025-04-01",
    status: "Rejected",
  },
];

export const alerts = [
  {
    title: "Dengue Spike in Holy Spirit",
    borderColor: "border-error",
    bgColor: "bg-error",
    messages: [
      { label: "Last 2 Weeks:", text: "30% Increase in cases" },
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

const toastOptions = {
  position: "top-center",
  autoClose: 3000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: false,
  pauseOnFocusLoss: false, // <-- this ensures it closes even if you switch tabs
  draggable: true,
  className: "text-[15px] mt-10",
  style: { zIndex: 999999999999999 },
};

export const toastSuccess = (message) => toast.success(message, toastOptions);
export const toastError = (message) => toast.error(message, toastOptions);
export const toastInfo = (msg) => toast.info(msg, toastOptions);
export const toastWarn = (msg) => toast.warn(msg, toastOptions);

export const showCustomToast = (message, type) => {
  // Create a div element to act as a custom toast
  const toast = document.createElement("div");
  toast.innerText = message;
  toast.style.position = "fixed";
  toast.style.top = "7%";
  toast.style.left = "50%";
  toast.style.transform = "translateX(-50%)";
  toast.style.padding = "10px 20px";
  toast.style.borderRadius = "8px";
  toast.style.boxShadow = "0 4px 6px rgba(0, 0, 0, 0.1)";
  toast.style.fontSize = "14px";
  toast.style.zIndex = "1000000000000000"; // Maximum valid z-index value
  toast.style.opacity = "0";
  toast.style.transition = "opacity 0.5s";
  toast.style.color = "#FFFFFF"; // Set text color to white for visibility

  // Set background color based on the type of message
  if (type === "success") {
    toast.style.backgroundColor = "#4CAF50"; // Green for success
  } else if (type === "error") {
    toast.style.backgroundColor = "#f44336"; // Red for error
  } else if (type === "warning") {
    toast.style.backgroundColor = "#FF9800"; // Orange for warning
  }

  // Append the toast to the body
  document.body.appendChild(toast);

  // Fade in the toast
  setTimeout(() => {
    toast.style.opacity = "1";
  }, 100);

  // Remove the toast after 3 seconds
  setTimeout(() => {
    toast.style.opacity = "0";
    setTimeout(() => {
      document.body.removeChild(toast);
    }, 500);
  }, 3000);
};

export const formatDateForInput = (dateString) => {
  const date = new Date(dateString); // Convert the string into a Date object
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Add leading 0 if month < 10
  const day = String(date.getDate()).padStart(2, "0"); // Add leading 0 if day < 10
  const hours = String(date.getHours()).padStart(2, "0"); // Add leading 0 if hours < 10
  const minutes = String(date.getMinutes()).padStart(2, "0"); // Add leading 0 if minutes < 10

  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

export const formatArticleDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export const formatDateWithRelativeTime = (dateString) => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const diffMonths = Math.floor(diffDays / 30);
  const diffWeeks = Math.floor(diffDays / 7);

  let relativeTime = '';
  if (diffMonths > 0) {
    relativeTime = `${diffMonths} ${diffMonths === 1 ? 'month' : 'months'} ago`;
  } else if (diffWeeks > 0) {
    relativeTime = `${diffWeeks} ${diffWeeks === 1 ? 'week' : 'weeks'} ago`;
  } else if (diffDays > 0) {
    relativeTime = `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
  } else {
    relativeTime = 'today';
  }

  return `${formatArticleDate(dateString)} (${relativeTime})`;
};

// utils.js or utils.jsx

export const getBarangayNames = (barangayData) => {
  // Ensure barangayData is valid
  if (!barangayData || !Array.isArray(barangayData.features)) {
    return [];
  }

  // Extract barangay names from the GeoJSON features
  const barangayNames = barangayData.features.map(
    (feature) => feature.properties.name
  );
  return barangayNames;
};
