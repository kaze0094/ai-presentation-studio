# Quy trình trao đổi 4 Agent

Presentation JSON là tài liệu chuẩn; người dùng vận chuyển file giữa Studio và ChatGPT Project. Không có kết nối API hoặc cấu hình Project được chỉnh sửa.

## Hợp đồng chung

```json
{
  "presentationId": "studio-demo",
  "baseRevision": 1,
  "agent": "agent-1",
  "outline": []
}
```

`presentationId` phải khớp bài đang mở. `baseRevision` phải bằng revision hiện tại. Mỗi gói thành công tăng revision một lần, ghi history và hủy approval. Đầu ra phải là JSON object, không có Markdown hoặc mã JavaScript. Không trả lại toàn bộ Presentation thay cho gói thay đổi.

| Vai trò | Trường được trả về | Trách nhiệm |
| --- | --- | --- |
| agent-1 | outline: [{id, story:{purpose,keyMessage}}] | Storyline, danh sách và thứ tự slide. ID ổn định. Danh sách là toàn bộ outline; bỏ ID đồng nghĩa loại slide khỏi tài liệu mới. Slide mới được tạo với nội dung placeholder. |
| agent-2 | contents: [{slideId, content}] | Toàn bộ content của các slide được chỉnh: title, subtitle, eyebrow, blocks, speakerNotes, sources. Không sửa design/story. |
| agent-3 | designs: [{slideId, design}], assets (tùy chọn) | Layout, hiệu ứng, ảnh. Nếu có assets, mảng thay thế toàn bộ assets; phải giữ ảnh vẫn đang được tham chiếu. |
| agent-4 | review: {status, findings} | Đánh giá theo slide/toàn bài. Mỗi finding gồm id, slideId (chuỗi rỗng nếu toàn bài), severity info/warning/error, message và resolved. |

Giới hạn hỗ trợ nằm trong README và JSON Schema. Không yêu cầu Agent tạo layout/effect ngoài danh sách. Nếu cần thêm thành phần, đây là thay đổi ứng dụng riêng, không phải gửi JavaScript trong JSON.

## Thao tác thực tế

1. Mở hoặc nhập bản nháp. Xuất JSON để sao lưu.
2. Xuất “Gói bàn giao 4 Agent”, gửi cho Agent 1 cùng mục tiêu/đối tượng nghe. Yêu cầu trả `agent-1` với outline; nhập gói vào Studio.
3. Xuất gói bàn giao revision mới cho Agent 2. Yêu cầu nội dung và notes theo outline; nhập `agent-2`.
4. Xuất revision mới cho Agent 3. Yêu cầu design và assets trong phạm vi schema; nhập `agent-3`.
5. Xuất revision mới cho Agent 4. Yêu cầu kiểm tra tính logic, bằng chứng, độ dài, độ đọc và notes; nhập `agent-4`.
6. Nếu có lỗi, gửi revision mới cho Agent chịu trách nhiệm sửa, rồi đánh giá lại. Đánh giá cũ bị xóa sau thay đổi nội dung/thiết kế/outline. Không sửa chỉ số baseRevision để ép một gói cũ qua kiểm tra: Agent cần đọc lại bản mới và tạo gói mới.
7. Người dùng kiểm tra mọi slide và notes. Có thể duyệt khi không còn finding severity error chưa xử lý. Pending/warning không tự động cấm người dùng quyết định; thao tác duyệt luôn cần xác nhận rõ ràng.
8. Xuất Web/PPTX. Bất kỳ sửa đổi nào tiếp theo yêu cầu duyệt lại.

## Chạy thử bằng gói mẫu

Nhập `examples/presentation.draft.json` (revision 1), lần lượt nhập agent-1, agent-2, agent-3, agent-4. Revision trở thành 5, review passed, approval vẫn draft. Sau khi kiểm tra và duyệt thủ công, xuất hai định dạng.

Nếu nhiều Agent làm đồng thời từ cùng revision, gói được áp dụng sau có thể bị từ chối do stale baseRevision. Phiên bản này ưu tiên quy trình tuần tự, không tự merge xung đột hoặc tự retry. Người dùng giữ quyền quyết định.

## Ranh giới tin cậy

Phạm vi trường giúp tránh sửa nhầm, không chứng minh người tạo gói là Agent nào. Hash giúp phát hiện dữ liệu sau duyệt bị sửa, không xác thực người phê duyệt. Chưa có server, tài khoản, chữ ký số, khóa phê duyệt hoặc audit log không thể sửa. Muốn cộng tác nhiều người cần thiết kế xác thực và lưu trữ backend trong một giai đoạn được phê duyệt riêng.
