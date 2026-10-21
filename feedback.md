md 1 , 2 ,3 ,5, 8 ,12 ,13,14


19/10/2026
Trang admin
- Feat Quản lý tài khoản:
  + Tài khoản admin ko cho chỉnh sửa quyền, khóa tài khoản và luôn ở trạng thái hoạt động
  + Ko có chức năng xóa tài khoản


Trang manager:
- Feat Tổng quan: 
  + Báo lỗi khi vừa truy cập: Handler dispatch failed: java.lang.NoClassDefFoundError: com/vn/schedule/dto/response/StatisticsResponse$EmployeeStat

20/10/2026
Trang quản lý:
- Feedback: Quản lý cũng thể phản hồi thay trưởng cửa hàng nếu có quản lý chuỗi đó. và cho nhận xét (ghi chú) mỗi khi chuyển trạng thái


Trang nhân viên:
- Đăng ký ca:
  + Thêm/ Hủy/ Đổi ca chỉ thêm ở trang lịch làm việc do chỉ áp dụng cho lịch nào đang được dùng thôi
  +  chỉ cho thêm sau thời điểm hiện tại thôi
  + 3 cái trên gọi chung là Đặt lịch khẩn -> Có chung 1 list phân loại là yêu cầu. UI tạp là pop up và khi chọn loại thì hiển thị khác field 1 tí
  + Đổi ca thì phải chọn nhân viên để đổi trong ca đó vì giữ nguyên số lượng nhưng khác người thôi
  + Phải có chức năng lọc cho các field
