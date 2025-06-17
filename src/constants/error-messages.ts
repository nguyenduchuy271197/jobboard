export const ERROR_MESSAGES = {
  AUTH: {
    NOT_LOGGED_IN: "Chưa đăng nhập",
    UNAUTHORIZED: "Không có quyền truy cập",
    ADMIN_ONLY: "Chỉ admin mới có thể thực hiện hành động này",
    INVALID_CREDENTIALS: "Thông tin đăng nhập không chính xác",
    EMAIL_NOT_VERIFIED: "Email chưa được xác thực",
  },
  USER: {
    NOT_FOUND: "Người dùng không tồn tại",
    PROFILE_NOT_FOUND: "Profile không tồn tại",
    UPDATE_FAILED: "Không thể cập nhật thông tin",
    CANNOT_CHANGE_OWN_ROLE: "Không thể thay đổi role của chính mình khỏi admin",
    CANNOT_SELF_DEACTIVATE: "Bạn không thể vô hiệu hóa tài khoản của chính mình",
    INVALID_ROLE: "Role không hợp lệ",
    EMAIL_ALREADY_EXISTS: "Email đã tồn tại",
    INVALID_NAME: "Tên không hợp lệ",
    INVALID_PHONE: "Số điện thoại không hợp lệ",
    ALREADY_ACTIVE: "Tài khoản đã được kích hoạt",
    ALREADY_INACTIVE: "Tài khoản đã bị vô hiệu hóa",
    ACTIVATION_FAILED: "Không thể kích hoạt tài khoản người dùng",
    DEACTIVATION_FAILED: "Không thể vô hiệu hóa tài khoản người dùng",
  },
  FILE: {
    NOT_FOUND: "Không tìm thấy file để upload",
    TOO_LARGE: "File quá lớn (tối đa 5MB)",
    INVALID_TYPE: "Chỉ hỗ trợ file JPEG, PNG, hoặc WebP",
    UPLOAD_FAILED: "Không thể upload file",
    DELETE_FAILED: "Không thể xóa file",
    INVALID_FILE: "File không hợp lệ",
  },
  COMPANY: {
    NOT_FOUND: "Công ty không tồn tại",
    CREATE_FAILED: "Không thể tạo công ty",
    UPDATE_FAILED: "Không thể cập nhật thông tin công ty",
    DELETE_FAILED: "Không thể xóa công ty",
    UNAUTHORIZED_ACCESS: "Không có quyền truy cập công ty này",
    ALREADY_VERIFIED: "Công ty đã được xác thực",
    VERIFICATION_FAILED: "Xác thực công ty thất bại",
    ALREADY_EXISTS: "Tên công ty đã tồn tại",
  },
  LOCATION: {
    NOT_FOUND: "Địa điểm không tồn tại",
    CREATE_FAILED: "Không thể tạo địa điểm",
    UPDATE_FAILED: "Không thể cập nhật địa điểm",
    DELETE_FAILED: "Không thể xóa địa điểm",
    ALREADY_EXISTS: "Tên hoặc slug địa điểm đã tồn tại",
    IN_USE_BY_COMPANIES: "Không thể xóa địa điểm đang được sử dụng bởi công ty",
    IN_USE_BY_JOBS: "Không thể xóa địa điểm đang được sử dụng bởi việc làm",
    IN_USE_BY_PROFILES: "Không thể xóa địa điểm đang được sử dụng bởi hồ sơ",
  },
  JOB: {
    NOT_FOUND: "Công việc không tồn tại",
    CREATE_FAILED: "Không thể tạo công việc",
    UPDATE_FAILED: "Không thể cập nhật công việc",
    DELETE_FAILED: "Không thể xóa công việc",
    UNAUTHORIZED_ACCESS: "Bạn không có quyền xem hồ sơ ứng tuyển của công việc này",
    ALREADY_APPLIED: "Đã ứng tuyển công việc này",
    APPLICATION_CLOSED: "Công việc này hiện không còn nhận hồ sơ ứng tuyển",
    EXPIRED: "Công việc đã hết hạn",
  },
  APPLICATION: {
    NOT_FOUND: "Hồ sơ ứng tuyển không tồn tại",
    CREATE_FAILED: "Không thể tạo hồ sơ ứng tuyển",
    UPDATE_FAILED: "Không thể cập nhật hồ sơ ứng tuyển",
    DELETE_FAILED: "Không thể xóa hồ sơ ứng tuyển",
    ALREADY_EXISTS: "Bạn đã ứng tuyển vị trí này rồi",
    UNAUTHORIZED_STATUS_UPDATE: "Bạn không có quyền cập nhật trạng thái hồ sơ ứng tuyển này",
    UNAUTHORIZED_WITHDRAW: "Bạn không có quyền rút lại hồ sơ ứng tuyển này",
    CANNOT_WITHDRAW: "Không thể rút lại hồ sơ ứng tuyển đã được chấp nhận hoặc từ chối",
    WITHDRAW_FAILED: "Không thể rút lại hồ sơ ứng tuyển",
  },
  INDUSTRY: {
    NOT_FOUND: "Ngành nghề không tồn tại",
    CREATE_FAILED: "Không thể tạo ngành nghề",
    UPDATE_FAILED: "Không thể cập nhật ngành nghề",
    DELETE_FAILED: "Không thể xóa ngành nghề",
    ALREADY_EXISTS: "Tên hoặc slug ngành nghề đã tồn tại",
    IN_USE_BY_COMPANIES: "Không thể xóa ngành nghề đang được sử dụng bởi công ty",
    IN_USE_BY_JOBS: "Không thể xóa ngành nghề đang được sử dụng bởi việc làm",
  },
  VALIDATION: {
    REQUIRED_FIELD: "Trường này là bắt buộc",
    INVALID_EMAIL: "Email không hợp lệ",
    INVALID_UUID: "ID không hợp lệ",
    INVALID_ID: "ID không hợp lệ",
    INVALID_URL: "URL không hợp lệ",
    INVALID_DATE: "Ngày không hợp lệ",
    MIN_LENGTH: "Độ dài tối thiểu không đủ",
    MAX_LENGTH: "Độ dài vượt quá giới hạn",
    INVALID_FORMAT: "Định dạng không hợp lệ",
  },
  DATABASE: {
    CONNECTION_FAILED: "Không thể kết nối cơ sở dữ liệu",
    QUERY_FAILED: "Truy vấn cơ sở dữ liệu thất bại",
    CONSTRAINT_VIOLATION: "Vi phạm ràng buộc dữ liệu",
    FOREIGN_KEY_VIOLATION: "Vi phạm khóa ngoại",
    UNIQUE_VIOLATION: "Dữ liệu đã tồn tại",
  },
  GENERIC: {
    UNEXPECTED_ERROR: "Đã có lỗi xảy ra",
    SERVER_ERROR: "Lỗi máy chủ",
    NETWORK_ERROR: "Lỗi kết nối mạng",
    TIMEOUT: "Hết thời gian chờ",
    MAINTENANCE: "Hệ thống đang bảo trì",
  },
} as const;

// Type helper for error messages
export type ErrorMessagePath = 
  | keyof typeof ERROR_MESSAGES.AUTH
  | keyof typeof ERROR_MESSAGES.USER
  | keyof typeof ERROR_MESSAGES.FILE
  | keyof typeof ERROR_MESSAGES.COMPANY
  | keyof typeof ERROR_MESSAGES.JOB
  | keyof typeof ERROR_MESSAGES.APPLICATION
  | keyof typeof ERROR_MESSAGES.VALIDATION
  | keyof typeof ERROR_MESSAGES.DATABASE
  | keyof typeof ERROR_MESSAGES.GENERIC; 