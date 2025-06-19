export const EXPERIENCE_LEVEL_LABELS = {
  entry_level: "Dưới 1 năm",
  mid_level: "1-3 năm", 
  senior_level: "3-5 năm",
  executive: "Trên 5 năm",
} as const;

export const EMPLOYMENT_TYPE_LABELS = {
  full_time: "Toàn thời gian",
  part_time: "Bán thời gian",
  contract: "Hợp đồng",
  freelance: "Freelance",
  internship: "Thực tập",
} as const;

export const APPLICATION_STATUS_CONFIG = {
  pending: {
    label: "Chờ xử lý",
    color: "bg-yellow-100 text-yellow-800 border-yellow-200",
  },
  reviewing: {
    label: "Đang xem xét",
    color: "bg-blue-100 text-blue-800 border-blue-200",
  },
  interviewing: {
    label: "Phỏng vấn",
    color: "bg-purple-100 text-purple-800 border-purple-200",
  },
  accepted: {
    label: "Được chấp nhận",
    color: "bg-green-100 text-green-800 border-green-200",
  },
  rejected: {
    label: "Bị từ chối",
    color: "bg-red-100 text-red-800 border-red-200",
  },
  withdrawn: {
    label: "Đã rút lại",
    color: "bg-gray-100 text-gray-800 border-gray-200",
  },
} as const;

export const JOB_STATUS_CONFIG = {
  draft: {
    label: "Nháp",
    color: "bg-gray-100 text-gray-800 border-gray-200",
  },
  active: {
    label: "Đang tuyển",
    color: "bg-green-100 text-green-800 border-green-200",
  },
  paused: {
    label: "Tạm dừng",
    color: "bg-yellow-100 text-yellow-800 border-yellow-200",
  },
  closed: {
    label: "Đã đóng",
    color: "bg-red-100 text-red-800 border-red-200",
  },
} as const;

// Helper function to get experience level label
export const getExperienceLevelLabel = (level: string) => {
  return EXPERIENCE_LEVEL_LABELS[level as keyof typeof EXPERIENCE_LEVEL_LABELS] || level;
};

// Helper function to get employment type label
export const getEmploymentTypeLabel = (type: string) => {
  return EMPLOYMENT_TYPE_LABELS[type as keyof typeof EMPLOYMENT_TYPE_LABELS] || type;
};

// Helper function to get application status config
export const getApplicationStatusConfig = (status: string) => {
  return APPLICATION_STATUS_CONFIG[status as keyof typeof APPLICATION_STATUS_CONFIG] || {
    label: status,
    color: "bg-gray-100 text-gray-800 border-gray-200",
  };
};

// Helper function to get job status config
export const getJobStatusConfig = (status: string) => {
  return JOB_STATUS_CONFIG[status as keyof typeof JOB_STATUS_CONFIG] || {
    label: status,
    color: "bg-gray-100 text-gray-800 border-gray-200",
  };
};

// Salary formatting helper
export const formatSalary = (min?: number | null, max?: number | null) => {
  if (!min && !max) return "Thỏa thuận";

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(num % 1000000 === 0 ? 0 : 1)}M`;
    }
    return new Intl.NumberFormat("vi-VN").format(num);
  };

  if (min && max) {
    return `${formatNumber(min)} - ${formatNumber(max)} VNĐ`;
  }
  if (min) {
    return `Từ ${formatNumber(min)} VNĐ`;
  }
  if (max) {
    return `Lên đến ${formatNumber(max)} VNĐ`;
  }
  return "Thỏa thuận";
}; 