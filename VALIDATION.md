# Kiểm thử bản JSON/Web/PPTX — 2026-10-11

## Môi trường và bảo toàn

- Cài lại bằng `npm ci` từ lockfile mới thành công, rồi chạy lại test/build.
- Node.js 24.19.0; dependency cài từ npm với kiểm tra integrity của lockfile.
- Bản trước nâng cấp được lưu ở `/workspace/backups/ai-presentation-studio-before-json-20261011.tgz`, archive đã liệt kê kiểm tra có nguồn/vendor/lockfile.
- Vendor ThreeUI không đổi: SHA-256 `93e21ffbcb4a2fef67574d3bb817d46a8d4c50c23575c2717259c5db1a02acdd`.
- Lockfile cũ nằm trong archive. Lockfile hiện tại cập nhật để thêm Ajv, PptxGenJS, tsx, singlefile plugin và dependency kiểm thử; không bị xóa.
- Không sửa nguồn ThreeUI, cấu hình 4 Agent, tập lệnh cài đặt môi trường; không push GitHub hoặc Publish.

## Đã đạt

| Kiểm tra | Bằng chứng |
| --- | --- |
| TypeScript strict + Vite production build | `npm run build`, tạo bundle HTML và export template |
| 11 kiểm thử tự động | `npm test`: 11 pass, 0 fail/skipped; schema, block sai, revision, ownership 4 Agent, approval/hash, quality errors, editable PPTX, chart/workbook và ảnh |
| Schema và ngữ nghĩa | Bản mẫu hợp lệ; JSON sai cú pháp, trường không hỗ trợ, slide ID trùng, revision sai, effect lạ, chart không khớp, ảnh thiếu bị từ chối |
| Cơ chế phê duyệt | Draft không xuất; hash/revision phải khớp; sửa nội dung/notes hủy phê duyệt; lỗi chất lượng mở chặn duyệt |
| Agent | Unit test áp dụng cả 4 role theo thứ tự; sai phạm vi/ID, gói stale và slide không tồn tại bị từ chối, tài liệu cũ không bị mutation |
| Chromium dev và production | `npm run test:browser`, cổng 5175/4175: notes, navigation, boundary, restart, fullscreen, import lỗi, Agent review/stale, approval, tải PPTX/Web, editor invalidation, reload localStorage |
| Desktop và mobile | Viewport 1440x1080 và 390x844; 3 slide mobile không tràn ngang; ảnh desktop và mobile slide 2 đã được xem trực tiếp |
| Web xuất độc lập | HTML thực tế được tải từ ứng dụng; phục vụ qua route kiểm thử khi context offline và chặn mọi request bổ sung; render và chuyển slide thành công |
| Web bị sửa | Sửa dữ liệu title nhưng giữ approval/hash: bản xuất từ chối hiển thị slide |
| Lỗi trình duyệt | Lần chạy cuối: 0 uncaught page errors |
| PowerPoint OOXML | ZIP CRC hợp lệ, toàn bộ XML/rels parse được; 3 slide, text box/shape, ảnh PNG nhúng, 3 notes; bản chart có chart XML và workbook .xlsx |
| Đọc/chỉnh sửa PPTX bằng thư viện độc lập | python-pptx mở được bản mẫu, chart test, 2 file từ browser; chỉnh text trên bản sao tạm, lưu và mở lại thành công |
| Quét thông tin nhạy cảm | Audit heuristic trên các file text chuẩn bị bảo toàn: không phát hiện mẫu credential; 478 file text trong vendor cũng được kiểm tra, chỉ báo tên file, không in giá trị |

Bằng chứng máy đọc: `artifacts/browser-results.json`, `artifacts/pptx-results.json`. Script và test được lưu trong dự án để chạy lại. Bản mẫu `presentation.sample.approved.json`, `.sample.pptx` và `.sample.html` dùng cùng snapshot fixture được duyệt để minh họa; không tự phê duyệt tài liệu người dùng.

## Giới hạn và chưa kiểm thử

- Không có Microsoft PowerPoint/LibreOffice ở môi trường hiện tại để xem kết quả render trực tiếp. Việc mở/chỉnh sửa trong ứng dụng Office và độ khớp font giữa máy chưa được xác minh. Kiểm tra OOXML và python-pptx không thay thế kiểm thử hiển thị Office.
- Chromium quản lý tại đây cấm URL file:// (`ERR_BLOCKED_BY_ADMINISTRATOR`). HTML được kiểm tra qua route mạng cô lập, không tuyên bố đã mở trực tiếp file://. Không thay đổi chính sách trình duyệt.
- Chưa kiểm thử Safari/Firefox, thiết bị di động thật, bàn phím phần cứng trên mobile, hoặc toàn bộ tổ hợp nội dung tối đa. Dữ liệu dài vẫn có thể cần người dùng chỉnh bố cục.
- Theme/layout/effect và block giới hạn theo schema; không có trình sửa WYSIWYG, undo hoặc merge song song.
- Không có API ChatGPT, AI generation, cộng tác realtime, backend, xác thực danh tính Agent/người duyệt, chữ ký số hay lưu trữ đám mây. Hash là kiểm tra tính toàn vẹn trong workflow cục bộ.
- Web và PPTX chia sẻ dữ liệu, không đảm bảo pixel-perfect. ThreeUI được thay bằng PNG tĩnh ở PPTX; các card/text/chart vẫn chỉnh sửa được.
- LocalStorage không phải sao lưu. Import full JSON thay tài liệu đang mở; xuất JSON trước nếu cần bảo toàn tài liệu cũ.
- Quét bí mật dùng heuristic và không bảo đảm phát hiện mọi thông tin nhạy cảm. Cần rà soát trước khi đưa lên GitHub.

## Sửa lỗi trong quá trình triển khai

Các lỗi TypeScript do API PptxGenJS 4, lỗi kiểm tra template Web và lỗi trong script kiểm thử đã được sửa rồi chạy lại kiểm tra liên quan. Kết quả trên phản ánh bản cuối đạt, không tính những lần chạy lỗi là thành công.
