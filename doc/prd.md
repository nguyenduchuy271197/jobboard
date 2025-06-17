# Functional Requirements cho MVP của Job Board

## Tính năng chung cho tất cả người dùng

| ID   | Nhóm tính năng | Tính năng               | Mô tả                                                          | Độ ưu tiên | Dependencies |
| ---- | -------------- | ----------------------- | -------------------------------------------------------------- | ---------- | ------------ |
| FR01 | Xác thực       | Đăng ký tài khoản       | Cho phép người dùng tạo tài khoản ứng viên hoặc nhà tuyển dụng | Cao        | Không có     |
| FR02 | Xác thực       | Đăng nhập/Xác thực      | Cho phép người dùng đăng nhập vào hệ thống                     | Cao        | FR01         |
| FR03 | Xác thực       | Quản lý hồ sơ cá nhân   | Cho phép người dùng xem và chỉnh sửa thông tin cá nhân         | Cao        | FR01, FR02   |
| FR04 | Công việc      | Xem danh sách công việc | Hiển thị danh sách việc làm có phân trang                      | Cao        | Không có     |
| FR05 | Công việc      | Xem chi tiết công việc  | Hiển thị thông tin chi tiết công việc, yêu cầu, mức lương      | Cao        | FR04         |
| FR06 | Công việc      | Tìm kiếm công việc      | Cho phép tìm kiếm công việc theo từ khóa, địa điểm             | Cao        | FR04         |

## Tính năng dành cho Ứng viên

| ID   | Nhóm tính năng | Tính năng           | Mô tả                                                    | Độ ưu tiên | Dependencies |
| ---- | -------------- | ------------------- | -------------------------------------------------------- | ---------- | ------------ |
| FR07 | Hồ sơ ứng viên | Tạo hồ sơ cơ bản    | Nhập thông tin cá nhân, kinh nghiệm, kỹ năng             | Cao        | FR03         |
| FR08 | Hồ sơ ứng viên | Upload CV           | Cho phép upload file CV (PDF) lên hệ thống               | Cao        | FR07         |
| FR09 | Ứng tuyển      | Ứng tuyển công việc | Cho phép ứng viên nộp đơn ứng tuyển cho vị trí mong muốn | Cao        | FR05, FR07   |
| FR10 | Ứng tuyển      | Lịch sử ứng tuyển   | Xem danh sách các công việc đã ứng tuyển và trạng thái   | Cao        | FR09         |

## Tính năng dành cho Nhà tuyển dụng

| ID   | Nhóm tính năng         | Tính năng                | Mô tả                                                          | Độ ưu tiên | Dependencies |
| ---- | ---------------------- | ------------------------ | -------------------------------------------------------------- | ---------- | ------------ |
| FR11 | Hồ sơ công ty          | Tạo hồ sơ công ty cơ bản | Nhập thông tin công ty cơ bản: tên, địa chỉ, mô tả             | Cao        | FR03         |
| FR12 | Quản lý tin tuyển dụng | Đăng tin tuyển dụng      | Tạo và đăng tin tuyển dụng với mô tả công việc, yêu cầu        | Cao        | FR11         |
| FR13 | Quản lý tin tuyển dụng | Quản lý tin đã đăng      | Xem, chỉnh sửa các tin tuyển dụng đã đăng                      | Cao        | FR12         |
| FR14 | Quản lý ứng viên       | Xem hồ sơ ứng viên       | Xem danh sách và chi tiết hồ sơ ứng viên đã ứng tuyển          | Cao        | FR09         |
| FR15 | Quản lý ứng viên       | Cập nhật trạng thái      | Cập nhật trạng thái hồ sơ (đang xét, phỏng vấn, từ chối, nhận) | Cao        | FR14         |

## Tính năng dành cho Quản trị viên/Admin

| ID   | Nhóm tính năng     | Tính năng            | Mô tả                                                 | Độ ưu tiên | Dependencies |
| ---- | ------------------ | -------------------- | ----------------------------------------------------- | ---------- | ------------ |
| FR16 | Quản lý danh mục   | Quản lý ngành nghề   | Thêm, sửa, xóa danh mục ngành nghề                    | Cao        | FR02         |
| FR17 | Quản lý người dùng | Quản lý tài khoản    | Xem danh sách tài khoản ứng viên và nhà tuyển dụng    | Cao        | FR01         |
| FR18 | Quản lý nội dung   | Duyệt tin tuyển dụng | Xét duyệt tin tuyển dụng trước khi hiển thị công khai | Cao        | FR12         |
