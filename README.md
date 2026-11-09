# B23DCCC071 – Bài thực hành 5: Chat 1-1 realtime với Firebase

Ứng dụng nhắn tin 1-1 theo thời gian thực, viết bằng **React Native CLI** (không dùng Expo), **React Navigation**, **Firebase JS SDK** (`firebase/auth`, `firebase/database`) và `@react-native-community/geolocation`.

Sinh viên: Vũ Minh Hoàn – B23DCCC071

## Tính năng

| Yêu cầu | Cách làm |
| --- | --- |
| Đăng ký / Đăng nhập | Đăng ký gồm họ tên, email, mật khẩu (tối thiểu 6 ký tự) và nhập lại mật khẩu. Đăng nhập bằng Firebase Authentication (Email/Password). Sai tài khoản hoặc mật khẩu thì hiện thông báo lỗi. Phiên đăng nhập được giữ qua AsyncStorage. |
| Đăng xuất | Ở màn Cài đặt. App ghi trạng thái offline, huỷ `onDisconnect`, rồi quay về màn Đăng nhập. |
| Danh bạ | Lấy người dùng đã đăng ký từ `users/` (không gồm bản thân), chia nhóm *Đang hoạt động* / *Ngoại tuyến*. Ô tìm kiếm theo tên hoặc email, gõ không dấu vẫn tìm được. |
| Online/offline realtime | Lắng nghe `.info/connected` và đăng ký `onDisconnect` vào `status/{uid}`. App vào nền thì chuyển offline, mở lại thì online. Người đang offline hiển thị "Hoạt động X phút trước". |
| Chat 1-1 | Tin nhắn hiện ngay, không cần tải lại. Tin của mình bên phải, tin của người kia bên trái. Mỗi tin có giờ gửi, có nhãn ngày (*Hôm nay*, *Hôm qua*…). Không gửi được tin rỗng. Danh sách tự cuộn xuống tin mới nhất. |
| Tiêu đề chat | Hiển thị tên, ảnh đại diện và trạng thái online của người đang chat. |
| Tin vị trí | Nút ghim bản đồ lấy vị trí hiện tại bằng geolocation và gửi đi thành thẻ vị trí. Bấm vào thẻ thì mở Google Maps. |
| Home | Danh sách cuộc trò chuyện gồm ảnh đại diện, tên, tin nhắn cuối và thời gian. Cuộc trò chuyện mới nhất nằm trên cùng. |
| Số tin chưa đọc | Khi gửi tin, `userChats/{người nhận}/{chatId}/unread` được tăng bằng `increment(1)` trong cùng một lần `update`. Mở cuộc trò chuyện thì về 0. Tab *Tin nhắn* có badge tổng số chưa đọc. |
| Thông báo | Danh sách hoạt động: tin nhắn mới, vị trí được chia sẻ. Thông báo chưa đọc được đánh dấu riêng, có nút *Đọc tất cả*. Bấm vào một thông báo thì mở cuộc trò chuyện tương ứng. |
| Huỷ lắng nghe | Mọi `onValue` đều trả về hàm huỷ, và hàm đó được gọi trong cleanup của `useEffect` (`useMessages`, `ChatDataContext`, `AuthContext`), nên tin nhắn không bị hiện lặp. |

## Cấu trúc thư mục

```
src/
  services/      Toàn bộ code Firebase và vị trí
    firebase.ts            Khởi tạo app, auth (AsyncStorage persistence), database
    firebaseConfig.ts      Cấu hình project Firebase
    authService.ts         Đăng ký, đăng nhập, đăng xuất
    authErrors.ts          Đổi mã lỗi Firebase thành thông báo tiếng Việt
    userService.ts         Danh sách người dùng
    presenceService.ts     Trạng thái online/offline
    chatService.ts         Gửi tin, lắng nghe tin, danh sách hội thoại, số chưa đọc
    notificationService.ts Thông báo
    locationService.ts     Xin quyền và lấy vị trí (geolocation)
  context/       AuthContext, ChatDataContext (dữ liệu dùng chung, badge)
  hooks/         useMessages, useNow, useKeyboardVisible
  navigation/    RootNavigator (stack), MainTabs (4 tab)
  screens/       Login, Register, Home, Contacts, Chat, Notifications, Settings
  components/    Avatar, MessageBubble, Composer, ConversationRow…
  utils/         Xử lý thời gian, chuỗi, validate form, gom nhóm tin nhắn
  theme/         Màu sắc, chữ, khoảng cách
database.rules.json  Security rules cho Realtime Database
scripts/rules.test.mjs  Test security rules trên Firebase Emulator
__tests__/      Unit test (Jest)
```

## Cấu trúc dữ liệu (Realtime Database)

```
users/{uid}                    { uid, name, nameLower, email, createdAt }
status/{uid}                   { state: "online" | "offline", lastChanged }
messages/{chatId}/{messageId}  { senderId, type: "text" | "location", text?, location?, createdAt }
userChats/{uid}/{chatId}       { chatId, peerId, lastMessage, lastType, lastSenderId, updatedAt, unread }
notifications/{uid}/{id}       { type, messageType, fromId, chatId, preview, createdAt, read }
```

`chatId` là hai uid sắp xếp tăng dần rồi nối bằng `_`. Mỗi lần gửi, app ghi đồng thời tin nhắn, hộp thư của hai người, số chưa đọc và thông báo bằng **một** lệnh `update` nhiều đường dẫn, nên các bản ghi luôn khớp nhau.

## Cài đặt Firebase

1. Vào [Firebase Console](https://console.firebase.google.com), tạo project mới.
2. **Authentication → Sign-in method**: bật **Email/Password**.
3. **Realtime Database → Create database**: chọn vùng `asia-southeast1` (Singapore), chế độ *locked mode*.
4. **Realtime Database → Rules**: dán nội dung file [`database.rules.json`](database.rules.json) rồi bấm **Publish**.
5. **Project settings → General → Your apps**: thêm một **Web app**, sao chép `firebaseConfig`.
6. Mở [`src/services/firebaseConfig.ts`](src/services/firebaseConfig.ts):
   - dán cấu hình vào `firebaseConfig`, nhớ có cả `databaseURL`;
   - đặt `emulatorConfig.enabled = false`.

## Chạy ứng dụng

Yêu cầu: Node.js ≥ 22.11, JDK 17 trở lên, Android SDK, máy ảo hoặc điện thoại Android.

```bash
npm install
npm start          # Metro bundler
npm run android    # build và cài lên máy ảo/điện thoại
```

Để test tin vị trí trên máy ảo, đặt toạ độ bằng *Extended controls → Location*, hoặc chạy `adb emu geo fix 105.8542 21.0285`.

### Chạy với Firebase Emulator (không cần project thật)

```bash
npm run emulators   # Auth :9099, Database :9000, giao diện :4500
```

Đặt `emulatorConfig.enabled = true` trong `firebaseConfig.ts`. Máy ảo Android truy cập máy tính qua địa chỉ `10.0.2.2`.

## Kiểm tra

| Lệnh | Nội dung |
| --- | --- |
| `npm run typecheck` | Kiểm tra kiểu TypeScript |
| `npm run lint` | ESLint |
| `npm test` | 26 unit test: định dạng thời gian, tìm kiếm không dấu, validate form, gom nhóm tin, payload gửi tin, sắp xếp hội thoại |
| `npm run test:rules` | 10 test security rules. Cần `npm run emulators` đang chạy |
