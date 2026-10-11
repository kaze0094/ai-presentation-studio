# AI PRESENTATION STUDIO

React + TypeScript + Vite. Một Presentation JSON tạo Web Presentation (React + ThreeUI) và PowerPoint có các thành phần chỉnh sửa được. Quy trình 4 Agent trao đổi bằng file; không có API ChatGPT hay thay đổi cấu hình ChatGPT Project.

## Khởi động trong Codex

Dùng thư mục hiện có; không tạo Git worktree nếu chưa được yêu cầu. Cần Node.js 24.

```bash
cd /workspace/ai-presentation-studio
npm ci --cache /workspace/.npm-cache --no-audit --no-fund
npm run build
npm run dev -- --host 0.0.0.0 --port 5175 --strictPort
```

Build tạo ứng dụng và template Web độc lập. Cần build lại sau khi sửa mã trước khi dùng “Xuất Web”. Xem bản production bằng `npm run preview -- --host 0.0.0.0 --port 4175 --strictPort`. Các tiến trình phải khởi động lại ở phiên mới. Nếu cổng đang được dùng, kiểm tra tiến trình trước; không dừng tiến trình không thuộc ứng dụng của bạn.

## Sử dụng

1. Nhập Presentation JSON hoặc sửa bài mẫu bằng “Chỉnh sửa JSON”. Dữ liệu được kiểm tra theo `schemas/presentation.schema.json` và các quy tắc ngữ nghĩa.
2. Xem slide và Speaker Notes bằng nút “Ghi chú”. ←/→, PageUp/PageDown, Space chuyển slide; Home/End đến đầu/cuối; F bật/tắt toàn màn hình. Các phím điều hướng không can thiệp khi đang nhập văn bản.
3. Chỉnh sửa tạo revision mới, lưu history, hủy phê duyệt cũ và đưa đánh giá về pending. Bản nháp có watermark và không xuất Web/PPTX chính thức được.
4. Đọc nội dung, kiểm tra nhận xét, tích xác nhận rồi chọn “Phê duyệt revision”. Lỗi chất lượng chưa xử lý sẽ chặn duyệt. Chỉ revision có hash SHA-256 khớp mới được xuất.
5. “Xuất PPTX” và “Xuất Web” lấy snapshot cùng dữ liệu đã duyệt. Web là một file HTML có mã React, CSS, dữ liệu và hiệu ứng ThreeUI nhúng. PPTX có text box, shape, chart/workbook khi dùng chart, ảnh và speaker notes. Hiệu ứng ThreeUI dùng ảnh PNG tĩnh trong PowerPoint; slide không bị biến toàn bộ thành ảnh.
6. “Xuất JSON” bảo toàn dữ liệu làm việc, kể cả bản nháp. Nhập toàn bộ JSON thay thế tài liệu đang mở và luôn hủy trạng thái approved để người dùng kiểm tra lại; đây không phải thao tác merge. Xuất JSON trước khi thay tài liệu nếu muốn giữ phiên bản cũ.

Ứng dụng lưu một tài liệu trong localStorage của trình duyệt theo origin. Không coi localStorage là bản sao lưu lâu dài. Xuất JSON thường xuyên; trình duyệt mới, đổi cổng/origin hoặc xóa dữ liệu sẽ không có tài liệu cũ.

## Quy trình 4 Agent

Xem `AGENT_WORKFLOW.md`. Nút “Gói bàn giao 4 Agent” xuất tài liệu và revision hiện tại để gửi thủ công vào ChatGPT Project. Agent trả gói theo vai trò; “Nhập gói Agent” kiểm tra deck ID, baseRevision, quyền sở hữu trường và dữ liệu kết quả. Gói lỗi hoặc cũ không thay đổi tài liệu.

Không có agent chạy nền, không tự gửi nội dung tới ChatGPT và không thay đổi cấu hình 4 Agent. Các tên actor trong JSON là nhãn quy trình, không xác thực danh tính.

## Dữ liệu được hỗ trợ trong phiên bản 1.0

- Layout: hero, content, closing; theme studio-dark, 16:9; tiếng Việt.
- Tối đa 30 slide. Content layout có một khối: text, bullets, tối đa 3 cards, bar chart hoặc image. Hero/closing dùng title/subtitle, không có khối bổ sung.
- Ảnh PNG/JPEG dạng data URL, tham chiếu qua asset ID; không nạp JavaScript, HTML tùy ý hoặc URL ảnh từ JSON. Có giới hạn dung lượng, độ dài văn bản và số hạng mục để kiểm soát bố cục.
- Hiệu ứng được phép: none, threeui.constellation. Chế độ giảm chuyển động dùng ảnh tĩnh.
- Approval là kiểm soát công việc cục bộ và kiểm tra tính toàn vẹn, không phải chữ ký số, phân quyền nhiều người dùng hay chứng nhận nội dung. Người kiểm soát mã hoặc JSON có thể tạo approval mới. Không lưu bí mật trong JSON/notes.

## Bàn giao

- `examples/presentation.draft.json`: 3 slide mẫu, chưa duyệt.
- `examples/agent-1.json` ... `agent-4.json`: chuỗi gói mẫu từ revision 1 đến 5.
- `artifacts/presentation.sample.approved.json`: snapshot minh họa được duyệt bằng script fixture.
- `artifacts/ai-presentation-studio.sample.pptx` và `.html`: cùng snapshot minh họa. Approval fixture không duyệt tài liệu do người dùng nhập.
- `VALIDATION.md`, `artifacts/browser-results.json`, `artifacts/pptx-results.json`: bằng chứng kiểm thử.

## Kiểm thử lại

```bash
npm test
npm run build
npm run sample:pptx
npm run audit:source
```

Sau khi khởi động dev 5175 và preview 4175: `npm run test:browser`. Test dùng Playwright và `/usr/bin/chromium`; cần có Chromium tương thích trong môi trường. Test tạo context mới, không sửa tài liệu localStorage của người dùng. Kết quả tải file và ảnh chụp được lưu trong `artifacts/`. Browser tại môi trường này cấm URL file://; test Web độc lập phục vụ HTML qua route kiểm thử khi mọi yêu cầu mạng bị chặn. Khả năng mở trực tiếp bằng file:// trên máy người dùng chưa được xác minh tại đây.

## Bảo toàn và tái sử dụng

Bản trước nâng cấp: `/workspace/backups/ai-presentation-studio-before-json-20261011.tgz`, giữ nguồn, lockfile cũ và vendor, loại node_modules/dist. Bản nguồn nâng cấp được bảo toàn thêm tại `/workspace/backups/ai-presentation-studio-json-web-pptx-20261011.tgz`; checksum vendor/lockfile được ghi trong `PRESERVATION.json`. Vendor ThreeUI 1.2.0 vẫn là tarball nguyên gốc. Lockfile hiện tại được cập nhật hợp lệ để thêm dependency, không bị xóa. Các giấy phép ThreeUI nằm trong vendor tarball.

Để dùng ở phiên Codex mới, giữ hoặc chuyển toàn bộ thư mục nguồn, schemas, examples, scripts, tests, vendor và package-lock.json; rồi chạy lệnh cài/khởi động ở trên. Dữ liệu bài thuyết trình phải lưu thành JSON riêng. Chưa có đảm bảo snapshot mới đã Publish; không dựa vào quá trình đang chạy để bảo toàn nguồn.

Repository mục tiêu duy nhất: `https://github.com/kaze0094/ai-presentation-studio`, nhánh `main`. Việc push cần phê duyệt của người dùng; trạng thái thực tế được báo cáo trong phiên Codex, không suy ra từ README. Không có cấu hình GitHub Pages hoặc tự động deploy. `.gitignore` loại node_modules, dist, .env, cache, logs, file tạm và các output kiểm thử sinh ra; các bản mẫu bàn giao và báo cáo được giữ lại. Giấy phép ThreeUI có trong tarball và được sao chép nguyên văn tại `vendor/threeui-licenses/`. `audit:source` là kiểm tra heuristic, không thay thế việc rà soát bảo mật trước commit. Tập lệnh cài đặt môi trường hiện có không bị sửa.
