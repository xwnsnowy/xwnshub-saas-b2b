# Wrangler Commands Guide

Dưới đây là các lệnh `pnpm dlx wrangler` phổ biến để làm việc với Cloudflare Workers (dựa trên output của bạn), cùng tác dụng từng lệnh:

- **`pnpm dlx wrangler login`**  
  Đăng nhập vào Cloudflare account qua OAuth. Cần thiết để deploy hoặc manage Workers.

- **`pnpm dlx wrangler types`** (lưu ý: bạn gõ `type` nhưng đúng là `types`)  
  Generate TypeScript types từ config Wrangler (như bindings, env vars) và ghi vào `worker-configuration.d.ts`. Chạy sau khi thay đổi `wrangler.json`.

- **`pnpm dlx wrangler dev`**  
  Chạy local server để develop Worker (như trong output của bạn). Mở http://127.0.0.1:8787 để test, với hot-reload và bindings local.

- **`pnpm dlx wrangler deploy`**  
  Deploy Worker lên Cloudflare production. Upload code và config, tạo version mới.

- **`pnpm dlx wrangler tail [worker-name]`**  
  Theo dõi logs real-time từ Worker deployed. Thay `[worker-name]` bằng tên Worker.

Các lệnh khác như `wrangler init` (tạo project mới) hoặc `wrangler whoami` (check account). Chạy `pnpm dlx wrangler --help` để xem full list. Nếu gặp lỗi, đảm bảo Wrangler version mới nhất (`pnpm dlx wrangler --version`).
