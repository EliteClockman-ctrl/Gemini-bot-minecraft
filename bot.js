// MINECRAFT FULL AUTO AI BOT - GEMINI POWERED
// Cài đặt: npm install mineflayer mineflayer-pathfinder mineflayer-pvp mineflayer-collectblock @google/generative-ai vec3

const mineflayer = require('mineflayer');
const { pathfinder, Movements, goals } = require('mineflayer-pathfinder');
const pvp = require('mineflayer-pvp').plugin;
const collectBlock = require('mineflayer-collectblock').plugin;
const { GoogleGenerativeAI } = require('@google/generative-ai');
const Vec3 = require('vec3');

// ==================== CẤU HÌNH ====================
const CONFIG = {
  host: 'YOUR_IP_SERVER',
  port: 'YOUR_PORT',
  username: 'GeminiBot',
  password: 'YOUR_PASSWORD',
  version: 'YOUR_VERSION',
  auth: 'offline', // Thêm này cho server offline
  geminiApiKey: process.env.GEMINI_API_KEY || 'YOUR_GEMINI_API_KEY'
};

// ==================== KHỞI TẠO AI ====================
const genAI = new GoogleGenerativeAI(CONFIG.geminiApiKey);
const model = genAI.getGenerativeModel({ 
  model: 'gemini-flash-latest', // Model mới nhất
  generationConfig: {
    temperature: 0.9,
    maxOutputTokens: 1024,
  }
});

// ==================== TẠO BOT ====================
function createBot() {
  const bot = mineflayer.createBot(CONFIG);
  bot.loadPlugin(pathfinder);
  bot.loadPlugin(pvp);
  bot.loadPlugin(collectBlock);
  return bot;
}

const bot = createBot();

// ==================== BIẾN TOÀN CỤC ====================
let aiThinking = false;
let currentGoal = 'explore';
let lastDecision = Date.now();
let mcData = null;

let gameState = {
  health: 20,
  food: 20,
  position: null,
  nearbyPlayers: [],
  nearbyMobs: [],
  inventory: {},
  time: 'day',
  stats: {
    kills: 0,
    deaths: 0,
    blocksMined: 0,
    itemsCrafted: 0,
    fishCaught: 0
  }
};

// ==================== AI TỰ ĐỘNG RA QUYẾT ĐỊNH ====================
async function aiDecision() {
  if (aiThinking || !bot.entity) return;
  aiThinking = true;

  try {
    // Kiểm tra API key
    if (!CONFIG.geminiApiKey || CONFIG.geminiApiKey === 'YOUR_NEW_API_KEY_HERE') {
      console.error('❌ GEMINI API KEY CHƯA CÀI ĐẶT!');
      console.log('📝 Lấy API key tại: https://aistudio.google.com/app/apikey');
      console.log('🔧 Cài đặt: set GEMINI_API_KEY=your_key');
      aiThinking = false;
      // Chơi không dùng AI
      await executeAction('EXPLORE');
      return;
    }
    
    updateGameState();
    
    const prompt = `Bạn là AI chơi Minecraft PRO. Phân tích và chọn 1 hành động:

TRẠNG THÁI:
- HP: ${gameState.health}/20 | Food: ${gameState.food}/20
- Vị trí: ${JSON.stringify(gameState.position)}
- Người chơi gần: ${gameState.nearbyPlayers.length}
- Quái: ${gameState.nearbyMobs.map(m => m.name).join(', ') || 'không'}
- Túi đồ: ${getInventorySummary()}
- Thời gian: ${gameState.time}
- Stats: Kills:${gameState.stats.kills} Deaths:${gameState.stats.deaths} Mined:${gameState.stats.blocksMined}

HÀNH ĐỘNG:
1. MINE_WOOD - Đào gỗ
2. MINE_STONE - Đào đá
3. MINE_IRON - Đào sắt
4. MINE_DIAMOND - Đào kim cương
5. MINE_COAL - Đào than
6. CRAFT_TOOLS - Craft công cụ
7. CRAFT_ARMOR - Craft giáp
8. ATTACK_MOB - Đánh quái
9. ATTACK_PLAYER - PVP
10. FLEE - Chạy
11. EAT - Ăn
12. FISH - Câu cá
13. FARM - Làm nông
14. BUILD_SHELTER - Xây nhà
15. COLLECT_ITEMS - Nhặt đồ
16. EXPLORE - Khám phá

LUẬT:
- HP<10: FLEE hoặc EAT
- Food<10: EAT hoặc FISH
- Ban đêm: BUILD_SHELTER
- Không có tool: MINE_WOOD → CRAFT_TOOLS
- Có tool: MINE_STONE → MINE_IRON → MINE_DIAMOND

TRẢ LỜI CHỈ 1 TỪ (VD: MINE_DIAMOND):`;

    const result = await model.generateContent(prompt);
    const response = result.response.text().trim().toUpperCase();
    
    // Parse AI response
    let action = 'EXPLORE';
    const validActions = ['MINE_WOOD', 'MINE_STONE', 'MINE_IRON', 'MINE_DIAMOND', 'MINE_COAL',
                          'CRAFT_TOOLS', 'CRAFT_ARMOR', 'ATTACK_MOB', 'ATTACK_PLAYER', 
                          'FLEE', 'EAT', 'FISH', 'FARM', 'BUILD_SHELTER', 'COLLECT_ITEMS', 'EXPLORE'];
    
    for (const validAction of validActions) {
      if (response.includes(validAction)) {
        action = validAction;
        break;
      }
    }
    
    console.log(`🤖 AI: ${action} | HP:${bot.health} Food:${bot.food}`);
    await executeAction(action);
    
  } catch (error) {
    console.error('❌ AI Error:', error.message);
    if (error.message.includes('API key')) {
      console.log('');
      console.log('🔑 HƯỚNG DẪN LẤY API KEY:');
      console.log('1. Vào: https://aistudio.google.com/app/apikey');
      console.log('2. Bấm "Create API key"');
      console.log('3. Copy key');
      console.log('4. Chạy: set GEMINI_API_KEY=your_key_here');
      console.log('5. Chạy lại bot: node bot.js');
      console.log('');
    }
    // Fallback: chơi không AI
    await executeAction('EXPLORE');
  }
  
  aiThinking = false;
}

// ==================== THỰC HIỆN HÀNH ĐỘNG ====================
async function executeAction(action) {
  currentGoal = action;
  
  try {
    switch(action) {
      case 'MINE_WOOD':
        await mineBlock('log', 5);
        break;
      case 'MINE_STONE':
        await mineBlock('stone', 10);
        break;
      case 'MINE_IRON':
        await mineBlock('iron_ore', 5);
        break;
      case 'MINE_DIAMOND':
        await mineBlock('diamond_ore', 3);
        break;
      case 'MINE_COAL':
        await mineBlock('coal_ore', 10);
        break;
      case 'CRAFT_TOOLS':
        await craftTools();
        break;
      case 'CRAFT_ARMOR':
        await craftArmor();
        break;
      case 'ATTACK_MOB':
        await attackNearestMob();
        break;
      case 'ATTACK_PLAYER':
        await attackNearestPlayer();
        break;
      case 'FLEE':
        await flee();
        break;
      case 'EAT':
        await eatFood();
        break;
      case 'FISH':
        await startFishing();
        break;
      case 'FARM':
        await farmCrops();
        break;
      case 'BUILD_SHELTER':
        await buildShelter();
        break;
      case 'COLLECT_ITEMS':
        await collectNearbyItems();
        break;
      case 'EXPLORE':
        await explore();
        break;
      default:
        await explore();
    }
  } catch (err) {
    console.error(`⚠️ ${action} error:`, err.message);
  }
}

// ==================== CẬP NHẬT TRẠNG THÁI ====================
function updateGameState() {
  if (!bot.entity) return;
  
  gameState.health = bot.health;
  gameState.food = bot.food;
  gameState.position = bot.entity.position;
  
  // Người chơi gần
  gameState.nearbyPlayers = Object.values(bot.players)
    .filter(p => p.entity && p.username !== bot.username)
    .map(p => ({
      name: p.username,
      distance: bot.entity.position.distanceTo(p.entity.position)
    }))
    .filter(p => p.distance < 32);
  
  // Mob gần
  gameState.nearbyMobs = Object.values(bot.entities)
    .filter(e => e.type === 'mob' && e.position)
    .map(e => ({
      name: e.name || e.displayName || 'unknown',
      distance: bot.entity.position.distanceTo(e.position)
    }))
    .filter(m => m.distance < 16);
  
  // Thời gian
  gameState.time = bot.time.timeOfDay < 6000 || bot.time.timeOfDay > 18000 ? 'night' : 'day';
  
  // Inventory
  gameState.inventory = {};
  bot.inventory.items().forEach(item => {
    gameState.inventory[item.name] = (gameState.inventory[item.name] || 0) + item.count;
  });
}

// ==================== ĐÀO KHOÁNG ====================
async function mineBlock(blockName, count) {
  console.log(`⛏️ Mining ${blockName}...`);
  
  for (let i = 0; i < count; i++) {
    const block = bot.findBlock({
      matching: (b) => b.name.includes(blockName),
      maxDistance: 64
    });
    
    if (block) {
      try {
        await bot.pathfinder.goto(new goals.GoalBlock(block.position.x, block.position.y, block.position.z));
        await bot.dig(block);
        gameState.stats.blocksMined++;
        console.log(`✅ Mined ${blockName}! Total: ${gameState.stats.blocksMined}`);
        await sleep(500);
      } catch (err) {
        break;
      }
    } else {
      console.log(`🔍 No ${blockName}, exploring...`);
      await explore();
      break;
    }
  }
}

// ==================== CHẾ TẠO ====================
async function craftTools() {
  console.log('🔨 Crafting tools...');
  const tools = ['wooden_pickaxe', 'stone_pickaxe', 'wooden_sword'];
  
  for (const tool of tools) {
    await craftItem(tool);
    await sleep(1000);
  }
}

async function craftArmor() {
  console.log('🛡️ Crafting armor...');
  const armor = ['iron_helmet', 'iron_chestplate', 'iron_leggings', 'iron_boots'];
  
  for (const piece of armor) {
    await craftItem(piece);
  }
}

async function craftItem(itemName) {
  if (!mcData) return;
  
  const item = mcData.itemsByName[itemName];
  if (!item) return;
  
  const recipe = bot.recipesFor(item.id, null, 1, null)[0];
  
  if (recipe) {
    try {
      await bot.craft(recipe, 1, null);
      gameState.stats.itemsCrafted++;
      console.log(`✅ Crafted ${itemName}!`);
    } catch (err) {
      console.log(`⚠️ Can't craft ${itemName}`);
    }
  }
}

// ==================== CHIẾN ĐẤU ====================
async function attackNearestMob() {
  const mob = bot.nearestEntity(e => 
    e.type === 'mob' && e.position &&
    bot.entity.position.distanceTo(e.position) < 16
  );
  
  if (mob) {
    console.log(`⚔️ Attacking ${mob.name || 'mob'}!`);
    bot.pvp.attack(mob);
    await sleep(5000);
    bot.pvp.stop();
  }
}

async function attackNearestPlayer() {
  const player = bot.nearestEntity(e => 
    e.type === 'player' && e.username !== bot.username &&
    bot.entity.position.distanceTo(e.position) < 16
  );
  
  if (player) {
    console.log(`⚔️ PVP ${player.username}!`);
    bot.pvp.attack(player);
    await sleep(8000);
    bot.pvp.stop();
  }
}

async function flee() {
  console.log('🏃 Fleeing!');
  const pos = bot.entity.position;
  const goal = new goals.GoalBlock(pos.x + 20, pos.y, pos.z + 20);
  bot.pathfinder.setGoal(goal);
  await sleep(3000);
}

// ==================== ĂN UỐNG ====================
async function eatFood() {
  const food = bot.inventory.items().find(item => 
    item.name.includes('beef') || item.name.includes('porkchop') ||
    item.name.includes('bread') || item.name.includes('apple') ||
    item.name.includes('carrot') || item.name.includes('potato') ||
    item.name.includes('chicken') || item.name.includes('fish')
  );
  
  if (food && bot.food < 18) {
    console.log('🍖 Eating...');
    try {
      await bot.equip(food, 'hand');
      bot.activateItem();
      await sleep(2000);
    } catch (err) {}
  }
}

// ==================== CÂU CÁ ====================
async function startFishing() {
  const rod = bot.inventory.items().find(item => item.name === 'fishing_rod');
  
  if (!rod) {
    console.log('⚠️ No fishing rod!');
    return;
  }
  
  console.log('🎣 Fishing...');
  try {
    await bot.equip(rod, 'hand');
    await bot.fish();
    gameState.stats.fishCaught++;
    console.log(`✅ Caught fish! Total: ${gameState.stats.fishCaught}`);
  } catch (err) {
    console.log('⚠️ Fishing failed');
  }
}

// ==================== NÔNG NGHIỆP ====================
async function farmCrops() {
  console.log('🌾 Farming...');
  const crops = bot.findBlock({
    matching: (block) => 
      (block.name.includes('wheat') || block.name.includes('carrots') || 
       block.name.includes('potatoes')) && block.metadata === 7,
    maxDistance: 32
  });
  
  if (crops) {
    try {
      await bot.dig(crops);
      console.log('✅ Harvested!');
    } catch (err) {}
  }
}

// ==================== XÂY DỰNG ====================
async function buildShelter() {
  console.log('🏠 Building shelter...');
  const pos = bot.entity.position;
  
  const blocks = ['dirt', 'cobblestone', 'wood', 'planks'];
  const buildMaterial = bot.inventory.items().find(item => 
    blocks.some(b => item.name.includes(b))
  );
  
  if (buildMaterial) {
    try {
      await bot.equip(buildMaterial, 'hand');
      // Xây 4 cột
      for (let i = 0; i < 4; i++) {
        const x = pos.x + (i % 2 === 0 ? 3 : -3);
        const z = pos.z + (i < 2 ? 3 : -3);
        const placePos = new Vec3(Math.floor(x), Math.floor(pos.y), Math.floor(z));
        const refBlock = bot.blockAt(placePos);
        if (refBlock) {
          await bot.placeBlock(refBlock, new Vec3(0, 1, 0));
        }
      }
      console.log('✅ Built!');
    } catch (err) {}
  }
}

// ==================== NHẶT VẬT PHẨM ====================
async function collectNearbyItems() {
  console.log('📦 Collecting items...');
  const item = bot.nearestEntity(e => 
    e.name === 'item' && bot.entity.position.distanceTo(e.position) < 16
  );
  
  if (item) {
    bot.pathfinder.setGoal(new goals.GoalFollow(item, 1), true);
    await sleep(3000);
  }
}

// ==================== KHÁM PHÁ ====================
async function explore() {
  console.log('🗺️ Exploring...');
  const pos = bot.entity.position;
  const x = pos.x + (Math.random() - 0.5) * 50;
  const z = pos.z + (Math.random() - 0.5) * 50;
  
  bot.pathfinder.setGoal(new goals.GoalXZ(x, z));
  await sleep(5000);
  bot.pathfinder.setGoal(null);
}

// ==================== TỰ ĐỘNG MẶC GIÁP ====================
async function autoEquipArmor() {
  const armorSlots = ['head', 'torso', 'legs', 'feet'];
  const armorPriority = ['diamond', 'iron', 'chainmail', 'gold', 'leather'];
  
  for (const slot of armorSlots) {
    for (const material of armorPriority) {
      const armor = bot.inventory.items().find(item => 
        item.name.includes(material) && 
        (item.name.includes('helmet') || item.name.includes('chestplate') || 
         item.name.includes('leggings') || item.name.includes('boots'))
      );
      
      if (armor) {
        try {
          await bot.equip(armor, slot);
          break;
        } catch (err) {}
      }
    }
  }
}

setInterval(() => {
  autoEquipArmor().catch(() => {});
}, 5000);

// ==================== VÒNG LẶP AI ====================
setInterval(() => {
  if (!aiThinking && bot.entity && Date.now() - lastDecision > 10000) {
    lastDecision = Date.now();
    aiDecision();
  }
}, 5000);

// ==================== TỰ ĐỘNG CHIẾN ĐẤU ====================
bot.on('physicsTick', () => {
  if (!bot.entity) return;
  
  const enemy = bot.nearestEntity(e => 
    (e.type === 'mob' || (e.type === 'player' && e.username !== bot.username)) &&
    e.position && bot.entity.position.distanceTo(e.position) < 4
  );
  
  if (enemy && !aiThinking) {
    bot.pvp.attack(enemy);
  }
});

// ==================== EVENTS ====================
bot.on('spawn', () => {
  console.log('🎮 Spawned! Starting AI...');
  mcData = require('minecraft-data')(bot.version);
  const movements = new Movements(bot, mcData);
  movements.canDig = true;
  movements.allow1by1towers = true;
  bot.pathfinder.setMovements(movements);
  
  // Bắt đầu AI sau 5 giây
  setTimeout(() => {
    aiDecision();
  }, 5000);
});

bot.on('death', () => {
  gameState.stats.deaths++;
  console.log(`💀 Died ${gameState.stats.deaths} times`);
  bot.pathfinder.setGoal(null);
  bot.pvp.stop();
});

bot.on('entityHurt', (entity) => {
  if (entity === bot.entity && bot.health < 10) {
    flee();
  }
});

bot.on('chat', (username, message) => {
  if (username === bot.username) return;
  console.log(`💬 ${username}: ${message}`);
});

bot.on('login', () => {
  console.log('✅ Logged in!');
});

bot.on('kicked', (reason) => {
  console.log('❌ Kicked from server!');
  try {
    const reasonText = JSON.stringify(reason, null, 2);
    console.log('Reason:', reasonText);
    
    // Parse kick message
    if (reason && reason.value) {
      if (reason.value.text) {
        console.log('Message:', reason.value.text.value);
      }
      if (reason.value.extra && reason.value.extra.value) {
        reason.value.extra.value.forEach(item => {
          if (item.text) console.log('-', item.text.value);
        });
      }
    }
  } catch (e) {
    console.log('Raw reason:', reason);
  }
  
  console.log('💡 Possible reasons:');
  console.log('   - Server requires premium account (not cracked)');
  console.log('   - Username already online');
  console.log('   - Server whitelist enabled');
  console.log('   - Bot/VPN blocked');
});

bot.on('end', () => {
  console.log('❌ Disconnected');
});

bot.on('error', (err) => {
  console.error('❌ Error:', err.message);
  if (err.message.includes('ECONNRESET') || err.message.includes('ETIMEDOUT')) {
    console.log('🔄 Server connection lost. Retrying in 10 seconds...');
    setTimeout(() => {
      console.log('🔄 Reconnecting...');
      createBot();
    }, 10000);
  }
});

// ==================== HELPER ====================
function getInventorySummary() {
  const items = bot.inventory.items();
  if (items.length === 0) return 'Empty';
  
  const summary = {};
  items.forEach(item => {
    summary[item.name] = (summary[item.name] || 0) + item.count;
  });
  
  return Object.entries(summary)
    .slice(0, 10)
    .map(([name, count]) => `${name}:${count}`)
    .join(', ');
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ==================== STATS ====================
setInterval(() => {
  if (!bot.entity) return;
  console.log(`📊 HP:${bot.health}/20 Food:${bot.food}/20 Kills:${gameState.stats.kills} Deaths:${gameState.stats.deaths} Mined:${gameState.stats.blocksMined}`);
}, 60000);

console.log('🤖 MINECRAFT AI BOT - GEMINI POWERED');
console.log('🧠 Fully Automated - No Commands Needed!');
console.log('⚡ Bot will auto play, mine, pvp, craft, survive!');
console.log('📝 Remember to set your Gemini API key!');
console.log('🎮 Connecting to server...');

module.exports = bot;