const TILE_SIZE = 32;
const MAP_COLS = 72;
const MAP_ROWS = 46;
const MAX_TIME = 100;
const BASE_MOVE_SPEED = 162;
const HORSE_MOVE_SPEED = 248;
const PLAYER_RADIUS = 11;
const ENEMY_RADIUS = 10;
const INTERACTION_RANGE = 42;
const SEED_ANIMATION_DURATION = 0.42;
const TREE_SHAKE_DURATION = 0.16;
const TREE_FALL_DURATION = 0.35;
const ROCK_SHAKE_DURATION = 0.18;
const SEASON_LENGTH = 5;
const SLEEP_DURATION = 10;
const MAX_MINE_LEVELS = 24;

const cropConfig = {
  trigo: { label: "Trigo", turns: 2, sell: 10, color: "#f0d672" },
  maiz: { label: "Maiz", turns: 3, sell: 14, color: "#d8c24f" },
  tomate: { label: "Tomate", turns: 3, sell: 18, color: "#df5b53" },
  calabaza: { label: "Calabaza", turns: 4, sell: 25, color: "#d98535" }
};

const seasonConfig = [
  { key: "primavera", label: "Primavera", grass: "#7fbe62", farm: "#8ecb68", treeA: "#2d8f73", treeB: "#1d7058" },
  { key: "verano", label: "Verano", grass: "#73b954", farm: "#84c259", treeA: "#2d9553", treeB: "#1f6b3c" },
  { key: "otonio", label: "Otono", grass: "#96a856", farm: "#ac9e57", treeA: "#d08b3f", treeB: "#9b5c2f" },
  { key: "invierno", label: "Invierno", grass: "#b9c9d4", farm: "#cad6df", treeA: "#8bb0bc", treeB: "#688b97" }
];

const toolConfig = {
  till: { label: "Azada", max: 40, power: 1 },
  harvest: { label: "Hoz", max: 45, power: 1 },
  water: { label: "Regadera", max: 36, power: 1 },
  axe: { label: "Hacha", max: 32, power: 1 },
  sword: { label: "Espada", max: 45, power: 1 },
  pickaxe: { label: "Pico", max: 35, power: 1 }
};

const storeConfig = {
  "seed-trigo": { label: "3 semillas de trigo", cost: 14, buy() { state.inventory.seeds.trigo += 3; } },
  "seed-maiz": { label: "3 semillas de maiz", cost: 18, buy() { state.inventory.seeds.maiz += 3; } },
  "seed-tomate": { label: "3 semillas de tomate", cost: 24, buy() { state.inventory.seeds.tomate += 3; } },
  "seed-calabaza": { label: "3 semillas de calabaza", cost: 32, buy() { state.inventory.seeds.calabaza += 3; } },
  chicken: { label: "Gallina", cost: 48, buy() { addAnimal("chicken"); } },
  duck: { label: "Pato", cost: 54, buy() { addAnimal("duck"); } },
  sheep: { label: "Oveja", cost: 76, buy() { addAnimal("sheep"); } },
  goat: { label: "Cabra", cost: 82, buy() { addAnimal("goat"); } },
  pig: { label: "Cerdo", cost: 88, buy() { addAnimal("pig"); } },
  cow: { label: "Vaca", cost: 92, buy() { addAnimal("cow"); } }
};

const upgradeConfig = {
  axe: { label: "hacha", baseCost: 72, onUpgrade() { improveTool("axe", 16, 1); } },
  pickaxe: { label: "pico", baseCost: 82, onUpgrade() { improveTool("pickaxe", 16, 1); } },
  sword: { label: "espada", baseCost: 96, onUpgrade() { improveTool("sword", 18, 2); } },
  watering: { label: "regadera", baseCost: 66, onUpgrade() { improveTool("water", 18, 1); } }
};

const craftRecipes = {
  iron_sword: {
    label: "Espada de hierro",
    needs: { wood: 4, stone: 2, iron: 3 },
    craft() {
      state.tools.sword.weaponName = "Espada de hierro";
      state.tools.sword.level = Math.max(state.tools.sword.level, 3);
      state.tools.sword.power = Math.max(state.tools.sword.power, 5);
      state.tools.sword.maxDurability = Math.max(state.tools.sword.maxDurability, 86);
      state.tools.sword.durability = state.tools.sword.maxDurability;
      addLog("Forjaste una espada de hierro en la herreria.");
    }
  },
  crystal_sword: {
    label: "Espada de cristal",
    needs: { wood: 3, iron: 4, crystal: 2 },
    craft() {
      state.tools.sword.weaponName = "Espada de cristal";
      state.tools.sword.level = Math.max(state.tools.sword.level, 5);
      state.tools.sword.power = Math.max(state.tools.sword.power, 8);
      state.tools.sword.maxDurability = Math.max(state.tools.sword.maxDurability, 120);
      state.tools.sword.durability = state.tools.sword.maxDurability;
      addLog("Creaste una espada de cristal mucho mas fuerte.");
    }
  },
  repair_all: {
    label: "Reparar herramientas",
    needs: { wood: 2, stone: 2, iron: 1 },
    craft() {
      Object.values(state.tools).forEach((tool) => {
        tool.durability = tool.maxDurability;
      });
      addLog("Reparaste todas las herramientas en la herreria.");
    }
  }
};

const fieldOrigin = { x: 24, y: 12 };
const fieldCols = 10;
const fieldRows = 7;
const penArea = { x: 38, y: 11, w: 8, h: 7 };
const cabinArea = { x: 50, y: 29, w: 5, h: 4 };
const cabinDoor = { x: 52, y: 32, w: 1, h: 1 };
const marketArea = { x: 50, y: 18, w: 5, h: 4 };
const marketDoor = { x: 52, y: 21, w: 1, h: 1 };
const smithArea = { x: 58, y: 18, w: 5, h: 4 };
const smithDoor = { x: 60, y: 21, w: 1, h: 1 };
const barnArea = { x: 39, y: 7, w: 7, h: 5 };
const barnDoor = { x: 42, y: 11, w: 1, h: 1 };
const farmHubArea = { x: 20, y: 6, w: 44, h: 29 };
const mineFacadeArea = { x: 4, y: 5, w: 15, h: 11 };
const mineDoor = { x: 11, y: 15, w: 2, h: 1 };
const horseHome = { x: 56, y: 27 };

const interiorConfig = {
  cabin: {
    label: "Cabaña",
    cols: 18,
    rows: 12,
    spawn: { x: 9.2, y: 9.2 },
    exitArea: { x: 8, y: 10, w: 2, h: 1 },
    bedArea: { x: 12, y: 2, w: 3, h: 2 },
    floor: "#9a6b44",
    wall: "#5f3922"
  },
  market: {
    label: "Tienda",
    cols: 22,
    rows: 13,
    spawn: { x: 11, y: 9.3 },
    exitArea: { x: 10, y: 11, w: 2, h: 1 },
    floor: "#8c6239",
    wall: "#4d2d17"
  },
  smith: {
    label: "Herreria",
    cols: 22,
    rows: 13,
    spawn: { x: 11, y: 9.3 },
    exitArea: { x: 10, y: 11, w: 2, h: 1 },
    forgeArea: { x: 13, y: 5, w: 4, h: 3 },
    tableArea: { x: 5, y: 6, w: 3, h: 2 },
    floor: "#726155",
    wall: "#37261d"
  },
  barn: {
    label: "Granero",
    cols: 20,
    rows: 13,
    spawn: { x: 10, y: 9.2 },
    exitArea: { x: 9, y: 11, w: 2, h: 1 },
    floor: "#b78c55",
    wall: "#7b4628"
  },
  mine: {
    label: "Mina",
    cols: 28,
    rows: 18,
    spawn: { x: 14, y: 13.2 },
    exitArea: { x: 13, y: 16, w: 2, h: 1 },
    stairsArea: { x: 23, y: 13, w: 2, h: 2 },
    floor: "#4f5561",
    wall: "#24282e"
  }
};

const state = {
  scene: "farm",
  day: 1,
  time: 12,
  phase: "day",
  activeSlot: "1",
  activeTool: "till",
  activeSeed: "trigo",
  coins: 40,
  wood: 0,
  stone: 0,
  iron: 0,
  crystal: 0,
  playerHealth: 100,
  mineLevel: 1,
  horseMounted: false,
  sleeping: false,
  sleepTimer: 0,
  inventory: {
    seeds: { trigo: 4, maiz: 2, tomate: 1, calabaza: 1 },
    crops: { trigo: 0, maiz: 0, tomate: 0, calabaza: 0 },
    goods: { eggs: 0, milk: 0, wool: 0, truffles: 0 }
  },
  tools: buildInitialTools(),
  animals: [],
  crops: [],
  trees: [],
  bushes: [],
  surfaceRocks: [],
  mineRocks: [],
  enemies: [],
  logs: [
    "La tienda, la herreria, la cabaña y la mina ahora funcionan como lugares reales del mapa."
  ],
  canRest: false,
  transitionCooldown: 0,
  moveTarget: null
};

const player = {
  x: 52 * TILE_SIZE,
  y: 34 * TILE_SIZE,
  facingX: 0,
  facingY: -1,
  attackCooldown: 0,
  walkCycle: 0,
  isMoving: false,
  toolSwing: 0
};

const horse = {
  x: horseHome.x * TILE_SIZE + TILE_SIZE / 2,
  y: horseHome.y * TILE_SIZE + TILE_SIZE / 2,
  walkCycle: 0
};

const input = { up: false, down: false, left: false, right: false };
const mouse = { x: 0, y: 0, inside: false };
const uiHitboxes = [];

const dom = {
  canvas: document.querySelector("#gameCanvas"),
  minimap: document.querySelector("#minimapCanvas"),
  locationLabel: document.querySelector("#locationLabel"),
  sceneStateLabel: document.querySelector("#sceneStateLabel"),
  playerHealthFill: document.querySelector("#playerHealthFill"),
  dayLabel: document.querySelector("#dayLabel"),
  phaseLabel: document.querySelector("#phaseLabel"),
  seasonLabel: document.querySelector("#seasonLabel"),
  timeFill: document.querySelector("#timeFill"),
  coinsValue: document.querySelector("#coinsValue"),
  playerHealthValue: document.querySelector("#playerHealthValue"),
  logList: document.querySelector("#logList"),
  hotbar: document.querySelector("#hotbar"),
  journalToggle: document.querySelector("#journalToggle"),
  journalModal: document.querySelector("#journalModal"),
  journalClose: document.querySelector("#journalClose")
};

const ctx = dom.canvas.getContext("2d");
const mapCtx = dom.minimap.getContext("2d");
ctx.imageSmoothingEnabled = false;
mapCtx.imageSmoothingEnabled = false;

const camera = { x: 0, y: 0 };

let lastFrame = performance.now();
let passiveClock = 0;
let enemyHitClock = 0;

function resizeCanvasToViewport() {
  const width = Math.max(320, Math.floor(window.innerWidth));
  const height = Math.max(320, Math.floor(window.innerHeight));

  if (dom.canvas.width === width && dom.canvas.height === height) {
    return;
  }

  dom.canvas.width = width;
  dom.canvas.height = height;
  ctx.imageSmoothingEnabled = false;
  updateCamera();
}

function getInteriorViewport(sceneKey = state.scene) {
  if (sceneKey === "farm") return null;

  const scene = interiorConfig[sceneKey];
  const sceneWidth = scene.cols * TILE_SIZE;
  const sceneHeight = scene.rows * TILE_SIZE;
  const isCompactScreen = dom.canvas.width <= 760 || dom.canvas.height <= 580;
  const hotbarRect = dom.hotbar?.getBoundingClientRect();
  const hotbarHeight = hotbarRect ? Math.ceil(hotbarRect.height) : 0;
  const sidePadding = isCompactScreen ? 10 : 22;
  const topPadding = isCompactScreen ? 74 : 34;
  const bottomPadding = Math.max(isCompactScreen ? 14 : 22, hotbarHeight + (isCompactScreen ? 8 : 16));
  const availableWidth = Math.max(180, dom.canvas.width - sidePadding * 2);
  const availableHeight = Math.max(180, dom.canvas.height - topPadding - bottomPadding);
  const scale = Math.min(1, availableWidth / sceneWidth, availableHeight / sceneHeight);
  const drawWidth = sceneWidth * scale;
  const drawHeight = sceneHeight * scale;

  return {
    width: sceneWidth,
    height: sceneHeight,
    scale,
    drawWidth,
    drawHeight,
    offsetX: Math.floor(sidePadding + (availableWidth - drawWidth) / 2),
    offsetY: Math.floor(topPadding + (availableHeight - drawHeight) / 2)
  };
}

function buildInitialTools() {
  return Object.fromEntries(
    Object.entries(toolConfig).map(([key, config]) => [
      key,
      {
        key,
        label: config.label,
        weaponName: config.label,
        level: 1,
        power: config.power,
        maxDurability: config.max,
        durability: config.max
      }
    ])
  );
}

function addLog(message) {
  state.logs.unshift(message);
  state.logs = state.logs.slice(0, 10);
}

function getNightStatusText() {
  if (state.sleeping) {
    return `Durmiendo ${state.sleepTimer.toFixed(1)}s`;
  }
  if (state.phase === "night") {
    return state.enemies.length > 0
      ? `${state.enemies.length} matones afuera`
      : "Noche despejada";
  }
  return "Todavia es de dia";
}

function getInventoryItems() {
  return [
    { icon: "trigo", label: `Trigo ${state.inventory.crops.trigo}` },
    { icon: "seed_trigo", label: `Sem. trigo ${state.inventory.seeds.trigo}` },
    { icon: "maiz", label: `Maiz ${state.inventory.crops.maiz}` },
    { icon: "seed_maiz", label: `Sem. maiz ${state.inventory.seeds.maiz}` },
    { icon: "tomate", label: `Tomate ${state.inventory.crops.tomate}` },
    { icon: "seed_tomate", label: `Sem. tomate ${state.inventory.seeds.tomate}` },
    { icon: "calabaza", label: `Calabaza ${state.inventory.crops.calabaza}` },
    { icon: "seed_calabaza", label: `Sem. calabaza ${state.inventory.seeds.calabaza}` },
    { icon: "wood", label: `Madera ${state.wood}` },
    { icon: "stone", label: `Piedra ${state.stone}` },
    { icon: "iron", label: `Hierro ${state.iron}` },
    { icon: "crystal", label: `Cristal ${state.crystal}` },
    { icon: "eggs", label: `Huevos ${state.inventory.goods.eggs}` },
    { icon: "milk", label: `Leche ${state.inventory.goods.milk}` },
    { icon: "wool", label: `Lana ${state.inventory.goods.wool}` },
    { icon: "truffles", label: `Trufas ${state.inventory.goods.truffles}` },
    { icon: "horse", label: `Caballo ${state.horseMounted ? "montado" : "esperando"}` },
    { icon: "axe", label: `Hacha Nv.${state.tools.axe.level}` },
    { icon: "pickaxe", label: `Pico Nv.${state.tools.pickaxe.level}` },
    { icon: "sword", label: `Espada Nv.${state.tools.sword.level}` }
  ];
}

function getToolLines() {
  return ["till", "water", "axe", "pickaxe", "sword", "harvest"].map((key) => {
    const tool = state.tools[key];
    return `${tool.weaponName || tool.label} Nv.${tool.level} ${tool.durability}/${tool.maxDurability}`;
  });
}

function openJournal() {
  dom.journalModal.classList.remove("hidden");
  dom.journalModal.setAttribute("aria-hidden", "false");
}

function closeJournal() {
  dom.journalModal.classList.add("hidden");
  dom.journalModal.setAttribute("aria-hidden", "true");
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function isInsideTileArea(area, tileX, tileY) {
  return tileX >= area.x && tileY >= area.y && tileX < area.x + area.w && tileY < area.y + area.h;
}

function getSeasonIndex() {
  return Math.floor((state.day - 1) / SEASON_LENGTH) % seasonConfig.length;
}

function getSeason() {
  return seasonConfig[getSeasonIndex()];
}

function getDayLabel() {
  if (state.phase === "night") return "Noche";
  if (state.time < 33) return "Manana";
  if (state.time < 66) return "Tarde";
  return "Atardecer";
}

function getSceneLabel() {
  if (state.scene === "farm") return "Exterior";
  if (state.scene === "mine") return `Mina ${state.mineLevel}`;
  return interiorConfig[state.scene].label;
}

function currentMoveSpeed() {
  return state.horseMounted && state.scene === "farm" ? HORSE_MOVE_SPEED : BASE_MOVE_SPEED;
}

function countAnimals(type) {
  return state.animals.filter((animal) => animal.type === type).length;
}

const animalBreedConfig = {
  chicken: ["crema", "marron", "negra"],
  duck: ["blanco", "verde"],
  sheep: ["blanca", "gris"],
  goat: ["cafe", "clara"],
  pig: ["rosado", "manchado"],
  cow: ["clasica", "marron", "manchada"]
};

function getRemainingMineRocks() {
  return state.mineRocks.filter((rock) => !rock.broken).length;
}

function isNearMineStairs() {
  if (state.scene !== "mine") return false;
  const stairs = interiorConfig.mine.stairsArea;
  const centerX = (stairs.x + stairs.w / 2) * TILE_SIZE;
  const centerY = (stairs.y + stairs.h / 2) * TILE_SIZE;
  return Math.hypot(centerX - player.x, centerY - player.y) <= 76;
}

function advanceMineLevel() {
  if (state.scene !== "mine") return;
  if (getRemainingMineRocks() > 0) {
    addLog("Para bajar de nivel tienes que minar todos los minerales de este piso.");
    return;
  }
  if (state.mineLevel >= MAX_MINE_LEVELS) {
    addLog("Ya llegaste al fondo de la mina. Este es el ultimo nivel.");
    return;
  }
  state.mineLevel += 1;
  createMineRocks(state.mineLevel);
  player.x = interiorConfig.mine.spawn.x * TILE_SIZE;
  player.y = interiorConfig.mine.spawn.y * TILE_SIZE;
  addLog(`Bajaste al nivel ${state.mineLevel} de la mina.`);
}

function isPathTile(tileX, tileY) {
  return (
    (tileX >= 46 && tileX <= 47 && tileY >= 0 && tileY < MAP_ROWS) ||
    (tileY >= 22 && tileY <= 23 && tileX >= 22 && tileX <= 63)
  );
}

function addTree(x, y, variant = "oak") {
  if (state.trees.some((tree) => tree.x === x && tree.y === y)) return;
  if (
    state.bushes.some((bush) => bush.x === x && bush.y === y) ||
    state.surfaceRocks.some((rock) => rock.x === x && rock.y === y) ||
    isInsideTileArea(cabinArea, x, y) ||
    isInsideTileArea(marketArea, x, y) ||
    isInsideTileArea(smithArea, x, y) ||
    isInsideTileArea(barnArea, x, y) ||
    isInsideTileArea(penArea, x, y) ||
    isInsideTileArea(mineFacadeArea, x, y) ||
    isInsideTileArea(farmHubArea, x, y) ||
    isPathTile(x, y)
  ) {
    return;
  }

  state.trees.push({
    x,
    y,
    variant,
    health: 2 + state.tools.axe.level,
    stump: false,
    shakeTimer: 0,
    fallTimer: 0,
    fallDir: 1
  });
}

function createTrees() {
  const fixedTrees = [
    [65, 8, "pine"], [67, 11, "pine"], [68, 7, "pine"], [63, 34, "oak"], [66, 36, "orange"], [70, 31, "pine"],
    [9, 25, "oak"], [12, 29, "orange"], [15, 32, "pine"], [18, 36, "oak"], [7, 19, "orange"], [10, 22, "pine"], [14, 18, "oak"]
  ];
  fixedTrees.forEach(([x, y, variant]) => addTree(x, y, variant));

  for (let tileY = 2; tileY < MAP_ROWS - 2; tileY += 1) {
    for (let tileX = 2; tileX < MAP_COLS - 2; tileX += 1) {
      const outsideFarmHub = !isInsideTileArea(farmHubArea, tileX, tileY);
      const forestChance = outsideFarmHub ? 0.085 : 0.012;
      if (Math.random() < forestChance) {
        const roll = Math.random();
        const variant = roll < 0.24 ? "pine" : roll < 0.42 ? "orange" : "oak";
        addTree(tileX, tileY, variant);
      }
    }
  }
}

function addBush(x, y, variant = "spring") {
  if (
    state.trees.some((tree) => tree.x === x && tree.y === y) ||
    state.bushes.some((bush) => bush.x === x && bush.y === y) ||
    state.surfaceRocks.some((rock) => rock.x === x && rock.y === y) ||
    isInsideTileArea(cabinArea, x, y) ||
    isInsideTileArea(marketArea, x, y) ||
    isInsideTileArea(smithArea, x, y) ||
    isInsideTileArea(barnArea, x, y) ||
    isInsideTileArea(penArea, x, y) ||
    isInsideTileArea(mineFacadeArea, x, y) ||
    isInsideTileArea(farmHubArea, x, y) ||
    isPathTile(x, y)
  ) {
    return;
  }

  state.bushes.push({ x, y, variant });
}

function addSurfaceRock(x, y, size = "small") {
  if (
    state.trees.some((tree) => tree.x === x && tree.y === y) ||
    state.bushes.some((bush) => bush.x === x && bush.y === y) ||
    state.surfaceRocks.some((rock) => rock.x === x && rock.y === y) ||
    isInsideTileArea(cabinArea, x, y) ||
    isInsideTileArea(marketArea, x, y) ||
    isInsideTileArea(smithArea, x, y) ||
    isInsideTileArea(barnArea, x, y) ||
    isInsideTileArea(penArea, x, y) ||
    isInsideTileArea(mineFacadeArea, x, y) ||
    isInsideTileArea(farmHubArea, x, y) ||
    isPathTile(x, y)
  ) {
    return;
  }

  state.surfaceRocks.push({
    x,
    y,
    size,
    health: size === "big" ? 4 : 2,
    broken: false,
    shakeTimer: 0
  });
}

function createBushes() {
  const fixedBushes = [
    [61, 12], [59, 35], [8, 28], [16, 22], [21, 37], [69, 25]
  ];
  fixedBushes.forEach(([x, y]) => addBush(x, y));

  for (let tileY = 2; tileY < MAP_ROWS - 2; tileY += 1) {
    for (let tileX = 2; tileX < MAP_COLS - 2; tileX += 1) {
      if (!isInsideTileArea(farmHubArea, tileX, tileY) && Math.random() < 0.02) {
        addBush(tileX, tileY, Math.random() < 0.5 ? "spring" : "wild");
      }
    }
  }
}

function createSurfaceRocks() {
  const fixedRocks = [
    [6, 34, "big"], [11, 16, "small"], [19, 26, "small"], [62, 9, "big"], [68, 29, "small"], [64, 39, "big"]
  ];
  fixedRocks.forEach(([x, y, size]) => addSurfaceRock(x, y, size));

  for (let tileY = 2; tileY < MAP_ROWS - 2; tileY += 1) {
    for (let tileX = 2; tileX < MAP_COLS - 2; tileX += 1) {
      if (!isInsideTileArea(farmHubArea, tileX, tileY) && Math.random() < 0.012) {
        addSurfaceRock(tileX, tileY, Math.random() < 0.28 ? "big" : "small");
      }
    }
  }
}

function createFieldPlots() {
  for (let row = 0; row < fieldRows; row += 1) {
    for (let col = 0; col < fieldCols; col += 1) {
      state.crops.push({
        x: fieldOrigin.x + col,
        y: fieldOrigin.y + row,
        tilled: false,
        watered: false,
        crop: null,
        growth: 0,
        ready: false,
        seedAnimation: 0,
        seedAnimationType: null
      });
    }
  }
}

function getMineLevelPattern(level) {
  const layout = [];
  const cols = interiorConfig.mine.cols;
  const rows = interiorConfig.mine.rows;
  const baseCount = 14 + Math.min(level, 10);
  const crystalEvery = level >= 6 ? 4 : 6;
  const ironEvery = level >= 3 ? 2 : 3;

  for (let index = 0; index < baseCount; index += 1) {
    const x = 3 + ((index * 3 + level * 2) % (cols - 8));
    const y = 3 + ((index * 5 + level * 3) % (rows - 7));
    const type =
      level >= 10 && index % crystalEvery === 0
        ? "cristal"
        : index % ironEvery === 0
          ? "hierro"
          : "piedra";

    if (x >= 13 && x <= 15 && y >= 12 && y <= 16) continue;
    if (x >= 22 && x <= 25 && y >= 12 && y <= 15) continue;
    layout.push([x, y, type]);
  }

  return layout.filter((entry, index, self) => index === self.findIndex((other) => other[0] === entry[0] && other[1] === entry[1]));
}

function createMineRocks(level = state.mineLevel) {
  state.mineRocks = [];
  const pattern = getMineLevelPattern(level);
  pattern.forEach(([x, y, type]) => {
    state.mineRocks.push({
      x,
      y,
      type,
      health: (type === "cristal" ? 4 : type === "hierro" ? 3 : 2) + Math.floor((level - 1) / 6),
      shakeTimer: 0,
      broken: false
    });
  });
}

function addAnimal(type, breed = null) {
  const largeAnimal = ["cow", "sheep", "goat", "pig"].includes(type);
  const bounds = largeAnimal
    ? { x0: 39.4, x1: 44.8, y0: 12.0, y1: 16.1 }
    : { x0: 38.4, x1: 44.3, y0: 12.1, y1: 16.7 };
  const breeds = animalBreedConfig[type] || ["base"];

  state.animals.push({
    type,
    breed: breed || breeds[Math.floor(Math.random() * breeds.length)],
    x: (bounds.x0 + Math.random() * (bounds.x1 - bounds.x0)) * TILE_SIZE,
    y: (bounds.y0 + Math.random() * (bounds.y1 - bounds.y0)) * TILE_SIZE,
    dirX: Math.random() > 0.5 ? 1 : -1,
    dirY: Math.random() > 0.5 ? 1 : -1,
    changeTimer: 1 + Math.random() * 2,
    walkCycle: Math.random() * Math.PI * 2
  });
}

function initAnimals() {
  addAnimal("chicken", "crema");
  addAnimal("chicken", "marron");
  addAnimal("duck", "blanco");
  addAnimal("sheep", "blanca");
  addAnimal("cow", "clasica");
}

function getPlotAt(tileX, tileY) {
  return state.crops.find((plot) => plot.x === tileX && plot.y === tileY);
}

function getMineRockAt(tileX, tileY) {
  return state.mineRocks.find((rock) => rock.x === tileX && rock.y === tileY && !rock.broken);
}

function getSurfaceRockAt(tileX, tileY) {
  return state.surfaceRocks.find((rock) => rock.x === tileX && rock.y === tileY && !rock.broken);
}

function getTreeAt(tileX, tileY) {
  return state.trees.find((tree) => tree.x === tileX && tree.y === tileY);
}

function isFarmDoorTile(tileX, tileY) {
  return (
    isInsideTileArea(barnDoor, tileX, tileY) ||
    isInsideTileArea(cabinDoor, tileX, tileY) ||
    isInsideTileArea(marketDoor, tileX, tileY) ||
    isInsideTileArea(smithDoor, tileX, tileY) ||
    isInsideTileArea(mineDoor, tileX, tileY)
  );
}

function isBlockedTile(tileX, tileY) {
  if (state.scene === "farm") {
    if (tileX < 0 || tileY < 0 || tileX >= MAP_COLS || tileY >= MAP_ROWS) return true;

    const insideBuilding =
      isInsideTileArea(cabinArea, tileX, tileY) ||
      isInsideTileArea(marketArea, tileX, tileY) ||
      isInsideTileArea(smithArea, tileX, tileY) ||
      isInsideTileArea(barnArea, tileX, tileY) ||
      isInsideTileArea(mineFacadeArea, tileX, tileY);

    if (insideBuilding && !isFarmDoorTile(tileX, tileY)) {
      return true;
    }

    return (
      state.trees.some((tree) => tree.x === tileX && tree.y === tileY && !tree.stump) ||
      state.bushes.some((bush) => bush.x === tileX && bush.y === tileY) ||
      state.surfaceRocks.some((rock) => rock.x === tileX && rock.y === tileY && !rock.broken)
    );
  }

  const scene = interiorConfig[state.scene];
  if (tileX < 0 || tileY < 0 || tileX >= scene.cols || tileY >= scene.rows) return true;
  if (tileX === 0 || tileY === 0 || tileX === scene.cols - 1 || tileY === scene.rows - 1) return true;

  if (state.scene === "market") {
    if (tileY <= 3 && tileX >= 3 && tileX <= scene.cols - 4) return true;
  }

  if (state.scene === "cabin") {
    if ((tileX >= 3 && tileX <= 5 && tileY >= 2 && tileY <= 4) || (tileX >= 12 && tileX <= 14 && tileY >= 2 && tileY <= 3)) {
      return true;
    }
  }

  if (state.scene === "barn") {
    if ((tileX >= 3 && tileX <= 6 && tileY >= 3 && tileY <= 5) || (tileX >= 13 && tileX <= 16 && tileY >= 3 && tileY <= 5)) {
      return true;
    }
  }

  if (state.scene === "smith") {
    if (tileX >= 13 && tileX <= 16 && tileY >= 5 && tileY <= 7) return true;
  }

  if (state.scene === "mine") {
    return state.mineRocks.some((rock) => rock.x === tileX && rock.y === tileY && !rock.broken);
  }

  return false;
}

function moveWithCollision(entity, nextX, nextY, radius) {
  const canMoveTo = (x, y) => {
    const corners = [
      [x - radius, y - radius],
      [x + radius, y - radius],
      [x - radius, y + radius],
      [x + radius, y + radius]
    ];
    return corners.every(([cx, cy]) => !isBlockedTile(Math.floor(cx / TILE_SIZE), Math.floor(cy / TILE_SIZE)));
  };

  if (canMoveTo(nextX, entity.y)) entity.x = nextX;
  if (canMoveTo(entity.x, nextY)) entity.y = nextY;
}

function useTool(toolKey, amount = 1) {
  const tool = state.tools[toolKey];
  if (!tool) return true;
  if (tool.durability <= 0) {
    addLog(`${tool.weaponName || tool.label} esta rota. Reparala o mejorala.`);
    return false;
  }
  tool.durability = Math.max(0, tool.durability - amount);
  if (tool.durability === 0) {
    addLog(`${tool.weaponName || tool.label} se rompio.`);
  }
  return true;
}

function improveTool(toolKey, durabilityGain, powerGain) {
  const tool = state.tools[toolKey];
  tool.level += 1;
  tool.power += powerGain;
  tool.maxDurability += durabilityGain;
  tool.durability = tool.maxDurability;
}

function getUpgradeCost(key) {
  const upgrade = upgradeConfig[key];
  const toolKey = key === "watering" ? "water" : key;
  return upgrade.baseCost + (state.tools[toolKey].level - 1) * 36;
}

function buyItem(itemKey) {
  if (state.scene !== "market") {
    addLog("Entra a la tienda del mapa para comprar.");
    return;
  }
  const item = storeConfig[itemKey];
  if (state.phase === "night") {
    addLog("La tienda esta cerrada de noche.");
    return;
  }
  if (state.coins < item.cost) {
    addLog("No te alcanzan las monedas.");
    return;
  }
  state.coins -= item.cost;
  item.buy();
  addLog(`Compraste ${item.label.toLowerCase()} por ${item.cost} monedas.`);
}

function upgradeTool(key) {
  if (state.scene !== "smith") {
    addLog("Las mejoras se hacen dentro de la herreria.");
    return;
  }
  if (state.phase === "night") {
    addLog("La herreria esta cerrada de noche.");
    return;
  }
  const cost = getUpgradeCost(key);
  if (state.coins < cost) {
    addLog("No te alcanzan las monedas para mejorar esa herramienta.");
    return;
  }
  state.coins -= cost;
  upgradeConfig[key].onUpgrade();
  addLog(`Mejoraste ${upgradeConfig[key].label}. Ahora dura mas y rinde mejor.`);
}

function hasMaterials(needs) {
  return Object.entries(needs).every(([key, amount]) => state[key] >= amount);
}

function spendMaterials(needs) {
  Object.entries(needs).forEach(([key, amount]) => {
    state[key] -= amount;
  });
}

function isNearSmithTable() {
  if (state.scene !== "smith") return false;
  const table = interiorConfig.smith.tableArea;
  const centerX = (table.x + table.w / 2) * TILE_SIZE;
  const centerY = (table.y + table.h / 2) * TILE_SIZE;
  return Math.hypot(centerX - player.x, centerY - player.y) <= 86;
}

function craftRecipe(recipeKey) {
  if (state.scene !== "smith" || !isNearSmithTable()) {
    addLog("Acercate a la mesa de crafteo dentro de la herreria.");
    return;
  }
  const recipe = craftRecipes[recipeKey];
  if (!hasMaterials(recipe.needs)) {
    addLog("Te faltan materiales de la mina o madera para fabricar eso.");
    return;
  }
  spendMaterials(recipe.needs);
  recipe.craft();
}

function sellStoreInventory() {
  if (state.scene !== "market") {
    addLog("La cosecha se vende dentro de la tienda.");
    return;
  }

  const cropTotal =
    state.inventory.crops.trigo * cropConfig.trigo.sell +
    state.inventory.crops.maiz * cropConfig.maiz.sell +
    state.inventory.crops.tomate * cropConfig.tomate.sell +
    state.inventory.crops.calabaza * cropConfig.calabaza.sell;
  const animalTotal =
    state.inventory.goods.eggs * 4 +
    state.inventory.goods.milk * 9 +
    state.inventory.goods.wool * 12 +
    state.inventory.goods.truffles * 18;
  const total = cropTotal + animalTotal;

  if (total === 0) {
    addLog("No tienes nada para vender.");
    return;
  }

  state.coins += total;
  state.inventory.crops.trigo = 0;
  state.inventory.crops.maiz = 0;
  state.inventory.crops.tomate = 0;
  state.inventory.crops.calabaza = 0;
  state.inventory.goods.eggs = 0;
  state.inventory.goods.milk = 0;
  state.inventory.goods.wool = 0;
  state.inventory.goods.truffles = 0;
  addLog(`Vendiste cosecha y productos por ${total} monedas.`);
}

function spendTime(value) {
  if (state.phase === "night") return;
  state.time = Math.min(MAX_TIME, state.time + value);
  if (state.time >= MAX_TIME) {
    startNight();
  }
}

function advanceCrops() {
  state.crops.forEach((plot) => {
    if (!plot.crop || plot.ready || !plot.watered) {
      plot.watered = false;
      return;
    }
    const seasonBonus = getSeason().key === "primavera" ? 1 : 0;
    plot.growth += 1 + seasonBonus;
    plot.watered = false;
    if (plot.growth >= cropConfig[plot.crop].turns) {
      plot.ready = true;
    }
  });
}

function updatePlotAnimations(delta) {
  state.crops.forEach((plot) => {
    if (plot.seedAnimation > 0) {
      plot.seedAnimation = Math.max(0, plot.seedAnimation - delta);
      if (plot.seedAnimation === 0) {
        plot.seedAnimationType = null;
      }
    }
  });
}

function updateTreeAnimations(delta) {
  state.trees.forEach((tree) => {
    tree.shakeTimer = Math.max(0, tree.shakeTimer - delta);
    tree.fallTimer = Math.max(0, tree.fallTimer - delta);
  });
}

function updateRockAnimations(delta) {
  state.mineRocks.forEach((rock) => {
    rock.shakeTimer = Math.max(0, rock.shakeTimer - delta);
  });
  state.surfaceRocks.forEach((rock) => {
    rock.shakeTimer = Math.max(0, rock.shakeTimer - delta);
  });
}

function produceAnimalGoods() {
  state.inventory.goods.eggs += countAnimals("chicken") + countAnimals("duck");
  state.inventory.goods.milk += countAnimals("cow") + countAnimals("goat");
  state.inventory.goods.wool += countAnimals("sheep");
  state.inventory.goods.truffles += countAnimals("pig");
}

function selectHotbarSlot(slot, tool, seed) {
  state.activeSlot = slot;
  state.activeTool = tool;
  if (seed) state.activeSeed = seed;
}

function getCanvasPointFromClient(clientX, clientY) {
  const rect = dom.canvas.getBoundingClientRect();
  const scaleX = dom.canvas.width / rect.width;
  const scaleY = dom.canvas.height / rect.height;
  const canvasX = (clientX - rect.left) * scaleX;
  const canvasY = (clientY - rect.top) * scaleY;

  if (state.scene === "farm") {
    return {
      x: camera.x + canvasX,
      y: camera.y + canvasY
    };
  }

  const viewport = getInteriorViewport();
  const insideViewport =
    canvasX >= viewport.offsetX &&
    canvasX <= viewport.offsetX + viewport.drawWidth &&
    canvasY >= viewport.offsetY &&
    canvasY <= viewport.offsetY + viewport.drawHeight;

  if (!insideViewport) {
    return null;
  }

  return {
    x: (canvasX - viewport.offsetX) / viewport.scale,
    y: (canvasY - viewport.offsetY) / viewport.scale
  };
}

function getCanvasPoint(event) {
  return getCanvasPointFromClient(event.clientX, event.clientY);
}

function getPlotFromPoint(x, y) {
  if (state.scene !== "farm") return null;
  return getPlotAt(Math.floor(x / TILE_SIZE), Math.floor(y / TILE_SIZE));
}

function getTreeFromPoint(x, y) {
  if (state.scene !== "farm") return null;
  return getTreeAt(Math.floor(x / TILE_SIZE), Math.floor(y / TILE_SIZE));
}

function getMineRockFromPoint(x, y) {
  if (state.scene !== "mine") return null;
  return getMineRockAt(Math.floor(x / TILE_SIZE), Math.floor(y / TILE_SIZE));
}

function getSurfaceRockFromPoint(x, y) {
  if (state.scene !== "farm") return null;
  return getSurfaceRockAt(Math.floor(x / TILE_SIZE), Math.floor(y / TILE_SIZE));
}

function getEnemyFromPoint(x, y) {
  if (state.phase !== "night" || state.scene !== "farm") return null;
  return state.enemies.find((enemy) => Math.hypot(enemy.x - x, enemy.y - y) <= 20);
}

function clearMoveTarget() {
  state.moveTarget = null;
}

function setMoveTarget(x, y, queuedAction = null) {
  state.moveTarget = {
    x,
    y,
    scene: state.scene,
    queuedAction
  };
}

function buildQueuedAction(point) {
  const plot = getPlotFromPoint(point.x, point.y);
  if (plot) return { kind: "plot", x: plot.x, y: plot.y, scene: state.scene };

  const tree = getTreeFromPoint(point.x, point.y);
  if (tree && !tree.stump) return { kind: "tree", x: tree.x, y: tree.y, scene: state.scene };

  const mineRock = getMineRockFromPoint(point.x, point.y);
  if (mineRock) return { kind: "mineRock", x: mineRock.x, y: mineRock.y, scene: state.scene };

  const surfaceRock = getSurfaceRockFromPoint(point.x, point.y);
  if (surfaceRock) return { kind: "surfaceRock", x: surfaceRock.x, y: surfaceRock.y, scene: state.scene };

  const enemy = getEnemyFromPoint(point.x, point.y);
  if (enemy) return { kind: "enemy", scene: state.scene };

  return null;
}

function actionIsInReach(action) {
  if (!action || action.scene !== state.scene) return false;
  if (action.kind === "enemy") {
    return state.enemies.some((enemy) => Math.hypot(enemy.x - player.x, enemy.y - player.y) <= 72);
  }
  if (action.kind === "plot") return playerCanReachTile(action.x, action.y, 58);
  return playerCanReachTile(action.x, action.y, 62);
}

function performQueuedAction(action) {
  if (!action || action.scene !== state.scene) return false;
  if (action.kind === "enemy") {
    tryAttack();
    return true;
  }

  const plot = action.kind === "plot" ? getPlotAt(action.x, action.y) : null;
  const tree = action.kind === "tree" ? getTreeAt(action.x, action.y) : null;
  const mineRock = action.kind === "mineRock" ? getMineRockAt(action.x, action.y) : null;
  const surfaceRock = action.kind === "surfaceRock" ? getSurfaceRockAt(action.x, action.y) : null;
  handlePrimaryAction(plot, tree, mineRock, surfaceRock);
  return true;
}

function queueMoveOrAction(point) {
  const queuedAction = buildQueuedAction(point);
  if (queuedAction && actionIsInReach(queuedAction)) {
    performQueuedAction(queuedAction);
    clearMoveTarget();
    return;
  }

  setMoveTarget(point.x, point.y, queuedAction);
}

function playerCanReachTile(tileX, tileY, range = 62) {
  const cx = tileX * TILE_SIZE + TILE_SIZE / 2;
  const cy = tileY * TILE_SIZE + TILE_SIZE / 2;
  return Math.hypot(cx - player.x, cy - player.y) <= range;
}

function isNearHorse() {
  return state.scene === "farm" && Math.hypot(horse.x - player.x, horse.y - player.y) <= 72;
}

function toggleHorse() {
  if (state.scene !== "farm") return false;
  if (state.horseMounted) {
    state.horseMounted = false;
    horse.x = player.x + 18;
    horse.y = player.y + 14;
    addLog("Te bajaste del caballo.");
    return true;
  }
  if (isNearHorse()) {
    state.horseMounted = true;
    addLog("Montaste el caballo. Ahora te mueves mucho mas rapido.");
    return true;
  }
  return false;
}

function nearestPlotInFront() {
  if (state.scene !== "farm") return null;
  const tx = player.x + player.facingX * INTERACTION_RANGE;
  const ty = player.y + player.facingY * INTERACTION_RANGE;
  let best = null;
  let bestDistance = Infinity;

  state.crops.forEach((plot) => {
    const px = plot.x * TILE_SIZE + TILE_SIZE / 2;
    const py = plot.y * TILE_SIZE + TILE_SIZE / 2;
    const distance = Math.hypot(tx - px, ty - py);
    if (distance < bestDistance && distance < 50) {
      best = plot;
      bestDistance = distance;
    }
  });
  return best;
}

function nearestTreeInFront() {
  if (state.scene !== "farm") return null;
  const tx = player.x + player.facingX * INTERACTION_RANGE;
  const ty = player.y + player.facingY * INTERACTION_RANGE;
  let best = null;
  let bestDistance = Infinity;

  state.trees.forEach((tree) => {
    if (tree.stump) return;
    const px = tree.x * TILE_SIZE + TILE_SIZE / 2;
    const py = tree.y * TILE_SIZE + TILE_SIZE / 2;
    const distance = Math.hypot(tx - px, ty - py);
    if (distance < bestDistance && distance < 56) {
      best = tree;
      bestDistance = distance;
    }
  });
  return best;
}

function nearestMineRockInFront() {
  if (state.scene !== "mine") return null;
  const tx = player.x + player.facingX * INTERACTION_RANGE;
  const ty = player.y + player.facingY * INTERACTION_RANGE;
  let best = null;
  let bestDistance = Infinity;

  state.mineRocks.forEach((rock) => {
    if (rock.broken) return;
    const px = rock.x * TILE_SIZE + TILE_SIZE / 2;
    const py = rock.y * TILE_SIZE + TILE_SIZE / 2;
    const distance = Math.hypot(tx - px, ty - py);
    if (distance < bestDistance && distance < 56) {
      best = rock;
      bestDistance = distance;
    }
  });
  return best;
}

function nearestSurfaceRockInFront() {
  if (state.scene !== "farm") return null;
  const tx = player.x + player.facingX * INTERACTION_RANGE;
  const ty = player.y + player.facingY * INTERACTION_RANGE;
  let best = null;
  let bestDistance = Infinity;

  state.surfaceRocks.forEach((rock) => {
    if (rock.broken) return;
    const px = rock.x * TILE_SIZE + TILE_SIZE / 2;
    const py = rock.y * TILE_SIZE + TILE_SIZE / 2;
    const distance = Math.hypot(tx - px, ty - py);
    if (distance < bestDistance && distance < 58) {
      best = rock;
      bestDistance = distance;
    }
  });
  return best;
}

function isNearCabinBed() {
  if (state.scene !== "cabin") return false;
  const bed = interiorConfig.cabin.bedArea;
  const centerX = (bed.x + bed.w / 2) * TILE_SIZE;
  const centerY = (bed.y + bed.h / 2) * TILE_SIZE;
  return Math.hypot(centerX - player.x, centerY - player.y) <= 86;
}

function startSleep() {
  if (state.scene !== "cabin") {
    addLog("Solo puedes dormir dentro de la cabaña.");
    return;
  }
  if (!isNearCabinBed()) {
    addLog("Acercate a la cama para dormir.");
    return;
  }
  if (state.phase === "night" && state.enemies.length > 0) {
    addLog("No puedes dormir mientras haya matones en la granja.");
    return;
  }
  state.sleeping = true;
  state.sleepTimer = SLEEP_DURATION;
  addLog("Empezaste a dormir. Debes esperar 10 segundos.");
}

function finishSleep() {
  state.sleeping = false;
  state.sleepTimer = 0;
  state.day += 1;
  state.phase = "day";
  state.time = 12;
  state.enemies = [];
  state.canRest = false;
  advanceCrops();
  produceAnimalGoods();
  state.playerHealth = 100;
  Object.values(state.tools).forEach((tool) => {
    tool.durability = Math.min(tool.maxDurability, tool.durability + 4);
  });
  addLog("Despertaste al dia siguiente. Los cultivos crecieron y los animales produjeron.");
}

function interactWithPlot(plot) {
  if (!plot) {
    if (toggleHorse()) return;
    if (state.scene === "cabin") {
      if (isNearCabinBed()) {
        startSleep();
      } else {
        addLog("Estas en la cabaña. Acercate a la cama para dormir.");
      }
      return;
    }
    if (state.scene === "market") {
      addLog("Estas dentro de la tienda. Compra o vende desde el panel del mapa.");
      return;
    }
    if (state.scene === "smith") {
      addLog("Estas dentro de la herreria. Mejora armas y usa la mesa de crafteo.");
      return;
    }
    if (state.scene === "mine") {
      if (isNearMineStairs()) {
        advanceMineLevel();
      } else {
        addLog("Estas dentro de la mina. Usa el pico en las rocas y limpia el piso para bajar.");
      }
      return;
    }
    addLog("No hay nada util para usar con esa herramienta.");
    return;
  }

  if (state.horseMounted) {
    addLog("Bajate del caballo para trabajar la tierra.");
    return;
  }

  if (state.activeTool === "till") {
    if (!useTool("till")) return;
    if (plot.crop) {
      addLog("No puedes arar un cultivo ya plantado.");
      return;
    }
    if (plot.tilled) {
      addLog("Ese surco ya esta preparado.");
      return;
    }
    plot.tilled = true;
    addLog("Araste la tierra.");
    spendTime(4);
    return;
  }

  if (state.activeTool === "plant") {
    const seed = state.activeSeed;
    if (!plot.tilled || plot.crop) {
      addLog("Necesitas un surco vacio para plantar.");
      return;
    }
    if (state.inventory.seeds[seed] <= 0) {
      addLog(`No tienes semillas de ${seed}.`);
      return;
    }
    plot.crop = seed;
    plot.growth = 0;
    plot.ready = false;
    plot.seedAnimation = SEED_ANIMATION_DURATION;
    plot.seedAnimationType = seed;
    state.inventory.seeds[seed] -= 1;
    addLog(`Plantaste ${cropConfig[seed].label.toLowerCase()}.`);
    spendTime(4);
    return;
  }

  if (state.activeTool === "water") {
    if (!useTool("water")) return;
    if (!plot.crop) {
      addLog("Ese suelo esta vacio.");
      return;
    }
    if (plot.ready) {
      addLog("Ese cultivo ya esta listo.");
      return;
    }
    if (plot.watered) {
      addLog("Ese cultivo ya fue regado.");
      return;
    }
    plot.watered = true;
    addLog("Regaste el cultivo.");
    spendTime(state.tools.water.level >= 3 ? 2 : 3);
    return;
  }

  if (state.activeTool === "harvest") {
    if (!useTool("harvest")) return;
    if (!plot.crop || !plot.ready) {
      addLog("Todavia no puedes cosechar ahi.");
      return;
    }
    const cropType = plot.crop;
    state.inventory.crops[cropType] += 1;
    plot.crop = null;
    plot.ready = false;
    plot.growth = 0;
    plot.watered = false;
    addLog(`Cosechaste ${cropConfig[cropType].label.toLowerCase()}. Llevatelo a la tienda para venderlo.`);
  }
}

function chopTree(tree) {
  if (!tree || tree.stump) {
    addLog("No hay ningun arbol para talar.");
    return;
  }
  if (state.horseMounted) {
    addLog("Bajate del caballo para talar.");
    return;
  }
  if (!useTool("axe")) return;
  tree.health -= state.tools.axe.power;
  tree.shakeTimer = TREE_SHAKE_DURATION;
  tree.fallDir = player.facingX >= 0 ? 1 : -1;
  spendTime(3);

  if (tree.health <= 0) {
    tree.stump = true;
    tree.fallTimer = TREE_FALL_DURATION;
    state.wood += 3 + Math.floor(state.tools.axe.level / 2);
    addLog("Talaste un arbol y juntaste madera.");
  } else {
    addLog("Golpeaste el arbol con el hacha.");
  }
}

function mineRock(rock) {
  if (!rock || rock.broken) {
    addLog("No hay ninguna roca para picar.");
    return;
  }
  if (!useTool("pickaxe")) return;
  rock.health -= state.tools.pickaxe.power;
  rock.shakeTimer = ROCK_SHAKE_DURATION;
  spendTime(3);

  if (rock.health <= 0) {
    rock.broken = true;
    if (rock.type === "piedra") {
      state.stone += 2 + Math.floor(state.tools.pickaxe.level / 2);
      addLog("Rompiste una roca y sacaste piedra.");
    } else if (rock.type === "hierro") {
      state.iron += 1 + Math.floor(state.tools.pickaxe.level / 3);
      state.stone += 1;
      addLog("Extrajiste hierro y piedra de la veta.");
    } else {
      state.crystal += 1;
      addLog("Rompiste un cristal raro de la mina.");
    }

    if (getRemainingMineRocks() === 0) {
      if (state.mineLevel < MAX_MINE_LEVELS) {
        addLog("Limpiaste este nivel. La bajada ya se abrio.");
      } else {
        addLog("Limpiaste el ultimo nivel de la mina.");
      }
    }
  } else {
    addLog("Golpeaste la roca con el pico.");
  }
}

function mineSurfaceRock(rock) {
  if (!rock || rock.broken) {
    addLog("No hay ninguna piedra del campo para picar.");
    return;
  }
  if (!useTool("pickaxe")) return;
  rock.health -= state.tools.pickaxe.power;
  rock.shakeTimer = ROCK_SHAKE_DURATION;
  spendTime(2);

  if (rock.health <= 0) {
    rock.broken = true;
    state.stone += rock.size === "big" ? 4 : 2;
    if (rock.size === "big" && Math.random() < 0.45) {
      state.iron += 1;
      addLog("Rompiste una piedra grande del campo y sacaste piedra con un poco de hierro.");
    } else {
      addLog("Rompiste una piedra del campo y sacaste piedra.");
    }
  } else {
    addLog("Golpeaste una piedra del mapa con el pico.");
  }
}

function handlePrimaryAction(plot = null, tree = null, rock = null, surfaceRock = null) {
  player.toolSwing = 0.22;

  if (state.phase === "night" || state.activeTool === "sword") {
    tryAttack();
    return;
  }

  if (state.activeTool === "axe") {
    const targetTree = tree && playerCanReachTile(tree.x, tree.y) ? tree : nearestTreeInFront();
    if (tree && !playerCanReachTile(tree.x, tree.y)) {
      addLog("Acercate un poco mas al arbol.");
      return;
    }
    chopTree(targetTree);
    return;
  }

  if (state.activeTool === "pickaxe") {
    const mineTarget = rock && playerCanReachTile(rock.x, rock.y) ? rock : nearestMineRockInFront();
    const fieldTarget = surfaceRock && playerCanReachTile(surfaceRock.x, surfaceRock.y) ? surfaceRock : nearestSurfaceRockInFront();

    if (rock && state.scene === "mine" && !playerCanReachTile(rock.x, rock.y)) {
      addLog("Acercate un poco mas a la roca.");
      return;
    }
    if (surfaceRock && state.scene === "farm" && !playerCanReachTile(surfaceRock.x, surfaceRock.y)) {
      addLog("Acercate un poco mas a la piedra.");
      return;
    }
    if (!mineTarget && state.scene === "mine" && isNearMineStairs()) {
      advanceMineLevel();
      return;
    }
    if (state.scene === "mine") {
      mineRock(mineTarget);
    } else {
      mineSurfaceRock(fieldTarget);
    }
    return;
  }

  const targetPlot = plot && playerCanReachTile(plot.x, plot.y, 58) ? plot : nearestPlotInFront();
  if (plot && !playerCanReachTile(plot.x, plot.y, 58)) {
    addLog("Acercate un poco mas a la parcela.");
    return;
  }
  interactWithPlot(targetPlot);
}

function handleInteract() {
  if (state.phase === "night" || state.activeTool === "sword") {
    tryAttack();
    return;
  }

  if (state.activeTool === "axe") {
    chopTree(nearestTreeInFront());
    return;
  }

  if (state.activeTool === "pickaxe") {
    const rock = state.scene === "mine" ? nearestMineRockInFront() : nearestSurfaceRockInFront();
    if (!rock && state.scene === "mine" && isNearMineStairs()) {
      advanceMineLevel();
      return;
    }
    if (state.scene === "mine") {
      mineRock(rock);
    } else {
      mineSurfaceRock(rock);
    }
    return;
  }

  interactWithPlot(nearestPlotInFront());
}

function buildNightWave() {
  const total = Math.min(4 + state.day, 14);
  state.enemies = [];
  for (let index = 0; index < total; index += 1) {
    state.enemies.push({
      x: (2 + index * 1.2) * TILE_SIZE,
      y: (MAP_ROWS - 4 + (index % 3) * 0.7) * TILE_SIZE,
      health: 26 + state.day * 6 + index * 3,
      maxHealth: 26 + state.day * 6 + index * 3,
      reward: 8 + state.day * 2 + index,
      walkCycle: Math.random() * Math.PI * 2
    });
  }
}

function startNight() {
  state.phase = "night";
  state.time = MAX_TIME;
  state.canRest = false;
  buildNightWave();
  addLog(`Anochecio en ${getSeason().label.toLowerCase()} y aparecieron ${state.enemies.length} matones.`);
}

function tryAttack() {
  if (state.phase !== "night") {
    addLog("La espada sirve para la noche.");
    return;
  }
  if (state.scene !== "farm") {
    addLog("Los matones estan afuera. Sal para pelear.");
    return;
  }
  if (!useTool("sword")) return;
  if (player.attackCooldown > 0) return;

  player.attackCooldown = 0.3;
  player.toolSwing = 0.24;
  const damage = 12 + state.tools.sword.power * 3;
  let hitEnemy = false;

  state.enemies = state.enemies.filter((enemy) => {
    const distance = Math.hypot(enemy.x - player.x, enemy.y - player.y);
    if (distance <= (state.horseMounted ? 66 : 54)) {
      enemy.health -= damage;
      hitEnemy = true;
      if (enemy.health <= 0) {
        state.coins += enemy.reward;
        addLog(`Venciste a un maton y te dio ${enemy.reward} monedas.`);
        return false;
      }
    }
    return true;
  });

  if (!hitEnemy) addLog("La espada no alcanzo a nadie.");
  if (state.enemies.length === 0) {
    state.canRest = true;
    addLog("Limpiaste la granja. Ya puedes ir a dormir.");
  }
}

function setScene(scene, spawnX, spawnY) {
  state.scene = scene;
  state.horseMounted = false;
  state.sleeping = false;
  state.sleepTimer = 0;
  state.transitionCooldown = 0.28;
  clearMoveTarget();
  player.x = spawnX * TILE_SIZE;
  player.y = spawnY * TILE_SIZE;
  updateCamera();
}

function distanceToDoor(area) {
  const centerX = (area.x + area.w / 2) * TILE_SIZE;
  const centerY = (area.y + area.h / 2) * TILE_SIZE;
  return Math.hypot(centerX - player.x, centerY - player.y);
}

function distanceToArea(area) {
  const centerX = (area.x + area.w / 2) * TILE_SIZE;
  const centerY = (area.y + area.h / 2) * TILE_SIZE;
  return Math.hypot(centerX - player.x, centerY - player.y);
}

function updateSceneTransitions() {
  if (state.sleeping || state.transitionCooldown > 0) return;

  const tileX = Math.floor(player.x / TILE_SIZE);
  const tileY = Math.floor(player.y / TILE_SIZE);

  if (state.scene === "farm") {
    if (state.phase === "night") return;

    if (distanceToDoor(barnDoor) <= 30 || isInsideTileArea(barnDoor, tileX, tileY)) {
      setScene("barn", interiorConfig.barn.spawn.x, interiorConfig.barn.spawn.y);
      addLog("Entraste al granero.");
      return;
    }
    if (distanceToDoor(cabinDoor) <= 28 || isInsideTileArea(cabinDoor, tileX, tileY)) {
      setScene("cabin", interiorConfig.cabin.spawn.x, interiorConfig.cabin.spawn.y);
      addLog("Entraste a la cabaña.");
      return;
    }
    if (distanceToDoor(marketDoor) <= 28 || isInsideTileArea(marketDoor, tileX, tileY)) {
      setScene("market", interiorConfig.market.spawn.x, interiorConfig.market.spawn.y);
      addLog("Entraste a la tienda.");
      return;
    }
    if (distanceToDoor(smithDoor) <= 28 || isInsideTileArea(smithDoor, tileX, tileY)) {
      setScene("smith", interiorConfig.smith.spawn.x, interiorConfig.smith.spawn.y);
      addLog("Entraste a la herreria.");
      return;
    }
    if (distanceToDoor(mineDoor) <= 34 || isInsideTileArea(mineDoor, tileX, tileY)) {
      setScene("mine", interiorConfig.mine.spawn.x, interiorConfig.mine.spawn.y);
      addLog("Entraste a la mina.");
    }
    return;
  }

  const scene = interiorConfig[state.scene];
  const nearExit =
    isInsideTileArea(scene.exitArea, tileX, tileY) ||
    distanceToArea(scene.exitArea) <= 34;

  if (nearExit) {
    if (state.scene === "barn") {
      setScene("farm", barnDoor.x + 0.5, barnDoor.y + 2.2);
      addLog("Saliste del granero.");
    } else if (state.scene === "cabin") {
      setScene("farm", cabinDoor.x + 0.5, cabinDoor.y + 2.2);
      addLog("Saliste de la cabaña.");
    } else if (state.scene === "market") {
      setScene("farm", marketDoor.x + 0.5, marketDoor.y + 2.2);
      addLog("Saliste de la tienda.");
    } else if (state.scene === "smith") {
      setScene("farm", smithDoor.x + 0.5, smithDoor.y + 2.2);
      addLog("Saliste de la herreria.");
    } else if (state.scene === "mine") {
      setScene("farm", mineDoor.x + 1, mineDoor.y + 2.2);
      addLog("Saliste de la mina.");
    }
  }
}

function updateSleep(delta) {
  if (!state.sleeping) return;
  state.sleepTimer = Math.max(0, state.sleepTimer - delta);
  if (state.sleepTimer === 0) {
    finishSleep();
  }
}

function updatePlayer(delta) {
  if (state.sleeping) {
    player.isMoving = false;
    player.attackCooldown = Math.max(0, player.attackCooldown - delta);
    player.toolSwing = Math.max(0, player.toolSwing - delta);
    return;
  }

  state.transitionCooldown = Math.max(0, state.transitionCooldown - delta);

  let moveX = 0;
  let moveY = 0;

  if (input.left) moveX -= 1;
  if (input.right) moveX += 1;
  if (input.up) moveY -= 1;
  if (input.down) moveY += 1;

  const hasManualInput = moveX !== 0 || moveY !== 0;
  if (hasManualInput) {
    clearMoveTarget();
  } else if (state.moveTarget && state.moveTarget.scene === state.scene) {
    const dx = state.moveTarget.x - player.x;
    const dy = state.moveTarget.y - player.y;
    const distance = Math.hypot(dx, dy);
    const stopDistance = state.moveTarget.queuedAction ? 42 : 10;

    if (state.moveTarget.queuedAction && actionIsInReach(state.moveTarget.queuedAction)) {
      performQueuedAction(state.moveTarget.queuedAction);
      clearMoveTarget();
    } else if (distance <= stopDistance) {
      clearMoveTarget();
    } else {
      moveX = dx / distance;
      moveY = dy / distance;
    }
  } else if (state.moveTarget) {
    clearMoveTarget();
  }

  if (moveX !== 0 || moveY !== 0) {
    const length = Math.hypot(moveX, moveY);
    if (length > 0) {
      moveX /= length;
      moveY /= length;
    }
    player.facingX = moveX;
    player.facingY = moveY;
    player.isMoving = true;
    player.walkCycle += delta * (state.horseMounted ? 14 : 11);
    moveWithCollision(
      player,
      player.x + moveX * currentMoveSpeed() * delta,
      player.y + moveY * currentMoveSpeed() * delta,
      PLAYER_RADIUS
    );
  } else {
    player.isMoving = false;
  }

  if (state.scene === "farm" && state.horseMounted) {
    horse.x = player.x - 2;
    horse.y = player.y + 8;
    horse.walkCycle += delta * 12;
  } else {
    horse.walkCycle += delta * 2;
  }

  player.attackCooldown = Math.max(0, player.attackCooldown - delta);
  player.toolSwing = Math.max(0, player.toolSwing - delta);
  updateSceneTransitions();
}

function updateCamera() {
  if (state.scene === "farm") {
    camera.x = clamp(player.x - dom.canvas.width / 2, 0, MAP_COLS * TILE_SIZE - dom.canvas.width);
    camera.y = clamp(player.y - dom.canvas.height / 2, 0, MAP_ROWS * TILE_SIZE - dom.canvas.height);
    return;
  }

  camera.x = 0;
  camera.y = 0;
}

function updateAnimals(delta) {
  if (state.scene !== "farm") return;
  state.animals.forEach((animal) => {
    animal.changeTimer -= delta;
    animal.walkCycle += delta * (animal.type === "cow" ? 5 : 8);
    if (animal.changeTimer <= 0) {
      animal.changeTimer = 1 + Math.random() * 2.5;
      animal.dirX = Math.random() * 2 - 1;
      animal.dirY = Math.random() * 2 - 1;
    }

    const speed = animal.type === "cow" ? 12 : 18;
    animal.x += animal.dirX * speed * delta;
    animal.y += animal.dirY * speed * delta;

    const minX = penArea.x * TILE_SIZE + 18;
    const maxX = (penArea.x + penArea.w) * TILE_SIZE - 18;
    const minY = penArea.y * TILE_SIZE + 18;
    const maxY = (penArea.y + penArea.h) * TILE_SIZE - 18;

    if (animal.x < minX || animal.x > maxX) {
      animal.dirX *= -1;
      animal.x = clamp(animal.x, minX, maxX);
    }
    if (animal.y < minY || animal.y > maxY) {
      animal.dirY *= -1;
      animal.y = clamp(animal.y, minY, maxY);
    }
  });
}

function updateEnemies(delta) {
  if (state.phase !== "night" || state.scene !== "farm") return;

  enemyHitClock += delta;
  state.enemies.forEach((enemy) => {
    const dx = player.x - enemy.x;
    const dy = player.y - enemy.y;
    const distance = Math.max(1, Math.hypot(dx, dy));
    const speed = 44 + state.day * 1.8;
    enemy.walkCycle += delta * 9;
    enemy.x += (dx / distance) * speed * delta;
    enemy.y += (dy / distance) * speed * delta;
  });

  if (enemyHitClock >= 0.7) {
    enemyHitClock = 0;
    state.enemies.forEach((enemy) => {
      const distance = Math.hypot(enemy.x - player.x, enemy.y - player.y);
      if (distance <= PLAYER_RADIUS + ENEMY_RADIUS + 10) {
        const damage = state.horseMounted ? 6 : 8;
        state.playerHealth = Math.max(0, state.playerHealth - damage);
        addLog("Un maton te pego. Busca la herreria para mejorar tu espada.");
      }
    });

    if (state.playerHealth <= 0) {
      const stolen = Math.min(state.coins, 18);
      state.coins -= stolen;
      state.playerHealth = 60;
      state.horseMounted = false;
      addLog(`Te tumban un rato y te roban ${stolen} monedas, pero sigues en pie.`);
    }
  }
}

function updateTime(delta) {
  if (state.phase === "night" || state.sleeping) return;
  passiveClock += delta;
  if (passiveClock >= 1.5) {
    passiveClock = 0;
    spendTime(1);
  }
}

function drawGrassTile(col, row, season) {
  const x = col * TILE_SIZE;
  const y = row * TILE_SIZE;
  const baseGrass = isInsideTileArea(farmHubArea, col, row) ? season.farm : season.grass;
  const patchOffset = (col * 17 + row * 11) % 4;
  const dotOffset = (col * 13 + row * 7) % 5;

  ctx.fillStyle = baseGrass;
  ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
  ctx.fillStyle = "rgba(255,255,255,0.05)";
  ctx.fillRect(x + 2, y + 2, TILE_SIZE - 10, 3);
  ctx.fillStyle = "rgba(255,255,255,0.04)";
  ctx.fillRect(x + 5 + dotOffset, y + 7, 6, 2);
  ctx.fillRect(x + 18 - patchOffset, y + 20, 5, 2);

  ctx.fillStyle = "rgba(63,120,44,0.14)";
  ctx.fillRect(x + 1 + patchOffset, y + 10, 10, 6);
  ctx.fillRect(x + 16, y + 4 + dotOffset, 12, 5);
  ctx.fillRect(x + 12 - patchOffset, y + 22, 9, 4);

  ctx.fillStyle = "rgba(26,83,34,0.24)";
  ctx.fillRect(x + 4, y + 8 + (col % 3), 2, 9);
  ctx.fillRect(x + 7, y + 11, 2, 7);
  ctx.fillRect(x + 18, y + 10 - (row % 2), 2, 10);
  ctx.fillRect(x + 22, y + 7 + (patchOffset % 2), 2, 8);
  ctx.fillRect(x + 26, y + 14, 2, 7);

  ctx.fillStyle = "rgba(210, 239, 172, 0.12)";
  ctx.fillRect(x + 10, y + 9, 2, 3);
  ctx.fillRect(x + 20, y + 15, 2, 3);
  ctx.fillRect(x + 6, y + 21, 2, 2);
}

function drawSoilTile(col, row) {
  const x = col * TILE_SIZE;
  const y = row * TILE_SIZE;
  ctx.fillStyle = "#95683d";
  ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
  ctx.fillStyle = "rgba(70,39,18,0.24)";
  ctx.fillRect(x + 4, y + 6, 24, 2);
  ctx.fillRect(x + 2, y + 14, 26, 2);
  ctx.fillRect(x + 6, y + 22, 20, 2);
}

function drawGround() {
  const season = getSeason();
  for (let row = 0; row < MAP_ROWS; row += 1) {
    for (let col = 0; col < MAP_COLS; col += 1) {
      const inField =
        col >= fieldOrigin.x - 1 &&
        col <= fieldOrigin.x + fieldCols + 1 &&
        row >= fieldOrigin.y - 1 &&
        row <= fieldOrigin.y + fieldRows + 1;

      if (isInsideTileArea(mineFacadeArea, col, row)) {
        ctx.fillStyle = row % 2 === 0 ? "#656a73" : "#565b64";
        ctx.fillRect(col * TILE_SIZE, row * TILE_SIZE, TILE_SIZE, TILE_SIZE);
      } else if (isInsideTileArea(penArea, col, row)) {
        ctx.fillStyle = "#d0a75d";
        ctx.fillRect(col * TILE_SIZE, row * TILE_SIZE, TILE_SIZE, TILE_SIZE);
      } else if (isPathTile(col, row)) {
        ctx.fillStyle = row % 2 === 0 ? "#ba986b" : "#c8a474";
        ctx.fillRect(col * TILE_SIZE, row * TILE_SIZE, TILE_SIZE, TILE_SIZE);
        ctx.fillStyle = "rgba(120,87,45,0.22)";
        ctx.fillRect(col * TILE_SIZE + 4, row * TILE_SIZE + 6, 6, 4);
        ctx.fillRect(col * TILE_SIZE + 18, row * TILE_SIZE + 18, 5, 4);
      } else if (inField) {
        drawSoilTile(col, row);
      } else {
        drawGrassTile(col, row, season);
      }
    }
  }
}

function drawMineFacade() {
  const x = mineFacadeArea.x * TILE_SIZE;
  const y = mineFacadeArea.y * TILE_SIZE;
  const w = mineFacadeArea.w * TILE_SIZE;
  const h = mineFacadeArea.h * TILE_SIZE;
  ctx.fillStyle = "rgba(0,0,0,0.22)";
  ctx.fillRect(x + 8, y + h - 10, w - 16, 8);
  ctx.fillStyle = "#4f545d";
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = "#737985";
  ctx.fillRect(x + 10, y + 10, w - 20, 12);
  ctx.fillStyle = "#6d727c";
  for (let i = 0; i < 10; i += 1) {
    ctx.fillRect(x + 18 + i * 36, y + 14 + (i % 2) * 16, 14, 10);
  }
  ctx.fillStyle = "#7f867f";
  ctx.fillRect(x + 24, y + 34, 56, 14);
  ctx.fillRect(x + w - 84, y + 40, 52, 14);
  ctx.fillStyle = "#3a3e45";
  ctx.fillRect(x + 28, y + 38, 48, 4);
  ctx.fillRect(x + w - 80, y + 44, 44, 4);
  ctx.fillStyle = "#2b2e34";
  ctx.fillRect(mineDoor.x * TILE_SIZE, mineDoor.y * TILE_SIZE, mineDoor.w * TILE_SIZE, mineDoor.h * TILE_SIZE);
  ctx.fillStyle = "#8f7151";
  ctx.fillRect(mineDoor.x * TILE_SIZE + 6, mineDoor.y * TILE_SIZE - 14, mineDoor.w * TILE_SIZE - 12, 14);
  ctx.fillStyle = "#b49a73";
  ctx.fillRect(mineDoor.x * TILE_SIZE + 10, mineDoor.y * TILE_SIZE - 10, mineDoor.w * TILE_SIZE - 20, 4);
}

function drawWindow(x, y, width, height, colors) {
  ctx.fillStyle = colors.frame;
  ctx.fillRect(x, y, width, height);
  ctx.fillStyle = colors.glass;
  ctx.fillRect(x + 3, y + 3, width - 6, height - 6);
  ctx.fillStyle = colors.shine;
  ctx.fillRect(x + 5, y + 5, Math.max(4, width / 3), 3);
  ctx.fillStyle = colors.frame;
  ctx.fillRect(x + Math.floor(width / 2) - 1, y + 2, 2, height - 4);
  ctx.fillRect(x + 2, y + Math.floor(height / 2) - 1, width - 4, 2);
}

function drawBuilding(area, colors, title = "") {
  const x = area.x * TILE_SIZE;
  const y = area.y * TILE_SIZE;
  const w = area.w * TILE_SIZE;
  const h = area.h * TILE_SIZE;
  const roofHeight = 22;
  ctx.fillStyle = "rgba(0,0,0,0.22)";
  ctx.fillRect(x + 6, y + h - 8, w - 12, 8);
  ctx.fillStyle = colors.foundation || "#6d4b34";
  ctx.fillRect(x, y + h - 8, w, 8);
  ctx.fillStyle = colors.roofDark || colors.roof;
  ctx.fillRect(x - 4, y + 6, w + 8, roofHeight);
  ctx.fillStyle = colors.roof;
  ctx.fillRect(x, y, w, roofHeight);
  ctx.fillStyle = colors.roofLight || "rgba(255,255,255,0.08)";
  for (let stripe = 0; stripe < 4; stripe += 1) {
    ctx.fillRect(x + 8, y + 4 + stripe * 5, w - 16, 2);
  }
  ctx.fillStyle = colors.wall;
  ctx.fillRect(x, y + roofHeight, w, h - roofHeight);
  ctx.fillStyle = colors.wallLight || "rgba(255,255,255,0.08)";
  ctx.fillRect(x + 6, y + roofHeight + 4, w - 12, 6);
  ctx.fillStyle = colors.wallDark || "rgba(0,0,0,0.1)";
  for (let plank = y + roofHeight + 14; plank < y + h - 10; plank += 10) {
    ctx.fillRect(x + 4, plank, w - 8, 2);
  }
  ctx.fillStyle = colors.trim;
  ctx.fillRect(x + 6, y + roofHeight, 8, h - roofHeight);
  ctx.fillRect(x + w - 14, y + roofHeight, 8, h - roofHeight);
  ctx.fillRect(x + 16, y + h - 14, w - 32, 6);
  ctx.fillStyle = colors.door;
  ctx.fillRect(x + w / 2 - 10, y + h - 18, 20, 18);
  ctx.fillStyle = colors.doorLight || "#c29b68";
  ctx.fillRect(x + w / 2 - 8, y + h - 16, 16, 4);
  ctx.fillStyle = colors.knob || "#f7d48c";
  ctx.fillRect(x + w / 2 + 5, y + h - 10, 2, 2);
  drawWindow(x + 18, y + roofHeight + 14, 18, 18, {
    frame: colors.trim,
    glass: colors.window || "#9dc7d7",
    shine: colors.windowLight || "#dff5ff"
  });
  drawWindow(x + w - 36, y + roofHeight + 14, 18, 18, {
    frame: colors.trim,
    glass: colors.window || "#9dc7d7",
    shine: colors.windowLight || "#dff5ff"
  });
  ctx.fillStyle = colors.sign;
  ctx.fillRect(x + w / 2 - 18, y + roofHeight + 4, 36, 10);
  ctx.fillStyle = colors.signDark || "rgba(0,0,0,0.14)";
  ctx.fillRect(x + w / 2 - 14, y + roofHeight + 8, 28, 2);
  if (title) {
    ctx.fillStyle = colors.signText || "#3a2411";
    ctx.font = "bold 10px Trebuchet MS";
    ctx.textAlign = "center";
    ctx.fillText(title, x + w / 2, y + roofHeight + 13);
    ctx.textAlign = "left";
  }
}

function drawPen() {
  const x = penArea.x * TILE_SIZE;
  const y = penArea.y * TILE_SIZE;
  const w = penArea.w * TILE_SIZE;
  const h = penArea.h * TILE_SIZE;
  ctx.fillStyle = "#d7b35d";
  ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = "#7c5630";
  ctx.lineWidth = 4;
  ctx.strokeRect(x + 2, y + 2, w - 4, h - 4);
}

function drawTrees() {
  state.trees.forEach((tree) => {
    const x = tree.x * TILE_SIZE + TILE_SIZE / 2;
    const y = tree.y * TILE_SIZE + TILE_SIZE / 2;
    const shake = tree.shakeTimer > 0 ? Math.sin(tree.shakeTimer * 70) * 3 : 0;
    const season = getSeason();

    if (!tree.stump) {
      ctx.fillStyle = "rgba(0,0,0,0.18)";
      ctx.fillRect(x - 16, y + 12, 32, 5);
      if (tree.variant === "pine") {
        ctx.fillStyle = "#5a3921";
        ctx.fillRect(x - 5, y - 2, 10, 22);
        ctx.fillStyle = "#276f50";
        ctx.fillRect(x - 14 + shake, y - 8, 28, 16);
        ctx.fillRect(x - 16 + shake, y - 21, 32, 14);
        ctx.fillRect(x - 11 + shake, y - 35, 22, 15);
        ctx.fillStyle = "#3b8f67";
        ctx.fillRect(x - 8 + shake, y - 28, 16, 5);
      } else if (tree.variant === "orange") {
        ctx.fillStyle = "#5c331b";
        ctx.fillRect(x - 5, y - 3, 10, 20);
        ctx.fillStyle = "#5db15d";
        ctx.fillRect(x - 16 + shake, y - 25, 32, 22);
        ctx.fillStyle = "#7dca72";
        ctx.fillRect(x - 10 + shake, y - 34, 20, 12);
        ctx.fillStyle = "#f59f39";
        ctx.fillRect(x - 10 + shake, y - 16, 4, 4);
        ctx.fillRect(x + 4 + shake, y - 11, 4, 4);
        ctx.fillRect(x - 1 + shake, y - 26, 4, 4);
        ctx.fillRect(x - 6 + shake, y - 22, 4, 4);
      } else {
        ctx.fillStyle = "#4d2d1d";
        ctx.fillRect(x - 5, y - 3, 10, 21);
        ctx.fillStyle = season.treeA;
        ctx.fillRect(x - 15 + shake, y - 24, 30, 22);
        ctx.fillStyle = season.treeB;
        ctx.fillRect(x - 10 + shake, y - 34, 20, 12);
        ctx.fillStyle = "rgba(255,255,255,0.08)";
        ctx.fillRect(x - 12 + shake, y - 18, 24, 8);
      }
      return;
    }

    if (tree.fallTimer > 0) {
      const progress = 1 - tree.fallTimer / TREE_FALL_DURATION;
      const fallOffset = progress * 20 * tree.fallDir;
      ctx.fillStyle = "#4d2d1d";
      ctx.fillRect(x - 4, y - 2, 8 + Math.abs(fallOffset), 6);
    }
    ctx.fillStyle = "#6a421f";
    ctx.fillRect(x - 8, y + 4, 16, 8);
  });
}

function drawBushes() {
  state.bushes.forEach((bush) => {
    const x = bush.x * TILE_SIZE + TILE_SIZE / 2;
    const y = bush.y * TILE_SIZE + TILE_SIZE / 2;
    ctx.fillStyle = "rgba(0,0,0,0.14)";
    ctx.fillRect(x - 11, y + 7, 22, 4);
    ctx.fillStyle = bush.variant === "wild" ? "#4e9b49" : "#63b65d";
    ctx.fillRect(x - 12, y - 2, 24, 12);
    ctx.fillStyle = bush.variant === "wild" ? "#397637" : "#7fca74";
    ctx.fillRect(x - 8, y - 8, 16, 8);
    ctx.fillStyle = "rgba(255,221,238,0.24)";
    ctx.fillRect(x - 7, y - 4, 3, 3);
    ctx.fillRect(x + 2, y - 1, 3, 3);
    ctx.fillRect(x - 1, y - 7, 3, 3);
  });
}

function drawSurfaceRocks() {
  state.surfaceRocks.forEach((rock) => {
    if (rock.broken) return;
    const x = rock.x * TILE_SIZE + TILE_SIZE / 2;
    const y = rock.y * TILE_SIZE + TILE_SIZE / 2;
    const shake = rock.shakeTimer > 0 ? Math.sin(rock.shakeTimer * 60) * 2 : 0;
    const width = rock.size === "big" ? 30 : 22;
    const height = rock.size === "big" ? 20 : 15;
    ctx.fillStyle = "rgba(0,0,0,0.16)";
    ctx.fillRect(x - width / 2, y + 8, width, 4);
    ctx.fillStyle = "#8d939a";
    ctx.fillRect(x - width / 2 + shake, y - height / 2, width, height);
    ctx.fillStyle = "#bcc4ce";
    ctx.fillRect(x - width / 2 + 4 + shake, y - height / 2 + 3, width / 2, 4);
    ctx.fillStyle = "#6b7178";
    ctx.fillRect(x + 2 + shake, y + 1, width / 3, 3);
  });
}

function drawPlots() {
  state.crops.forEach((plot) => {
    const x = plot.x * TILE_SIZE;
    const y = plot.y * TILE_SIZE;
    ctx.fillStyle = plot.tilled ? "#7b4f28" : "#a97445";
    ctx.fillRect(x + 2, y + 2, TILE_SIZE - 4, TILE_SIZE - 4);
    ctx.fillStyle = "rgba(255, 231, 181, 0.07)";
    ctx.fillRect(x + 3, y + 4, TILE_SIZE - 6, 2);

    if (plot.watered) {
      ctx.fillStyle = "rgba(96,166,255,0.3)";
      ctx.fillRect(x + 3, y + 3, TILE_SIZE - 6, TILE_SIZE - 6);
    }

    if (plot.crop) {
      const crop = cropConfig[plot.crop];
      ctx.fillStyle = plot.ready ? "#ffe785" : crop.color;
      const growthHeight = plot.ready ? 16 : 8 + plot.growth * 3;
      ctx.fillRect(x + 11, y + TILE_SIZE - growthHeight - 4, 10, growthHeight);
      ctx.fillStyle = "#4b8b37";
      ctx.fillRect(x + 8, y + TILE_SIZE - growthHeight, 4, growthHeight - 3);
      ctx.fillRect(x + 20, y + TILE_SIZE - growthHeight + 2, 4, growthHeight - 5);
    }

    if (plot.seedAnimation > 0 && plot.seedAnimationType) {
      const progress = 1 - plot.seedAnimation / SEED_ANIMATION_DURATION;
      const seedColor = cropConfig[plot.seedAnimationType].color;
      const seedY = y - 8 + progress * 20;
      const scale = 1 + Math.sin(progress * Math.PI) * 0.5;
      ctx.fillStyle = "rgba(255,243,170,0.35)";
      ctx.beginPath();
      ctx.arc(x + TILE_SIZE / 2, y + TILE_SIZE / 2, 6 + progress * 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = seedColor;
      ctx.beginPath();
      ctx.ellipse(x + TILE_SIZE / 2, seedY, 3.5 * scale, 2.5 * scale, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  });
}

function drawHorse() {
  if (state.scene !== "farm" || state.horseMounted) return;
  drawHorseSprite(horse.x, horse.y, horse.walkCycle, 1);
}

function drawChickenSprite(x, y, walkCycle, facing = 1, scale = 1, breed = "crema") {
  const bob = Math.sin(walkCycle) * 1.5 * scale;
  const legSwing = Math.sin(walkCycle) * 1.6 * scale;
  const bodyColor = breed === "marron" ? "#c98d57" : breed === "negra" ? "#55545d" : "#fff2bf";
  const wingColor = breed === "marron" ? "#b87843" : breed === "negra" ? "#6d6b75" : "#f7e39b";
  const crestColor = breed === "negra" ? "#b84a4a" : "#d44f4f";
  ctx.fillStyle = "rgba(0,0,0,0.18)";
  ctx.fillRect(x - 8 * scale, y + 7 * scale, 16 * scale, 3 * scale);
  ctx.fillStyle = bodyColor;
  ctx.fillRect(x - 8 * scale, y - 7 * scale + bob, 16 * scale, 14 * scale);
  ctx.fillStyle = wingColor;
  ctx.fillRect(x - 4 * scale, y - 10 * scale + bob, 8 * scale, 5 * scale);
  ctx.fillStyle = crestColor;
  ctx.fillRect(x - 2 * scale, y - 12 * scale + bob, 4 * scale, 4 * scale);
  ctx.fillStyle = "#cf9f4b";
  ctx.fillRect(x + 7 * scale * facing, y - 3 * scale + bob, 3 * scale, 3 * scale);
  ctx.fillRect(x - 5 * scale, y + 7 * scale + bob, 2 * scale, 4 * scale + legSwing * 0.35);
  ctx.fillRect(x + 3 * scale, y + 7 * scale + bob, 2 * scale, 4 * scale - legSwing * 0.35);
  ctx.fillStyle = "#3a2414";
  ctx.fillRect(x + 2 * scale * facing, y - 5 * scale + bob, 2 * scale, 2 * scale);
}

function drawDuckSprite(x, y, walkCycle, facing = 1, scale = 1, breed = "blanco") {
  const bob = Math.sin(walkCycle) * 1.2 * scale;
  const bodyColor = breed === "verde" ? "#dfe9d2" : "#f5f4ea";
  const headColor = breed === "verde" ? "#3b7c57" : "#f7f1df";
  ctx.fillStyle = "rgba(0,0,0,0.18)";
  ctx.fillRect(x - 8 * scale, y + 7 * scale, 16 * scale, 3 * scale);
  ctx.fillStyle = bodyColor;
  ctx.fillRect(x - 8 * scale, y - 5 * scale + bob, 16 * scale, 12 * scale);
  ctx.fillStyle = headColor;
  ctx.fillRect(x + 1 * scale * facing, y - 9 * scale + bob, 6 * scale, 6 * scale);
  ctx.fillStyle = "#dba251";
  ctx.fillRect(x + 7 * scale * facing, y - 6 * scale + bob, 3 * scale, 2 * scale);
  ctx.fillRect(x - 4 * scale, y + 7 * scale + bob, 2 * scale, 4 * scale);
  ctx.fillRect(x + 2 * scale, y + 7 * scale + bob, 2 * scale, 4 * scale);
}

function drawCowSprite(x, y, walkCycle, facing = 1, scale = 1, breed = "clasica") {
  const bob = Math.sin(walkCycle) * 1.1 * scale;
  const legSwing = Math.sin(walkCycle) * 1.9 * scale;
  const bodyColor = breed === "marron" ? "#d8b28d" : "#fff4dd";
  const headColor = breed === "marron" ? "#c89d77" : "#f2e5cb";
  const spotColor = breed === "manchada" ? "#55392a" : "#7b5230";
  ctx.fillStyle = "rgba(0,0,0,0.18)";
  ctx.fillRect(x - 14 * scale, y + 10 * scale, 28 * scale, 4 * scale);
  ctx.fillStyle = bodyColor;
  ctx.fillRect(x - 14 * scale, y - 10 * scale + bob, 28 * scale, 18 * scale);
  ctx.fillStyle = headColor;
  ctx.fillRect(x - 4 * scale, y - 14 * scale + bob, 12 * scale, 8 * scale);
  ctx.fillStyle = spotColor;
  ctx.fillRect(x - 8 * scale, y - 7 * scale + bob, 8 * scale, 7 * scale);
  ctx.fillRect(x + 4 * scale, y - 1 * scale + bob, 7 * scale, 6 * scale);
  ctx.fillRect(x + 10 * scale * facing, y - 7 * scale + bob, 5 * scale, 10 * scale);
  ctx.fillStyle = "#f0d7c5";
  ctx.fillRect(x + 8 * scale * facing, y - 2 * scale + bob, 6 * scale, 5 * scale);
  ctx.fillStyle = "#8d6d4e";
  ctx.fillRect(x - 10 * scale, y + 8 * scale + bob, 4 * scale, 7 * scale + legSwing * 0.25);
  ctx.fillRect(x - 2 * scale, y + 8 * scale + bob, 4 * scale, 7 * scale - legSwing * 0.25);
  ctx.fillRect(x + 4 * scale, y + 8 * scale + bob, 4 * scale, 7 * scale + legSwing * 0.25);
  ctx.fillRect(x + 10 * scale, y + 8 * scale + bob, 4 * scale, 7 * scale - legSwing * 0.25);
  ctx.fillStyle = "#3a2414";
  ctx.fillRect(x + 9 * scale * facing, y - 4 * scale + bob, 2 * scale, 2 * scale);
}

function drawSheepSprite(x, y, walkCycle, facing = 1, scale = 1, breed = "blanca") {
  const bob = Math.sin(walkCycle) * 1.1 * scale;
  const wool = breed === "gris" ? "#d0d3d7" : "#f5f1e8";
  const face = breed === "gris" ? "#6f7077" : "#82624e";
  ctx.fillStyle = "rgba(0,0,0,0.18)";
  ctx.fillRect(x - 13 * scale, y + 10 * scale, 26 * scale, 4 * scale);
  ctx.fillStyle = wool;
  ctx.fillRect(x - 13 * scale, y - 9 * scale + bob, 26 * scale, 18 * scale);
  ctx.fillStyle = face;
  ctx.fillRect(x + 8 * scale * facing, y - 5 * scale + bob, 7 * scale, 9 * scale);
  ctx.fillRect(x - 9 * scale, y + 8 * scale + bob, 3 * scale, 7 * scale);
  ctx.fillRect(x - 1 * scale, y + 8 * scale + bob, 3 * scale, 7 * scale);
  ctx.fillRect(x + 6 * scale, y + 8 * scale + bob, 3 * scale, 7 * scale);
}

function drawGoatSprite(x, y, walkCycle, facing = 1, scale = 1, breed = "cafe") {
  const bob = Math.sin(walkCycle) * 1.2 * scale;
  const body = breed === "clara" ? "#e6dfd1" : "#c5a586";
  const horn = "#8b6f4f";
  ctx.fillStyle = "rgba(0,0,0,0.18)";
  ctx.fillRect(x - 12 * scale, y + 9 * scale, 24 * scale, 4 * scale);
  ctx.fillStyle = body;
  ctx.fillRect(x - 12 * scale, y - 8 * scale + bob, 24 * scale, 16 * scale);
  ctx.fillRect(x + 6 * scale * facing, y - 5 * scale + bob, 8 * scale, 8 * scale);
  ctx.fillStyle = horn;
  ctx.fillRect(x + 7 * scale * facing, y - 9 * scale + bob, 2 * scale, 4 * scale);
  ctx.fillRect(x + 11 * scale * facing, y - 9 * scale + bob, 2 * scale, 4 * scale);
  ctx.fillRect(x - 8 * scale, y + 8 * scale + bob, 3 * scale, 7 * scale);
  ctx.fillRect(x - 1 * scale, y + 8 * scale + bob, 3 * scale, 7 * scale);
  ctx.fillRect(x + 6 * scale, y + 8 * scale + bob, 3 * scale, 7 * scale);
}

function drawPigSprite(x, y, walkCycle, facing = 1, scale = 1, breed = "rosado") {
  const bob = Math.sin(walkCycle) * 1.1 * scale;
  const body = breed === "manchado" ? "#f3b7b4" : "#f1a6b1";
  const spot = "#d98993";
  ctx.fillStyle = "rgba(0,0,0,0.18)";
  ctx.fillRect(x - 13 * scale, y + 10 * scale, 26 * scale, 4 * scale);
  ctx.fillStyle = body;
  ctx.fillRect(x - 13 * scale, y - 8 * scale + bob, 26 * scale, 16 * scale);
  ctx.fillRect(x + 6 * scale * facing, y - 4 * scale + bob, 8 * scale, 8 * scale);
  if (breed === "manchado") {
    ctx.fillStyle = spot;
    ctx.fillRect(x - 4 * scale, y - 4 * scale + bob, 5 * scale, 4 * scale);
    ctx.fillRect(x + 3 * scale, y + 1 * scale + bob, 4 * scale, 3 * scale);
  }
  ctx.fillStyle = "#d07e8a";
  ctx.fillRect(x + 11 * scale * facing, y - 1 * scale + bob, 3 * scale, 3 * scale);
  ctx.fillRect(x - 8 * scale, y + 8 * scale + bob, 3 * scale, 7 * scale);
  ctx.fillRect(x - 1 * scale, y + 8 * scale + bob, 3 * scale, 7 * scale);
  ctx.fillRect(x + 6 * scale, y + 8 * scale + bob, 3 * scale, 7 * scale);
}

function drawHorseSprite(x, y, walkCycle, facing = 1, scale = 1) {
  const bob = Math.sin(walkCycle) * 1.2 * scale;
  const legSwing = Math.sin(walkCycle) * 2 * scale;
  ctx.fillStyle = "rgba(0,0,0,0.18)";
  ctx.fillRect(x - 16 * scale, y + 13 * scale, 32 * scale, 4 * scale);
  ctx.fillStyle = "#9b6238";
  ctx.fillRect(x - 16 * scale, y - 3 * scale + bob, 32 * scale, 18 * scale);
  ctx.fillStyle = "#b97a49";
  ctx.fillRect(x - 8 * scale, y - 7 * scale + bob, 18 * scale, 7 * scale);
  ctx.fillStyle = "#60361e";
  ctx.fillRect(x + 9 * scale * facing, y - 12 * scale + bob, 8 * scale, 15 * scale);
  ctx.fillRect(x + 13 * scale * facing, y - 15 * scale + bob, 4 * scale, 6 * scale);
  ctx.fillRect(x - 12 * scale, y + 10 * scale + bob, 4 * scale, 8 * scale + legSwing * 0.22);
  ctx.fillRect(x - 2 * scale, y + 10 * scale + bob, 4 * scale, 8 * scale - legSwing * 0.22);
  ctx.fillRect(x + 6 * scale, y + 10 * scale + bob, 4 * scale, 8 * scale + legSwing * 0.22);
  ctx.fillRect(x + 14 * scale, y + 10 * scale + bob, 4 * scale, 8 * scale - legSwing * 0.22);
  ctx.fillStyle = "#3b2417";
  ctx.fillRect(x + 12 * scale * facing, y - 6 * scale + bob, 2 * scale, 2 * scale);
}

function drawBarnAnimals() {
  const placements = [
    { x: 5.6, y: 8.7, type: "chicken" },
    { x: 7.8, y: 8.9, type: "duck" },
    { x: 10.1, y: 9.1, type: "sheep" },
    { x: 12.7, y: 8.9, type: "goat" },
    { x: 15.3, y: 8.9, type: "pig" },
    { x: 17.6, y: 9.0, type: "cow" }
  ];

  placements.forEach((spot, index) => {
    const pool = state.animals.filter((animal) => animal.type === spot.type);
    const source = pool[index % Math.max(1, pool.length)];
    const walkCycle = source ? source.walkCycle : performance.now() / 350;
    const facing = source && source.dirX < 0 ? -1 : 1;
    const px = spot.x * TILE_SIZE;
    const py = spot.y * TILE_SIZE;
    const breed = source ? source.breed : null;

    if (spot.type === "cow") drawCowSprite(px, py, walkCycle, facing, 0.82, breed);
    if (spot.type === "pig") drawPigSprite(px, py, walkCycle, facing, 0.82, breed);
    if (spot.type === "goat") drawGoatSprite(px, py, walkCycle, facing, 0.82, breed);
    if (spot.type === "sheep") drawSheepSprite(px, py, walkCycle, facing, 0.82, breed);
    if (spot.type === "duck") drawDuckSprite(px, py, walkCycle, facing, 0.88, breed);
    if (spot.type === "chicken") drawChickenSprite(px, py, walkCycle, facing, 0.9, breed);
  });
}

function drawAnimals() {
  if (state.scene !== "farm") return;
  state.animals.forEach((animal) => {
    const facing = animal.dirX >= 0 ? 1 : -1;
    if (animal.type === "cow") drawCowSprite(animal.x, animal.y, animal.walkCycle, facing, 1, animal.breed);
    if (animal.type === "pig") drawPigSprite(animal.x, animal.y, animal.walkCycle, facing, 1, animal.breed);
    if (animal.type === "goat") drawGoatSprite(animal.x, animal.y, animal.walkCycle, facing, 1, animal.breed);
    if (animal.type === "sheep") drawSheepSprite(animal.x, animal.y, animal.walkCycle, facing, 1, animal.breed);
    if (animal.type === "duck") drawDuckSprite(animal.x, animal.y, animal.walkCycle, facing, 1, animal.breed);
    if (animal.type === "chicken") drawChickenSprite(animal.x, animal.y, animal.walkCycle, facing, 1, animal.breed);
  });
}

function addUiHitbox(x, y, w, h, action) {
  uiHitboxes.push({ x, y, w, h, action });
}

function clearUiHitboxes() {
  uiHitboxes.length = 0;
}

function drawPanelFrame(x, y, w, h, title, subtitle) {
  ctx.fillStyle = "rgba(23, 18, 24, 0.9)";
  ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = "#f0c270";
  ctx.lineWidth = 2;
  ctx.strokeRect(x, y, w, h);
  ctx.fillStyle = "#f7e7bf";
  ctx.font = "bold 16px Trebuchet MS";
  ctx.fillText(title, x + 12, y + 22);
  if (subtitle) {
    ctx.fillStyle = "#d8c7a1";
    ctx.font = "12px Trebuchet MS";
    ctx.fillText(subtitle, x + 12, y + 38);
  }
}

function drawPanelLines(x, y, lines, color = "#f7e7bf") {
  ctx.fillStyle = color;
  ctx.font = "12px Trebuchet MS";
  lines.forEach((line, index) => {
    ctx.fillText(line, x, y + index * 16);
  });
}

function drawInventoryIcon(type, x, y) {
  ctx.fillStyle = "#4b3425";
  ctx.fillRect(x, y, 14, 14);

  const fill = (dx, dy, w, h, color) => {
    ctx.fillStyle = color;
    ctx.fillRect(x + dx, y + dy, w, h);
  };

  switch (type) {
    case "trigo":
      fill(6, 2, 2, 10, "#f0d672");
      fill(3, 4, 2, 2, "#f0d672");
      fill(9, 5, 2, 2, "#f0d672");
      break;
    case "seed_trigo":
      fill(5, 5, 4, 3, "#d9bf74");
      break;
    case "maiz":
      fill(5, 2, 4, 9, "#d8c24f");
      fill(3, 4, 2, 7, "#4b8b37");
      fill(9, 4, 2, 7, "#4b8b37");
      break;
    case "seed_maiz":
      fill(5, 4, 4, 4, "#cfae43");
      break;
    case "tomate":
      fill(4, 4, 6, 6, "#df5b53");
      fill(6, 2, 2, 2, "#4b8b37");
      break;
    case "seed_tomate":
      fill(5, 5, 4, 3, "#b98358");
      break;
    case "calabaza":
      fill(3, 4, 8, 7, "#d98535");
      fill(6, 2, 2, 2, "#4b8b37");
      break;
    case "seed_calabaza":
      fill(4, 5, 6, 3, "#c28b46");
      break;
    case "wood":
      fill(4, 3, 6, 8, "#8b5a34");
      break;
    case "stone":
      fill(3, 4, 8, 6, "#8a8f96");
      break;
    case "iron":
      fill(3, 4, 8, 6, "#8d7d74");
      fill(5, 5, 4, 2, "#d69458");
      break;
    case "crystal":
      fill(5, 2, 4, 10, "#8ce5f0");
      fill(3, 5, 8, 4, "#d9fbff");
      break;
    case "eggs":
      fill(4, 3, 3, 5, "#fff4dd");
      fill(8, 4, 3, 5, "#fff4dd");
      break;
    case "milk":
      fill(4, 3, 6, 8, "#f1f7ff");
      fill(5, 2, 4, 2, "#8ec8ff");
      break;
    case "wool":
      fill(3, 4, 8, 7, "#f2efea");
      fill(4, 3, 6, 2, "#d8d6d1");
      break;
    case "truffles":
      fill(4, 5, 3, 3, "#6b4b35");
      fill(7, 4, 3, 4, "#7d563b");
      fill(5, 8, 4, 2, "#8c6344");
      break;
    case "horse":
      fill(3, 4, 8, 6, "#9b6238");
      fill(9, 2, 2, 4, "#60361e");
      break;
    case "axe":
      fill(6, 2, 2, 10, "#8b5a34");
      fill(4, 3, 6, 3, "#c9d0da");
      fill(3, 5, 3, 3, "#9ea7b2");
      break;
    case "pickaxe":
      fill(6, 2, 2, 10, "#8b5a34");
      fill(3, 3, 8, 2, "#8ea0b8");
      fill(2, 5, 3, 2, "#71849c");
      fill(9, 5, 2, 2, "#b7c7da");
      break;
    case "sword":
      fill(6, 2, 2, 8, "#d5dde8");
      fill(4, 9, 6, 2, "#c8924c");
      fill(5, 11, 4, 2, "#8b5a34");
      break;
    case "chicken":
      fill(3, 5, 8, 6, "#f9e39d");
      fill(8, 3, 2, 2, "#d34848");
      fill(10, 6, 2, 2, "#cf9f4b");
      break;
    case "cow":
      fill(2, 4, 10, 6, "#fff4dd");
      fill(4, 5, 3, 2, "#7b5230");
      fill(8, 7, 3, 2, "#7b5230");
      break;
    case "duck":
      fill(3, 5, 8, 5, "#f1f6e7");
      fill(8, 3, 3, 3, "#4f8a60");
      fill(10, 6, 2, 2, "#dba251");
      break;
    case "sheep":
      fill(2, 4, 10, 7, "#f2efea");
      fill(8, 5, 3, 3, "#7d6758");
      break;
    case "goat":
      fill(2, 4, 10, 7, "#dccbb6");
      fill(9, 4, 2, 2, "#8b6f4f");
      fill(9, 7, 2, 2, "#7b6148");
      break;
    case "pig":
      fill(2, 4, 10, 7, "#f1a6b1");
      fill(9, 6, 2, 2, "#d07e8a");
      break;
    case "hay":
      fill(2, 5, 10, 5, "#d9b773");
      fill(4, 3, 6, 2, "#f2d48d");
      break;
    default:
      fill(4, 4, 6, 6, "#f7e7bf");
      break;
  }
}

function drawInventoryGrid(x, y, width, items) {
  const columns = 2;
  const colWidth = Math.floor(width / columns);
  ctx.font = "12px Trebuchet MS";
  items.forEach((item, index) => {
    const col = index % columns;
    const row = Math.floor(index / columns);
    const rowX = x + col * colWidth;
    const rowY = y + row * 18;
    drawInventoryIcon(item.icon, rowX, rowY - 10);
    ctx.fillStyle = "#f7e7bf";
    ctx.fillText(item.label, rowX + 20, rowY + 1);
  });
}

function drawActionTile(x, y, w, h, labelTop, labelBottom, color, onClick) {
  ctx.fillStyle = "#5b4130";
  ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = "rgba(255, 234, 191, 0.16)";
  ctx.strokeRect(x, y, w, h);
  ctx.fillStyle = color;
  ctx.fillRect(x + 10, y + 10, w - 20, 18);
  ctx.fillStyle = "#f7e7bf";
  ctx.font = "11px Trebuchet MS";
  ctx.fillText(labelTop, x + 8, y + h - 22);
  ctx.fillText(labelBottom, x + 8, y + h - 8);
  if (onClick) {
    addUiHitbox(x, y, w, h, onClick);
  }
}

function drawBarnExteriorDetails() {
  const x = barnArea.x * TILE_SIZE;
  const y = barnArea.y * TILE_SIZE;
  const w = barnArea.w * TILE_SIZE;
  const h = barnArea.h * TILE_SIZE;

  ctx.fillStyle = "#d9b773";
  ctx.fillRect(x - 26, y + h - 22, 18, 12);
  ctx.fillRect(x - 12, y + h - 16, 18, 12);
  ctx.fillRect(x + w + 8, y + h - 22, 18, 12);
  ctx.fillRect(x + w + 22, y + h - 16, 18, 12);

  ctx.strokeStyle = "#7c5630";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x - 14, y + h - 8);
  ctx.lineTo(x - 14, y + h + 18);
  ctx.moveTo(x + w + 22, y + h - 8);
  ctx.lineTo(x + w + 22, y + h + 18);
  ctx.stroke();
}

function handleCanvasUiClick(worldX, worldY) {
  const hitbox = uiHitboxes.find(
    (item) =>
      worldX >= item.x &&
      worldX <= item.x + item.w &&
      worldY >= item.y &&
      worldY <= item.y + item.h
  );
  if (!hitbox) {
    return false;
  }
  hitbox.action();
  return true;
}

function drawInterior() {
  const scene = interiorConfig[state.scene];
  const width = scene.cols * TILE_SIZE;
  const height = scene.rows * TILE_SIZE;
  clearUiHitboxes();
  ctx.fillStyle = scene.wall;
  ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = scene.floor;
  ctx.fillRect(TILE_SIZE, TILE_SIZE, width - TILE_SIZE * 2, height - TILE_SIZE * 2);
  ctx.fillStyle = "rgba(255,255,255,0.04)";
  ctx.fillRect(TILE_SIZE, TILE_SIZE, width - TILE_SIZE * 2, 10);
  ctx.fillStyle = "rgba(0,0,0,0.16)";
  ctx.fillRect(TILE_SIZE, height - TILE_SIZE - 10, width - TILE_SIZE * 2, 10);

  for (let row = 1; row < scene.rows - 1; row += 1) {
    for (let col = 1; col < scene.cols - 1; col += 1) {
      ctx.fillStyle = (col + row) % 2 === 0 ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)";
      ctx.fillRect(col * TILE_SIZE, row * TILE_SIZE, TILE_SIZE, TILE_SIZE);
    }
  }

  ctx.fillStyle = "#5a3724";
  ctx.fillRect(scene.exitArea.x * TILE_SIZE, scene.exitArea.y * TILE_SIZE, scene.exitArea.w * TILE_SIZE, scene.exitArea.h * TILE_SIZE);

  if (state.scene === "cabin") {
    const bed = interiorConfig.cabin.bedArea;
    ctx.fillStyle = "#6f4831";
    ctx.fillRect(3 * TILE_SIZE, 2 * TILE_SIZE, 4 * TILE_SIZE, 3 * TILE_SIZE);
    ctx.fillStyle = "#7f5d40";
    ctx.fillRect(4 * TILE_SIZE, 6 * TILE_SIZE, 2 * TILE_SIZE, 2 * TILE_SIZE);
    ctx.fillStyle = "#d9b773";
    ctx.fillRect(4 * TILE_SIZE + 8, 6 * TILE_SIZE + 8, TILE_SIZE + 8, TILE_SIZE - 4);
    ctx.fillStyle = "#7e4f37";
    ctx.fillRect(bed.x * TILE_SIZE, bed.y * TILE_SIZE, bed.w * TILE_SIZE, bed.h * TILE_SIZE);
    ctx.fillStyle = "#f0dfbf";
    ctx.fillRect(bed.x * TILE_SIZE + 4, bed.y * TILE_SIZE + 4, bed.w * TILE_SIZE - 8, 18);
    ctx.fillStyle = "#bc5748";
    ctx.fillRect(bed.x * TILE_SIZE + 4, bed.y * TILE_SIZE + 24, bed.w * TILE_SIZE - 8, 22);
    ctx.fillStyle = "#d7cda1";
    ctx.fillRect(4 * TILE_SIZE, 2 * TILE_SIZE, 3 * TILE_SIZE, 2 * TILE_SIZE);
    drawWindow(2 * TILE_SIZE, 2 * TILE_SIZE, 22, 24, {
      frame: "#70482f",
      glass: "#aed8ea",
      shine: "#f0fbff"
    });
    drawCabinUi();
  }

  if (state.scene === "market") {
    ctx.fillStyle = "#6f4726";
    ctx.fillRect(3 * TILE_SIZE, 2 * TILE_SIZE, 16 * TILE_SIZE, 2 * TILE_SIZE);
    ctx.fillStyle = "#d6b983";
    ctx.fillRect(4 * TILE_SIZE, 2 * TILE_SIZE + 4, 14 * TILE_SIZE, 8);
    ctx.fillStyle = "#7d5330";
    ctx.fillRect(3 * TILE_SIZE, 5 * TILE_SIZE, 4 * TILE_SIZE, TILE_SIZE);
    ctx.fillRect(15 * TILE_SIZE, 5 * TILE_SIZE, 4 * TILE_SIZE, TILE_SIZE);
    drawWindow(2 * TILE_SIZE, 2 * TILE_SIZE, 22, 24, {
      frame: "#6f4726",
      glass: "#b7db98",
      shine: "#ecffe4"
    });
    drawWindow(19 * TILE_SIZE - 22, 2 * TILE_SIZE, 22, 24, {
      frame: "#6f4726",
      glass: "#b7db98",
      shine: "#ecffe4"
    });
    drawMarketUi();
  }

  if (state.scene === "smith") {
    ctx.fillStyle = "#472d1b";
    ctx.fillRect(13 * TILE_SIZE, 5 * TILE_SIZE, 4 * TILE_SIZE, 3 * TILE_SIZE);
    ctx.fillStyle = "#ff8b52";
    ctx.fillRect(14 * TILE_SIZE, 6 * TILE_SIZE, 2 * TILE_SIZE, TILE_SIZE);
    ctx.fillStyle = "#7a512d";
    ctx.fillRect(5 * TILE_SIZE, 6 * TILE_SIZE, 3 * TILE_SIZE, 2 * TILE_SIZE);
    ctx.fillStyle = "#5e4538";
    ctx.fillRect(3 * TILE_SIZE, 3 * TILE_SIZE, 3 * TILE_SIZE, TILE_SIZE);
    ctx.fillRect(17 * TILE_SIZE, 3 * TILE_SIZE, 2 * TILE_SIZE, TILE_SIZE);
    drawWindow(2 * TILE_SIZE, 2 * TILE_SIZE, 22, 24, {
      frame: "#574136",
      glass: "#c3d3df",
      shine: "#f4fbff"
    });
    drawSmithUi();
  }

  if (state.scene === "barn") {
    ctx.fillStyle = "#8a5d34";
    ctx.fillRect(3 * TILE_SIZE, 3 * TILE_SIZE, 4 * TILE_SIZE, 3 * TILE_SIZE);
    ctx.fillRect(13 * TILE_SIZE, 3 * TILE_SIZE, 4 * TILE_SIZE, 3 * TILE_SIZE);
    ctx.fillStyle = "#6f4728";
    ctx.fillRect(3 * TILE_SIZE, 6 * TILE_SIZE, 4 * TILE_SIZE, 2);
    ctx.fillRect(13 * TILE_SIZE, 6 * TILE_SIZE, 4 * TILE_SIZE, 2);
    ctx.fillStyle = "#d9b773";
    ctx.fillRect(5 * TILE_SIZE, 8 * TILE_SIZE, TILE_SIZE + 10, 18);
    ctx.fillRect(14 * TILE_SIZE, 8 * TILE_SIZE, TILE_SIZE + 10, 18);
    drawWindow(2 * TILE_SIZE, 2 * TILE_SIZE, 22, 24, {
      frame: "#70482f",
      glass: "#f7e7bf",
      shine: "#fff7de"
    });
    drawWindow(18 * TILE_SIZE - 22, 2 * TILE_SIZE, 22, 24, {
      frame: "#70482f",
      glass: "#f7e7bf",
      shine: "#fff7de"
    });
    drawBarnAnimals();
    drawBarnUi();
  }

  if (state.scene === "mine") {
    ctx.fillStyle = "#2d3137";
    for (let row = 2; row < scene.rows - 2; row += 3) {
      ctx.fillRect(2 * TILE_SIZE, row * TILE_SIZE, (scene.cols - 4) * TILE_SIZE, 2);
    }
    drawMineRocks();
    drawMineUi();
  }
}

function drawBarnUi() {
  drawPanelFrame(24, 42, 328, 176, "Granero", "Animales, razas y productos");
  drawPanelLines(52, 78, [
    `Gallinas ${countAnimals("chicken")}`,
    `Patos ${countAnimals("duck")}`,
    `Ovejas ${countAnimals("sheep")}`,
    `Cabras ${countAnimals("goat")}`,
    `Cerdos ${countAnimals("pig")}`,
    `Vacas ${countAnimals("cow")}`,
    `Huevos ${state.inventory.goods.eggs}`,
    `Leche ${state.inventory.goods.milk}`,
    `Lana ${state.inventory.goods.wool}`,
    `Trufas ${state.inventory.goods.truffles}`
  ]);

  ctx.fillStyle = "#5b4130";
  ctx.fillRect(368, 48, 250, 156);
  ctx.strokeStyle = "#f0c270";
  ctx.lineWidth = 2;
  ctx.strokeRect(368, 48, 250, 156);
  ctx.fillStyle = "#f7e7bf";
  ctx.font = "bold 15px Trebuchet MS";
  ctx.fillText("Animales", 382, 70);

  const cards = [
    ["chicken", "Gallina"], ["duck", "Pato"], ["sheep", "Oveja"],
    ["goat", "Cabra"], ["pig", "Cerdo"], ["cow", "Vaca"],
    ["wool", "Lana"], ["truffles", "Trufa"], ["milk", "Leche"]
  ];
  cards.forEach(([icon, label], index) => {
    const col = index % 3;
    const row = Math.floor(index / 3);
    const x = 384 + col * 72;
    const y = 84 + row * 38;
    drawInventoryIcon(icon, x, y);
    ctx.font = "12px Trebuchet MS";
    ctx.fillText(label, x + 20, y + 12);
  });
}

function drawCabinUi() {
  drawPanelFrame(42, 46, 470, 184, "Estado", "Inventario y recursos");
  drawInventoryGrid(56, 82, 430, getInventoryItems());

  drawPanelFrame(42, 242, 300, 104, "Noche", "Vida de la granja");
  drawPanelLines(56, 268, [
    `Vida ${state.playerHealth}/100`,
    `Monedas ${state.coins}`,
    `Tiempo ${getDayLabel()}`,
    getNightStatusText(),
    state.phase === "night" ? "Despues ve a la cama" : "Trabaja antes de dormir"
  ]);

  const bed = interiorConfig.cabin.bedArea;
  const bedX = bed.x * TILE_SIZE;
  const bedY = bed.y * TILE_SIZE;
  addUiHitbox(bedX, bedY, bed.w * TILE_SIZE, bed.h * TILE_SIZE, startSleep);

  drawActionTile(358, 268, 146, 48, "Dormir", `${SLEEP_DURATION}s en la cama`, "#bc5748", startSleep);
}

function drawMarketUi() {
  drawPanelFrame(24, 42, 334, 202, "Mercado", "Compra semillas y animales");
  const items = [
    { key: "seed-trigo", top: "Trigo", bottom: `${storeConfig["seed-trigo"].cost} monedas`, color: "#f0d672" },
    { key: "seed-maiz", top: "Maiz", bottom: `${storeConfig["seed-maiz"].cost} monedas`, color: "#d8c24f" },
    { key: "seed-tomate", top: "Tomate", bottom: `${storeConfig["seed-tomate"].cost} monedas`, color: "#df5b53" },
    { key: "seed-calabaza", top: "Calabaza", bottom: `${storeConfig["seed-calabaza"].cost} monedas`, color: "#d98535" },
    { key: "chicken", top: "Gallina", bottom: `${storeConfig.chicken.cost} monedas`, color: "#f9e39d" },
    { key: "duck", top: "Pato", bottom: `${storeConfig.duck.cost} monedas`, color: "#f3f4e5" },
    { key: "sheep", top: "Oveja", bottom: `${storeConfig.sheep.cost} monedas`, color: "#ece8e2" },
    { key: "goat", top: "Cabra", bottom: `${storeConfig.goat.cost} monedas`, color: "#d7c6b1" },
    { key: "pig", top: "Cerdo", bottom: `${storeConfig.pig.cost} monedas`, color: "#f0a8b4" },
    { key: "cow", top: "Vaca", bottom: `${storeConfig.cow.cost} monedas`, color: "#fff4dd" }
  ];

  items.forEach((item, index) => {
    const col = index % 5;
    const row = Math.floor(index / 5);
    drawActionTile(
      38 + col * 58,
      76 + row * 62,
      50,
      54,
      item.top,
      item.bottom,
      item.color,
      () => buyItem(item.key)
    );
  });

  drawActionTile(38, 202, 250, 32, "Vender", "cosecha, lana y productos", "#8ddf8b", sellStoreInventory);

  drawPanelFrame(382, 42, 274, 208, "Estado", "Lo que llevas");
  drawInventoryGrid(396, 82, 236, getInventoryItems());
}

function drawSmithUi() {
  drawPanelFrame(26, 40, 166, 198, "Herreria", "Mejoras");
  [
    { key: "axe", label: "Hacha", color: "#c9d0da" },
    { key: "pickaxe", label: "Pico", color: "#8ea0b8" },
    { key: "sword", label: "Espada", color: "#d5dde8" },
    { key: "watering", label: "Regadera", color: "#dca95c" }
  ].forEach((tool, index) => {
    drawActionTile(
      40,
      74 + index * 38,
      138,
      30,
      tool.label,
      `${getUpgradeCost(tool.key)} monedas`,
      tool.color,
      () => upgradeTool(tool.key)
    );
  });

  drawPanelFrame(206, 40, 188, 198, "Taller", "Armas y reparacion");
  [
    { key: "iron_sword", label: "Esp. hierro", color: "#c9d0da" },
    { key: "crystal_sword", label: "Esp. cristal", color: "#8ce5f0" },
    { key: "repair_all", label: "Reparar", color: "#dca95c" }
  ].forEach((recipe, index) => {
    drawActionTile(
      220,
      80 + index * 46,
      160,
      38,
      recipe.label,
      craftRecipes[recipe.key].label,
      recipe.color,
      () => craftRecipe(recipe.key)
    );
  });

  drawPanelFrame(406, 40, 250, 198, "Herramientas", "Durabilidad");
  drawPanelLines(420, 70, getToolLines());

  if (isNearSmithTable()) {
    drawPanelFrame(330, 250, 250, 96, "Mesa de crafteo", "Click en un arma o reparacion");
    ["#c9d0da", "#8ea0b8", "#d5dde8", "#dca95c"].forEach((color, index) => {
      const bx = 346 + index * 56;
      const by = 286;
      ctx.fillStyle = "#5b4130";
      ctx.fillRect(bx, by, 36, 36);
      ctx.fillStyle = color;
      ctx.fillRect(bx + 10, by + 8, 16, 20);
    });
  }
}

function drawMineUi() {
  const remaining = getRemainingMineRocks();
  drawPanelFrame(34, 40, 246, 112, "Mina", `Nivel ${state.mineLevel} de ${MAX_MINE_LEVELS}`);
  drawPanelLines(50, 74, [
    `Minerales restantes ${remaining}`,
    remaining > 0 ? "Debes minar todo para bajar" : "La bajada esta lista",
    remaining > 0 ? "Sigue usando el pico" : "Acercate a la escalera y toca E"
  ]);

  const stairs = interiorConfig.mine.stairsArea;
  const sx = stairs.x * TILE_SIZE;
  const sy = stairs.y * TILE_SIZE;
  const enabled = remaining === 0;

  ctx.fillStyle = enabled ? "#8c7751" : "#4f5056";
  ctx.fillRect(sx, sy, stairs.w * TILE_SIZE, stairs.h * TILE_SIZE);
  ctx.fillStyle = enabled ? "#cdb989" : "#72757d";
  for (let step = 0; step < 4; step += 1) {
    ctx.fillRect(sx + 6, sy + 8 + step * 12, stairs.w * TILE_SIZE - 12, 4);
  }
  ctx.strokeStyle = enabled ? "#f0d48b" : "#888d98";
  ctx.lineWidth = 2;
  ctx.strokeRect(sx + 2, sy + 2, stairs.w * TILE_SIZE - 4, stairs.h * TILE_SIZE - 4);

  if (enabled) {
    drawActionTile(34, 162, 170, 36, "Bajar", `Nivel ${Math.min(MAX_MINE_LEVELS, state.mineLevel + 1)}`, "#b69762", advanceMineLevel);
    addUiHitbox(sx, sy, stairs.w * TILE_SIZE, stairs.h * TILE_SIZE, advanceMineLevel);
  } else {
    drawActionTile(34, 162, 170, 36, "Bloqueado", "Mina todo el nivel", "#6f6f78", null);
  }
}

function drawMineRocks() {
  state.mineRocks.forEach((rock) => {
    if (rock.broken) return;
    const x = rock.x * TILE_SIZE + TILE_SIZE / 2;
    const y = rock.y * TILE_SIZE + TILE_SIZE / 2;
    const shake = rock.shakeTimer > 0 ? Math.sin(rock.shakeTimer * 60) * 2 : 0;
    const bodyColor = rock.type === "hierro" ? "#8d7d74" : rock.type === "cristal" ? "#8ce5f0" : "#8a8f96";
    const detailColor = rock.type === "hierro" ? "#d69458" : rock.type === "cristal" ? "#d9fbff" : "#c8cdd4";
    ctx.fillStyle = "rgba(0,0,0,0.18)";
    ctx.fillRect(x - 10, y + 8, 20, 4);
    ctx.fillStyle = bodyColor;
    ctx.fillRect(x - 10 + shake, y - 8, 20, 16);
    ctx.fillStyle = detailColor;
    ctx.fillRect(x - 3 + shake, y - 4, 6, 6);
  });
}

function drawEnemies() {
  if (state.scene !== "farm") return;
  state.enemies.forEach((enemy) => {
    const walk = Math.sin(enemy.walkCycle) * 2;
    const dirX = player.x >= enemy.x ? 1 : -1;
    ctx.fillStyle = "rgba(0,0,0,0.22)";
    ctx.fillRect(enemy.x - 10, enemy.y + 10, 20, 4);
    ctx.fillStyle = "#8b2746";
    ctx.fillRect(enemy.x - 10, enemy.y - 12 + walk * 0.2, 20, 24);
    ctx.fillStyle = "#d6b090";
    ctx.fillRect(enemy.x - 6, enemy.y - 18 + walk * 0.2, 12, 8);
    ctx.fillStyle = "#4d1730";
    ctx.fillRect(enemy.x - 7 + dirX * 3, enemy.y - 8 + walk * 0.2, 6, 10);
    ctx.fillRect(enemy.x + 1, enemy.y - 8 - walk * 0.2, 6, 10);
    ctx.fillStyle = "#321827";
    ctx.fillRect(enemy.x - 12, enemy.y - 24, 24, 4);
    ctx.fillStyle = "#d65757";
    ctx.fillRect(enemy.x - 12, enemy.y - 24, 24 * (enemy.health / enemy.maxHealth), 4);
  });
}

function drawMountedHorse() {
  drawHorseSprite(player.x, player.y + 4, horse.walkCycle, player.facingX >= 0 ? 1 : -1, 1);
}

function drawPlayer() {
  const walk = player.isMoving ? Math.sin(player.walkCycle) * 2.2 : 0;
  const armSwing = player.isMoving ? Math.sin(player.walkCycle) * 4 : 0;
  const dirX = player.facingX >= 0 ? 1 : -1;
  const toolReach = player.toolSwing > 0 ? 16 + player.toolSwing * 28 : 0;
  let toolColor = "#dca95c";
  let toolWidth = 14;

  if (state.activeTool === "axe") {
    toolColor = "#c9d0da";
    toolWidth = 18;
  } else if (state.activeTool === "pickaxe") {
    toolColor = "#8ea0b8";
    toolWidth = 18;
  } else if (state.activeTool === "sword" || state.phase === "night") {
    toolColor = "#d5dde8";
    toolWidth = 20;
  }

  if (state.scene === "farm" && state.horseMounted) {
    drawMountedHorse();
  }

  ctx.fillStyle = "rgba(0,0,0,0.2)";
  ctx.fillRect(player.x - 11, player.y + 12, 22, 4);
  ctx.fillStyle = "#21405f";
  ctx.fillRect(player.x - 9, player.y - 11 + walk * 0.12, 18, 22);
  ctx.fillStyle = "#2f5c84";
  ctx.fillRect(player.x - 8, player.y - 14 + walk * 0.1, 16, 8);
  ctx.fillStyle = "#33417a";
  ctx.fillRect(player.x - 13, player.y - 8 - armSwing * 0.15, 5, 12);
  ctx.fillRect(player.x + 8, player.y - 8 + armSwing * 0.15, 5, 12);
  ctx.fillStyle = "#f0c49a";
  ctx.fillRect(player.x - 6, player.y - 22 + walk * 0.1, 12, 11);
  ctx.fillStyle = "#2b1a14";
  ctx.fillRect(player.x - 7, player.y - 26 + walk * 0.1, 14, 5);
  ctx.fillStyle = "#5f3824";
  ctx.fillRect(player.x - 7, player.y - 23 + walk * 0.1, 14, 3);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(player.x - 4 + dirX, player.y - 18 + walk * 0.1, 2, 2);
  ctx.fillRect(player.x + 2 + dirX, player.y - 18 + walk * 0.1, 2, 2);
  ctx.fillStyle = "#2b1a14";
  ctx.fillRect(player.x - 4 + dirX, player.y - 17 + walk * 0.1, 1, 1);
  ctx.fillRect(player.x + 3 + dirX, player.y - 17 + walk * 0.1, 1, 1);
  ctx.fillStyle = "#aa5f49";
  ctx.fillRect(player.x - 2, player.y - 14 + walk * 0.1, 4, 1);
  ctx.fillStyle = "#e6e0cf";
  ctx.fillRect(player.x - 4, player.y - 6, 8, 3);
  ctx.fillStyle = "#171f3f";
  ctx.fillRect(player.x - 8, player.y + 10 + walk * 0.15, 4, 9 - armSwing * 0.2);
  ctx.fillRect(player.x + 4, player.y + 10 - walk * 0.15, 4, 9 + armSwing * 0.2);
  ctx.fillStyle = "#6a4a2b";
  ctx.fillRect(player.x - 11, player.y - 2 - armSwing * 0.15, 2, 12);
  ctx.fillRect(player.x + 9, player.y - 2 + armSwing * 0.15, 2, 12);

  if (player.toolSwing > 0) {
    ctx.fillStyle = "#785433";
    ctx.fillRect(player.x + player.facingX * (toolReach - 8) - 1 + dirX * 2, player.y + player.facingY * (toolReach - 8) - 1, 10, 2);
    ctx.fillStyle = toolColor;
    ctx.fillRect(player.x + player.facingX * toolReach - 2 + dirX * 2, player.y + player.facingY * toolReach - 2, toolWidth, 4);
  }
}

function drawHighlights() {
  if (state.phase === "night" && state.activeTool !== "sword") return;

  if (state.activeTool === "axe" && state.scene === "farm") {
    const hovered = mouse.inside ? getTreeFromPoint(mouse.x, mouse.y) : null;
    const tree = hovered && !hovered.stump && playerCanReachTile(hovered.x, hovered.y) ? hovered : nearestTreeInFront();
    if (tree && !tree.stump) {
      ctx.strokeStyle = "#ffe5a2";
      ctx.lineWidth = 3;
      ctx.strokeRect(tree.x * TILE_SIZE + 2, tree.y * TILE_SIZE + 2, TILE_SIZE - 4, TILE_SIZE - 4);
    }
    return;
  }

  if (state.activeTool === "pickaxe" && (state.scene === "mine" || state.scene === "farm")) {
    const hovered = mouse.inside
      ? (state.scene === "mine" ? getMineRockFromPoint(mouse.x, mouse.y) : getSurfaceRockFromPoint(mouse.x, mouse.y))
      : null;
    const rock = hovered && playerCanReachTile(hovered.x, hovered.y)
      ? hovered
      : state.scene === "mine"
        ? nearestMineRockInFront()
        : nearestSurfaceRockInFront();
    if (rock) {
      ctx.strokeStyle = "#b7ddff";
      ctx.lineWidth = 3;
      ctx.strokeRect(rock.x * TILE_SIZE + 2, rock.y * TILE_SIZE + 2, TILE_SIZE - 4, TILE_SIZE - 4);
    }
    return;
  }

  if (state.scene === "farm") {
    const hovered = mouse.inside ? getPlotFromPoint(mouse.x, mouse.y) : null;
    const plot = hovered && playerCanReachTile(hovered.x, hovered.y, 58) ? hovered : nearestPlotInFront();
    if (plot) {
      ctx.strokeStyle = "#fff0a6";
      ctx.lineWidth = 3;
      ctx.strokeRect(plot.x * TILE_SIZE + 2, plot.y * TILE_SIZE + 2, TILE_SIZE - 4, TILE_SIZE - 4);
    }
  }
}

function drawSleepOverlay() {
  if (!state.sleeping) return;
  ctx.fillStyle = "rgba(15, 11, 18, 0.58)";
  ctx.fillRect(0, 0, dom.canvas.width, dom.canvas.height);
  ctx.fillStyle = "#f7e7bf";
  ctx.font = "28px Trebuchet MS";
  ctx.fillText(`Durmiendo... ${state.sleepTimer.toFixed(1)}s`, 40, 70);
}

function drawNightOverlay() {
  if (state.phase !== "night" || state.scene !== "farm") return;
  ctx.fillStyle = "rgba(33,24,63,0.35)";
  ctx.fillRect(0, 0, dom.canvas.width, dom.canvas.height);
}

function drawInteriorFrame() {
  if (state.scene === "farm") return;
  const viewport = getInteriorViewport();
  const frameX = viewport.offsetX;
  const frameY = viewport.offsetY;
  const width = viewport.drawWidth;
  const height = viewport.drawHeight;

  ctx.fillStyle = "rgba(255, 230, 184, 0.08)";
  ctx.fillRect(frameX - 10, frameY - 10, width + 20, height + 20);
  ctx.strokeStyle = "#f0c270";
  ctx.lineWidth = 4;
  ctx.strokeRect(frameX - 10, frameY - 10, width + 20, height + 20);
  ctx.strokeStyle = "rgba(255,255,255,0.12)";
  ctx.lineWidth = 2;
  ctx.strokeRect(frameX - 4, frameY - 4, width + 8, height + 8);
}

function renderFarm() {
  drawGround();
  drawSurfaceRocks();
  drawBushes();
  drawMineFacade();
  drawPen();
  drawBuilding(barnArea, {
    roof: "#873427",
    roofDark: "#6e281d",
    roofLight: "#b44b38",
    wall: "#ba6a3d",
    wallLight: "#d68a59",
    wallDark: "#94512e",
    trim: "#f3dfb0",
    door: "#5a2f1d",
    doorLight: "#8e5a3b",
    foundation: "#7d4930",
    window: "#f6ddb4",
    windowLight: "#fff4d8",
    sign: "#dfc18b",
    signDark: "#a38658",
    signText: "#4b240f",
    knob: "#f5df9b"
  }, "Granero");
  drawBarnExteriorDetails();
  drawBuilding(cabinArea, {
    roof: "#7b412c",
    roofDark: "#5f2d1d",
    roofLight: "#a85739",
    wall: "#c98d5c",
    wallLight: "#e0a674",
    wallDark: "#9c6a44",
    trim: "#714428",
    door: "#4e2818",
    doorLight: "#855339",
    foundation: "#744a33",
    window: "#aed8ea",
    windowLight: "#f0fbff",
    sign: "#f0d5a1",
    signDark: "#ae8757",
    signText: "#5a3117",
    knob: "#f2cf88"
  }, "Cabana");
  drawBuilding(marketArea, {
    roof: "#5d7e2f",
    roofDark: "#456220",
    roofLight: "#7fa544",
    wall: "#d8c27f",
    wallLight: "#ead89c",
    wallDark: "#b39c62",
    trim: "#73572a",
    door: "#61441a",
    doorLight: "#92703c",
    foundation: "#8a6a3f",
    window: "#b7db98",
    windowLight: "#ecffe4",
    sign: "#e5d58c",
    signDark: "#a69156",
    signText: "#4d3912",
    knob: "#fff0af"
  }, "Tienda");
  drawBuilding(smithArea, {
    roof: "#5c5f67",
    roofDark: "#474a52",
    roofLight: "#828792",
    wall: "#b98f74",
    wallLight: "#cca68d",
    wallDark: "#8c6a56",
    trim: "#5a4335",
    door: "#3a2419",
    doorLight: "#745548",
    foundation: "#6c5548",
    window: "#c3d3df",
    windowLight: "#f4fbff",
    sign: "#b8c0cc",
    signDark: "#818a96",
    signText: "#20242a",
    knob: "#d5dde8"
  }, "Herreria");
  drawPlots();
  drawTrees();
  drawHorse();
  drawAnimals();
  drawEnemies();
}

function renderWorld() {
  ctx.clearRect(0, 0, dom.canvas.width, dom.canvas.height);
  clearUiHitboxes();
  if (state.scene !== "farm") {
    ctx.fillStyle = "rgba(8, 7, 14, 0.82)";
    ctx.fillRect(0, 0, dom.canvas.width, dom.canvas.height);
  }
  ctx.save();
  if (state.scene === "farm") {
    ctx.translate(-camera.x, -camera.y);
    renderFarm();
  } else {
    const viewport = getInteriorViewport();
    ctx.translate(viewport.offsetX, viewport.offsetY);
    ctx.scale(viewport.scale, viewport.scale);
    drawInterior();
  }

  drawPlayer();
  drawHighlights();
  ctx.restore();
  drawInteriorFrame();
  drawNightOverlay();
  drawSleepOverlay();
}

function drawMinimapMarker(tileX, tileY, color, size = 4) {
  const scaleX = dom.minimap.width / MAP_COLS;
  const scaleY = dom.minimap.height / MAP_ROWS;
  mapCtx.fillStyle = color;
  mapCtx.fillRect(tileX * scaleX - size / 2, tileY * scaleY - size / 2, size, size);
}

function renderMinimap() {
  mapCtx.clearRect(0, 0, dom.minimap.width, dom.minimap.height);
  const season = getSeason();
  mapCtx.fillStyle = season.grass;
  mapCtx.fillRect(0, 0, dom.minimap.width, dom.minimap.height);

  const scaleX = dom.minimap.width / MAP_COLS;
  const scaleY = dom.minimap.height / MAP_ROWS;
  mapCtx.fillStyle = "#8c6239";
  mapCtx.fillRect(fieldOrigin.x * scaleX, fieldOrigin.y * scaleY, fieldCols * scaleX, fieldRows * scaleY);

  mapCtx.fillStyle = "#b34a34";
  mapCtx.fillRect(barnArea.x * scaleX, barnArea.y * scaleY, barnArea.w * scaleX, barnArea.h * scaleY);
  mapCtx.fillStyle = "#6a4f34";
  mapCtx.fillRect(cabinArea.x * scaleX, cabinArea.y * scaleY, cabinArea.w * scaleX, cabinArea.h * scaleY);
  mapCtx.fillStyle = "#76893d";
  mapCtx.fillRect(marketArea.x * scaleX, marketArea.y * scaleY, marketArea.w * scaleX, marketArea.h * scaleY);
  mapCtx.fillStyle = "#7f7f86";
  mapCtx.fillRect(smithArea.x * scaleX, smithArea.y * scaleY, smithArea.w * scaleX, smithArea.h * scaleY);
  mapCtx.fillStyle = "#4c5159";
  mapCtx.fillRect(mineFacadeArea.x * scaleX, mineFacadeArea.y * scaleY, mineFacadeArea.w * scaleX, mineFacadeArea.h * scaleY);

  drawMinimapMarker(barnArea.x + 3, barnArea.y + 2.5, "#ffb06b", 6);
  drawMinimapMarker(cabinArea.x + 2, cabinArea.y + 2, "#ffd27d", 6);
  drawMinimapMarker(marketArea.x + 2, marketArea.y + 2, "#fff2a8", 6);
  drawMinimapMarker(smithArea.x + 2, smithArea.y + 2, "#c7d9ff", 6);
  drawMinimapMarker(mineDoor.x + 1, mineDoor.y + 1, "#98c7ff", 6);
  drawMinimapMarker(fieldOrigin.x + fieldCols / 2, fieldOrigin.y + fieldRows / 2, "#88ff96", 6);
  drawMinimapMarker(horse.x / TILE_SIZE, horse.y / TILE_SIZE, "#c57a48", 6);

  let markerX = player.x / TILE_SIZE;
  let markerY = player.y / TILE_SIZE;
  if (state.scene === "cabin") {
    markerX = cabinArea.x + 2.5;
    markerY = cabinArea.y + 2;
  } else if (state.scene === "barn") {
    markerX = barnArea.x + 3;
    markerY = barnArea.y + 2.5;
  } else if (state.scene === "market") {
    markerX = marketArea.x + 2.5;
    markerY = marketArea.y + 2;
  } else if (state.scene === "smith") {
    markerX = smithArea.x + 2.5;
    markerY = smithArea.y + 2;
  } else if (state.scene === "mine") {
    markerX = mineDoor.x + 1;
    markerY = mineDoor.y + 1;
  }
  drawMinimapMarker(markerX, markerY, "#ff4d61", 7);

  mapCtx.strokeStyle = "rgba(255,255,255,0.2)";
  mapCtx.lineWidth = 2;
  mapCtx.strokeRect(1, 1, dom.minimap.width - 2, dom.minimap.height - 2);
}

function renderUi() {
  const healthPercent = clamp((state.playerHealth / 100) * 100, 0, 100);
  if (dom.dayLabel) dom.dayLabel.textContent = `Dia ${state.day}`;
  if (dom.phaseLabel) dom.phaseLabel.textContent = getDayLabel();
  if (dom.seasonLabel) dom.seasonLabel.textContent = getSeason().label;
  if (dom.locationLabel) dom.locationLabel.textContent = getSceneLabel();
  if (dom.sceneStateLabel) dom.sceneStateLabel.textContent = getSceneLabel();
  if (dom.timeFill) dom.timeFill.style.width = `${state.time}%`;
  if (dom.playerHealthFill) dom.playerHealthFill.style.width = `${healthPercent}%`;
  if (dom.coinsValue) dom.coinsValue.textContent = String(state.coins);
  if (dom.playerHealthValue) dom.playerHealthValue.textContent = String(state.playerHealth);

  document.body.classList.toggle("night", state.phase === "night");

  if (dom.logList) {
    dom.logList.innerHTML = "";
    state.logs.forEach((message) => {
      const item = document.createElement("li");
      item.textContent = message;
      dom.logList.appendChild(item);
    });
  }

  renderMinimap();

  dom.hotbar.querySelectorAll(".hotbar-slot").forEach((button) => {
    button.classList.toggle("active", button.dataset.slot === state.activeSlot);
    const seed = button.dataset.seed;
    const isLowSeed =
      (seed === "trigo" && state.inventory.seeds.trigo <= 1) ||
      (seed === "maiz" && state.inventory.seeds.maiz <= 1);
    button.classList.toggle("seed-low", Boolean(seed) && isLowSeed);
  });
}

function gameLoop(now) {
  const delta = Math.min(0.033, (now - lastFrame) / 1000);
  lastFrame = now;

  updateSleep(delta);
  updatePlayer(delta);
  updateCamera();
  updateAnimals(delta);
  updateEnemies(delta);
  updatePlotAnimations(delta);
  updateTreeAnimations(delta);
  updateRockAnimations(delta);
  updateTime(delta);
  renderWorld();
  renderUi();
  requestAnimationFrame(gameLoop);
}

function setMovement(key, pressed) {
  if (state.sleeping) return;
  if (key === "arrowup" || key === "w") input.up = pressed;
  if (key === "arrowdown" || key === "s") input.down = pressed;
  if (key === "arrowleft" || key === "a") input.left = pressed;
  if (key === "arrowright" || key === "d") input.right = pressed;
  if (pressed) {
    clearMoveTarget();
  }
}

function handleWorldPointer(point, interactionMode = "mouse") {
  mouse.x = point.x;
  mouse.y = point.y;
  mouse.inside = true;

  if (handleCanvasUiClick(point.x, point.y)) {
    clearMoveTarget();
    return;
  }

  if (interactionMode === "touch") {
    queueMoveOrAction(point);
    return;
  }

  const hasActionTarget = buildQueuedAction(point);
  if (hasActionTarget) {
    if (actionIsInReach(hasActionTarget)) {
      performQueuedAction(hasActionTarget);
      clearMoveTarget();
    } else {
      setMoveTarget(point.x, point.y, hasActionTarget);
    }
    return;
  }

  setMoveTarget(point.x, point.y, null);
}

document.addEventListener("keydown", (event) => {
  const key = event.key.toLowerCase();
  if (["arrowup", "arrowdown", "arrowleft", "arrowright", " "].includes(key) || event.code === "Space") {
    event.preventDefault();
  }

  if (!state.sleeping) {
    setMovement(key, true);
  }

  if (["1", "2", "3", "4", "5", "6", "7", "8", "9"].includes(key)) {
    const slotMap = {
      "1": { tool: "till" },
      "2": { tool: "plant" },
      "3": { tool: "water" },
      "4": { tool: "harvest" },
      "5": { tool: "plant", seed: "trigo" },
      "6": { tool: "plant", seed: "maiz" },
      "7": { tool: "axe" },
      "8": { tool: "sword" },
      "9": { tool: "pickaxe" }
    };
    selectHotbarSlot(key, slotMap[key].tool, slotMap[key].seed);
  }

  if (key === "q") {
    selectHotbarSlot("5", "plant", "trigo");
    addLog("Semilla activa: trigo.");
  }
  if (key === "r") {
    selectHotbarSlot("6", "plant", "maiz");
    addLog("Semilla activa: maiz.");
  }
  if (key === "z") {
    selectHotbarSlot("2", "plant", "tomate");
    addLog("Semilla activa: tomate.");
  }
  if (key === "x") {
    selectHotbarSlot("2", "plant", "calabaza");
    addLog("Semilla activa: calabaza.");
  }
  if (key === "t") selectHotbarSlot("7", "axe");
  if (key === "f") selectHotbarSlot("8", "sword");
  if (key === "g") selectHotbarSlot("9", "pickaxe");
  if (key === "e" && !state.sleeping) handleInteract();
  if (event.code === "Space" && !state.sleeping) {
    event.preventDefault();
    tryAttack();
  }
});

document.addEventListener("keyup", (event) => {
  if (state.sleeping) return;
  setMovement(event.key.toLowerCase(), false);
});

dom.hotbar.querySelectorAll(".hotbar-slot").forEach((button) => {
  button.addEventListener("click", () => {
    selectHotbarSlot(button.dataset.slot, button.dataset.tool, button.dataset.seed);
  });
});

dom.canvas.addEventListener("mousemove", (event) => {
  const point = getCanvasPoint(event);
  if (!point) {
    mouse.inside = false;
    return;
  }
  mouse.x = point.x;
  mouse.y = point.y;
  mouse.inside = true;
});

dom.canvas.addEventListener("mouseleave", () => {
  mouse.inside = false;
});

dom.canvas.addEventListener("mousedown", (event) => {
  if (event.button !== 0 || state.sleeping) return;
  event.preventDefault();
  const point = getCanvasPoint(event);
  if (!point) return;
  handleWorldPointer(point, "mouse");
});

dom.canvas.addEventListener("touchstart", (event) => {
  if (state.sleeping || event.touches.length === 0) return;
  event.preventDefault();
  const touch = event.touches[0];
  const point = getCanvasPointFromClient(touch.clientX, touch.clientY);
  if (!point) return;
  handleWorldPointer(point, "touch");
}, { passive: false });

dom.canvas.addEventListener("touchmove", (event) => {
  if (event.touches.length === 0) return;
  event.preventDefault();
  const touch = event.touches[0];
  const point = getCanvasPointFromClient(touch.clientX, touch.clientY);
  if (!point) {
    mouse.inside = false;
    return;
  }
  mouse.x = point.x;
  mouse.y = point.y;
  mouse.inside = true;
}, { passive: false });

dom.canvas.addEventListener("touchend", () => {
  mouse.inside = false;
});

dom.journalToggle.addEventListener("click", () => {
  const hidden = dom.journalModal.classList.contains("hidden");
  if (hidden) {
    openJournal();
  } else {
    closeJournal();
  }
});

dom.journalClose.addEventListener("click", closeJournal);
dom.journalModal.addEventListener("click", (event) => {
  if (event.target === dom.journalModal) {
    closeJournal();
  }
});

window.addEventListener("resize", () => {
  resizeCanvasToViewport();
  renderWorld();
  renderUi();
});

createFieldPlots();
createTrees();
createBushes();
createSurfaceRocks();
createMineRocks();
initAnimals();
resizeCanvasToViewport();
updateCamera();
renderWorld();
renderUi();
requestAnimationFrame(gameLoop);
