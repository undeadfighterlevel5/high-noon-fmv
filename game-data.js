window.GAME_DATA = {
  maxAmmo: 6,
  startingLives: 3,
  scorePerHit: 100,
  hitDisplayMs: 450,
  betweenEnemiesMs: 650,
  reactionJitterMs: 45,

  story: [
    {
      title: "The town fell in a week.",
      text: "Mercy's Run used to be a quiet cattle stop. Then Rattler Jack Crowe and his Dust Devils rode in, took the bank, bought the saloon with stolen money, and ran the sheriff out before sundown."
    },
    {
      title: "Four places keep Crowe in power.",
      text: "His men control Main Street, the Silver Spur Saloon, the bank, and the livery yard. Break their hold on all four and someone will finally tell you where Crowe is hiding."
    },
    {
      title: "You only get three chances.",
      text: "Every location has a pattern. Learn who appears where, reload before your cylinder runs dry, and remember: some gunmen are much faster than others. Clear all four locations to reach Crowe's hideout."
    }
  ],

  levels: [
    {
      id: "main-street",
      order: 1,
      name: "Main Street",
      difficulty: "LEVEL 1 — EASY",
      description: "Dust Devils are shaking down the storefronts. Most of them expose themselves before firing.",
      sceneClass: "scene-main-street",
      cover: [
        { type: "barrel-stack", x: 22, y: 68, w: 13, h: 24 },
        { type: "water-trough", x: 58, y: 73, w: 28, h: 16 },
        { type: "porch-post", x: 83, y: 58, w: 8, h: 42 }
      ],
      enemies: [
        { id: "street-1", spawn: "barrels", x: 22, y: 70, reveal: "rise", reactionMs: 1500 },
        { id: "street-2", spawn: "door", x: 44, y: 61, reveal: "right", reactionMs: 1320 },
        { id: "street-3", spawn: "trough", x: 60, y: 72, reveal: "rise", reactionMs: 1180 },
        { id: "street-4", spawn: "post", x: 84, y: 62, reveal: "left", reactionMs: 980 },
        { id: "street-5", spawn: "window", x: 69, y: 48, reveal: "rise", reactionMs: 1250 }
      ]
    },
    {
      id: "saloon",
      order: 2,
      name: "Silver Spur Saloon",
      difficulty: "LEVEL 2 — MEDIUM",
      description: "The room is crowded with cover. Watch the bar, tables, balcony, and swinging doors.",
      sceneClass: "scene-saloon",
      cover: [
        { type: "saloon-bar", x: 70, y: 69, w: 48, h: 27 },
        { type: "table", x: 29, y: 74, w: 25, h: 18 },
        { type: "piano", x: 16, y: 64, w: 17, h: 28 }
      ],
      enemies: [
        { id: "saloon-1", spawn: "table", x: 29, y: 73, reveal: "rise", reactionMs: 1180 },
        { id: "saloon-2", spawn: "bar-left", x: 58, y: 67, reveal: "rise", reactionMs: 1040 },
        { id: "saloon-3", spawn: "doors", x: 48, y: 59, reveal: "right", reactionMs: 920 },
        { id: "saloon-4", spawn: "bar-right", x: 78, y: 66, reveal: "rise", reactionMs: 790 },
        { id: "saloon-5", spawn: "balcony", x: 68, y: 41, reveal: "rise", reactionMs: 880 },
        { id: "saloon-6", spawn: "piano", x: 16, y: 64, reveal: "left", reactionMs: 960 }
      ]
    },
    {
      id: "bank",
      order: 3,
      name: "Territorial Bank",
      difficulty: "LEVEL 3 — HARD",
      description: "Crowe's money men are dug in behind desks, teller windows, and the vault corridor.",
      sceneClass: "scene-bank",
      cover: [
        { type: "teller-counter", x: 61, y: 63, w: 64, h: 24 },
        { type: "bank-desk", x: 24, y: 72, w: 24, h: 18 },
        { type: "safe", x: 89, y: 60, w: 13, h: 34 }
      ],
      enemies: [
        { id: "bank-1", spawn: "desk", x: 24, y: 71, reveal: "rise", reactionMs: 980 },
        { id: "bank-2", spawn: "teller-1", x: 46, y: 59, reveal: "rise", reactionMs: 820 },
        { id: "bank-3", spawn: "safe", x: 86, y: 59, reveal: "left", reactionMs: 690 },
        { id: "bank-4", spawn: "teller-2", x: 67, y: 59, reveal: "rise", reactionMs: 760 },
        { id: "bank-5", spawn: "door", x: 15, y: 58, reveal: "right", reactionMs: 620 },
        { id: "bank-6", spawn: "teller-3", x: 78, y: 58, reveal: "rise", reactionMs: 710 },
        { id: "bank-7", spawn: "desk-fast", x: 24, y: 71, reveal: "rise", reactionMs: 590 }
      ]
    },
    {
      id: "livery",
      order: 4,
      name: "Livery Yard",
      difficulty: "LEVEL 4 — EXPERT",
      description: "The fastest gunmen are waiting among wagons, stalls, crates, and hay bales.",
      sceneClass: "scene-livery",
      cover: [
        { type: "wagon", x: 30, y: 68, w: 37, h: 32 },
        { type: "hay-bales", x: 69, y: 72, w: 27, h: 24 },
        { type: "crate-stack", x: 90, y: 67, w: 16, h: 30 }
      ],
      enemies: [
        { id: "livery-1", spawn: "wagon", x: 30, y: 65, reveal: "right", reactionMs: 760 },
        { id: "livery-2", spawn: "hay", x: 69, y: 70, reveal: "rise", reactionMs: 610 },
        { id: "livery-3", spawn: "stall", x: 51, y: 55, reveal: "left", reactionMs: 520 },
        { id: "livery-4", spawn: "crates", x: 89, y: 66, reveal: "rise", reactionMs: 470 },
        { id: "livery-5", spawn: "wagon-fast", x: 26, y: 65, reveal: "left", reactionMs: 430 },
        { id: "livery-6", spawn: "loft", x: 58, y: 39, reveal: "rise", reactionMs: 560 },
        { id: "livery-7", spawn: "hay-fast", x: 73, y: 69, reveal: "rise", reactionMs: 410 },
        { id: "livery-8", spawn: "stall-fast", x: 48, y: 55, reveal: "right", reactionMs: 390 }
      ]
    }
  ],

  boss: {
    id: "hideout",
    name: "Crowe's Hideout",
    difficulty: "BOSS — RATTLER JACK CROWE",
    description: "The Dust Devils are finished. Crowe and his last gunmen are waiting at the old canyon hideout.",
    sceneClass: "scene-hideout",
    cover: [
      { type: "hideout-rock", x: 25, y: 72, w: 30, h: 28 },
      { type: "hideout-crates", x: 72, y: 73, w: 28, h: 24 },
      { type: "hideout-door", x: 50, y: 55, w: 19, h: 38 }
    ],
    enemies: [
      { id: "boss-guard-1", x: 24, y: 68, reveal: "rise", reactionMs: 520 },
      { id: "boss-guard-2", x: 72, y: 68, reveal: "rise", reactionMs: 470 },
      { id: "boss-guard-3", x: 49, y: 55, reveal: "right", reactionMs: 430 },
      { id: "boss-crowe", x: 52, y: 58, reveal: "rise", reactionMs: 360, boss: true }
    ]
  }
};
