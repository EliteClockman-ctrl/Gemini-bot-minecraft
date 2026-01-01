# 🤖 Minecraft AI Bot - Gemini Powered

Bot Minecraft tự động hoàn toàn, được điều khiển bởi AI Gemini. Bot có thể tự động chơi, đào khoáng, PVP, craft, sinh tồn như một pro player!

## ✨ Tính Năng

### 🧠 AI Tự Động
- **100% tự động** - Không cần lệnh
- Gemini AI ra quyết định thông minh
- Phân tích tình huống real-time
- Học và thích nghi với môi trường

### ⚔️ Chiến Đấu
- Auto PVP với người chơi
- Tấn công mob tự động
- Phản công khi bị tấn công
- Chạy trốn khi máu thấp
- Tự động mặc giáp

### ⛏️ Sinh Tồn
- Đào khoáng (wood, stone, iron, diamond, coal)
- Craft công cụ và giáp tự động
- Ăn uống tự động
- Câu cá
- Làm nông
- Xây nhà trú ẩn
- Nhặt item

### 📊 Thống Kê
- Kills/Deaths
- Blocks mined
- Items crafted
- Fish caught
- Playtime

## 📦 Cài Đặt

### Yêu Cầu
- **Node.js** v14+ ([Tải tại đây](https://nodejs.org/))
- **Minecraft Server** (Aternos, local, hoặc bất kỳ server nào)
- **Gemini API Key** ([Tạo miễn phí](https://aistudio.google.com/app/apikey))

### Bước 1: Clone/Download
```bash
git clone <repo-url>
cd gemini-mc-bot
```

### Bước 2: Cài Dependencies
```bash
npm install
```

Hoặc cài thủ công:
```bash
npm install mineflayer mineflayer-pathfinder mineflayer-pvp mineflayer-collectblock @google/generative-ai vec3
```

### Bước 3: Lấy Gemini API Key
1. Vào [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Đăng nhập Google
3. Bấm **"Create API key"**
4. Copy API key

### Bước 4: Cấu Hình

**Cách 1: Dùng biến môi trường (Khuyến nghị)**
```bash
# Windows
set GEMINI_API_KEY=your_api_key_here

# Linux/Mac
export GEMINI_API_KEY=your_api_key_here
```

**Cách 2: Sửa trực tiếp bot.js**
```javascript
const CONFIG = {
  host: 'your-server.com',
  port: 25565,
  username: 'GeminiBot',
  password: '', // Nếu server có auth
  version: '1.21',
  auth: 'offline', // Hoặc 'microsoft'
  geminiApiKey: 'your_api_key_here' // Thay ở đây
};
```

### Bước 5: Chạy Bot
```bash
node bot.js
```

## 🎮 Sử Dụng

### Kết Nối Server

#### Server Aternos
```javascript
const CONFIG = {
  host: 'YourServer.aternos.me',
  port: 12345, // Check port trên Aternos
  username: 'GeminiBot',
  auth: 'offline',
  version: '1.21'
};
```

**Lưu ý:** 
- Server Aternos phải **ONLINE** (không sleeping)
- Port có thể thay đổi mỗi lần restart
- Kiểm tra port mới tại dashboard

#### Server Local
```javascript
const CONFIG = {
  host: 'localhost',
  port: 25565,
  username: 'GeminiBot',
  auth: 'offline',
  version: '1.21'
};
```

#### Server Premium
```javascript
const CONFIG = {
  host: 'premium-server.com',
  port: 25565,
  username: 'your_minecraft_username',
  password: 'your_password',
  auth: 'microsoft', // Hoặc 'mojang'
  version: '1.21'
};
```

### Bot Tự Động Làm Gì?

Bot sẽ phân tích tình huống mỗi 10 giây và chọn hành động tốt nhất:

1. **Giai đoạn đầu:**
   - Đào gỗ
   - Craft công cụ
   - Đào đá
   - Nâng cấp pickaxe

2. **Giai đoạn giữa:**
   - Tìm và đào sắt
   - Craft giáp sắt
   - Đào than cho lửa
   - Xây nhà

3. **Giai đoạn cuối:**
   - Săn kim cương
   - PVP với người chơi
   - Farm resources
   - Thống trị server! 😎

## 🛠️ Tuỳ Chỉnh

### Thay Đổi Hành Vi AI

Sửa prompt trong hàm `aiDecision()`:

```javascript
const prompt = `Bạn là AI chơi Minecraft [STYLE CỦA BẠN].

TRẠNG THÁI: ...

Hãy chọn hành động phù hợp với phong cách [PEACEFUL/AGGRESSIVE/BUILDER/...]`;
```

### Thêm Hành Động Mới

1. Thêm vào `validActions` array
2. Thêm case trong `executeAction()`
3. Viết function thực hiện hành động

```javascript
case 'YOUR_ACTION':
  await yourCustomFunction();
  break;
```

### Thay Đổi Tần Suất AI

```javascript
// Thay đổi 10000 (10 giây) thành giá trị khác
if (!aiThinking && bot.entity && Date.now() - lastDecision > 10000) {
  lastDecision = Date.now();
  aiDecision();
}
```

## 🐛 Xử Lý Lỗi

### `MODULE_NOT_FOUND`
```bash
npm install
```

### `ECONNRESET` / Không kết nối được
- ✅ Kiểm tra server có đang bật
- ✅ Kiểm tra IP/Port đúng
- ✅ Thử ping server: `ping your-server.com`
- ✅ Kiểm tra firewall

### `API key not found` / `404 Not Found`
- ✅ Tạo API key mới tại [AI Studio](https://aistudio.google.com/app/apikey)
- ✅ Xóa key cũ nếu bị lộ
- ✅ Set biến môi trường đúng
- ✅ Restart terminal sau khi set

### Bot bị kick khỏi server
- ✅ Server yêu cầu premium: đổi `auth: 'microsoft'`
- ✅ Username đã online: đổi tên bot
- ✅ Whitelist: xin admin add hoặc `/whitelist add BotName`
- ✅ Anti-bot: Liên hệ admin server

### Bot không làm gì
- ✅ Kiểm tra console có lỗi
- ✅ Kiểm tra API key hợp lệ
- ✅ Bot cần 10 giây để bắt đầu AI
- ✅ Xem logs để debug

## 📝 Logs & Debug

Bot sẽ log các thông tin:
```
🎮 Spawned! Starting AI...
🤖 AI: MINE_WOOD | HP:20 Food:20
⛏️ Mining log...
✅ Mined log! Total: 1
📊 HP:20/20 Food:20/20 Kills:0 Deaths:0 Mined:1
```

## 🔒 Bảo Mật

**⚠️ QUAN TRỌNG:**
- **KHÔNG BAO GIỜ** commit API key lên GitHub
- **KHÔNG** share API key công khai
- Dùng `.env` file hoặc biến môi trường
- Thêm `.env` vào `.gitignore`

**.gitignore:**
```
node_modules/
.env
config.json
*.log
```

**Dùng .env file:**
```bash
npm install dotenv
```

Tạo file `.env`:
```
GEMINI_API_KEY=your_key_here
```

Thêm vào bot.js:
```javascript
require('dotenv').config();
```

## 🚀 Nâng Cao

### Chạy Bot 24/7

**Linux với screen:**
```bash
screen -S mcbot
node bot.js
# Ctrl+A+D để detach
```

**Windows:**
```bash
# Tạo file start.bat
@echo off
:loop
node bot.js
timeout /t 5
goto loop
```

### Multiple Bots

Tạo nhiều file config:
```javascript
// bot1.js
const CONFIG = { username: 'Bot1', ... };

// bot2.js  
const CONFIG = { username: 'Bot2', ... };
```

Chạy:
```bash
node bot1.js
node bot2.js
```

## 📊 Hiệu Suất

- **RAM:** ~100-200MB mỗi bot
- **CPU:** ~5-10% (phụ thuộc AI calls)
- **Network:** ~10-50KB/s

## 🤝 Đóng Góp

Contributions welcome! Mở issue hoặc pull request.

## 📄 License

MIT License - Tự do sử dụng và chỉnh sửa

## 💬 Hỗ Trợ

- **Issues:** Mở issue trên GitHub
- **Discord:** [Link server]
- **Email:** your@email.com

## ⭐ Credits

- **Mineflayer** - Bot framework
- **Google Gemini** - AI brain
- **PrismarineJS** - Minecraft protocol

---

## 🎯 Roadmap

- [ ] Web dashboard để control bot
- [ ] Advanced building system
- [ ] Team coordination (nhiều bot)
- [ ] Machine learning từ gameplay
- [ ] Voice commands
- [ ] Discord integration
- [ ] Auto trading với villagers
- [ ] Redstone automation
- [ ] Base protection system

---

**Made with ❤️ and ☕**

*Bot này chỉ cho mục đích giáo dục. Hãy tuân thủ rules của server!*