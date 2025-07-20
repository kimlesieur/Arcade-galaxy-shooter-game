# Game State Management Refactoring

This document tracks the gradual refactoring of the game's state management from React hooks to Zustand stores.

## 🏗️ State Management Architecture

```mermaid
graph TB
    %% Main Components
    subgraph "🎮 Game Components"
        GS[GameScreen.tsx]
        GC[GameCanvas.tsx]
        GUI[GameUI.tsx]
        EO[ExplosionOverlay.tsx]
        SMB[SpecialMissileButton.tsx]
    end

    %% Hooks Layer
    subgraph "🎣 Hooks Layer"
        UGL[useGameLogic.ts]
        UFR[useFrameworkReady.ts]
    end

    %% Stores Layer
    subgraph "🏪 Zustand Stores"
        subgraph "🎯 GameLogicStore"
            GLS[Player Position<br/>Health<br/>Score<br/>Game Over<br/>Special Missile State]
        end
        
        subgraph "🎵 AudioStore"
            AS[Audio Instances<br/>Loading States<br/>Playback Controls<br/>Sound/Music Toggles]
        end
        
        subgraph "🎮 GameObjectsStore"
            GOS[Bullets<br/>Enemies<br/>Explosions<br/>Collision Detection<br/>Game Loop]
        end
        
        subgraph "⚙️ SettingsStore"
            SS[Sound Settings<br/>Music Settings<br/>Game Preferences]
        end
    end

    %% External Dependencies
    subgraph "🔧 External Dependencies"
        ZS[Zustand]
        ASYNC[AsyncStorage]
        AV[Expo AV]
        HAPTICS[Expo Haptics]
    end

    %% Data Flow
    GS --> UGL
    UGL --> GLS
    UGL --> AS
    UGL --> GOS
    UGL --> SS
    
    %% Store Dependencies
    GLS -.->|persist| ASYNC
    AS -.->|audio| AV
    GOS -.->|feedback| HAPTICS
    
    %% Component Dependencies
    GC --> GLS
    GC --> GOS
    GUI --> GLS
    EO --> GOS
    SMB --> GLS
    
    %% Store Interactions
    GOS -.->|collision events| GLS
    GOS -.->|sound triggers| AS
    AS -.->|settings| SS
    
    %% Styling
    classDef component fill:#e1f5fe,stroke:#01579b,stroke-width:2px
    classDef hook fill:#f3e5f5,stroke:#4a148c,stroke-width:2px
    classDef store fill:#e8f5e8,stroke:#1b5e20,stroke-width:2px
    classDef external fill:#fff3e0,stroke:#e65100,stroke-width:2px
    
    class GS,GC,GUI,EO,SMB component
    class UGL,UFR hook
    class GLS,AS,GOS,SS store
    class ZS,ASYNC,AV,HAPTICS external
```

## 🔄 Data Flow Diagram

```mermaid
sequenceDiagram
    participant User
    participant GameScreen
    participant useGameLogic
    participant GameObjectsStore
    participant GameLogicStore
    participant AudioStore
    participant SettingsStore

    Note over User,SettingsStore: Game Initialization
    User->>GameScreen: App Launch
    GameScreen->>useGameLogic: Initialize
    useGameLogic->>AudioStore: loadAudio()
    useGameLogic->>SettingsStore: Get settings
    useGameLogic->>GameObjectsStore: startGameLoop()
    
    Note over User,SettingsStore: Gameplay Loop
    loop Every Frame
        GameObjectsStore->>GameObjectsStore: updateBullets()
        GameObjectsStore->>GameObjectsStore: updateEnemies()
        GameObjectsStore->>GameObjectsStore: checkCollisions()
        GameObjectsStore->>GameLogicStore: addScore()
        GameObjectsStore->>GameLogicStore: decrementHealth()
        GameObjectsStore->>AudioStore: playCollisionSound()
    end
    
    Note over User,SettingsStore: User Interactions
    User->>GameScreen: Move Player
    GameScreen->>GameLogicStore: setPlayerX()
    
    User->>GameScreen: Special Missile
    GameScreen->>GameLogicStore: setIsSpecialMissileCharging()
    GameScreen->>GameObjectsStore: addBullet(special)
    GameScreen->>AudioStore: playSpecialMissileSound()
    
    Note over User,SettingsStore: Game Over
    GameLogicStore->>GameObjectsStore: stopGameLoop()
    GameLogicStore->>AudioStore: stopBackgroundMusic()
```

## 🎯 Store Responsibilities

```mermaid
mindmap
  root((Game State Management))
    GameLogicStore
      Player State
        Position (x, y)
        Health
        Score
        Game Over Status
      Special Missile
        Charging State
        Progress
        Fire Effects
      Persistence
        Score
        Health
    AudioStore
      Audio Management
        Background Music
        Sound Effects
        Loading States
      Playback Control
        Play/Pause
        Volume
        Error Handling
      Settings Integration
        Sound Toggle
        Music Toggle
    GameObjectsStore
      Game Objects
        Bullets
        Enemies
        Explosions
      Game Loop
        Animation Frame
        Delta Time
        Object Updates
      Collision System
        Bullet-Enemy
        Player-Enemy
        Scoring
        Haptic Feedback
    SettingsStore
      User Preferences
        Sound Enabled
        Music Enabled
        Other Settings
      Persistence
        AsyncStorage
```

## ✅ Completed Refactorings

### 1. GameLogicStore (Core Game State)
- **Created**: `stores/GameLogicStore.ts`
- **Purpose**: Manages core game state (player position, health, score, game over) and special missile state
- **Persistence**: Score and health only

### 2. AudioStore (Audio Management)
- **Created**: `stores/AudioStore.ts`
- **Purpose**: Manages audio instances, loading states, and playback
- **Features**: Loading state management, error handling, sound/music toggles

### 3. GameObjectsStore (Comprehensive Game Objects)
- **Created**: `stores/GameObjectsStore.ts`
- **Purpose**: Unified management of all game objects and their interactions
- **Consolidated**:
  - ✅ Bullets (spawning, movement, removal)
  - ✅ Enemies (spawning, movement, collision handling)
  - ✅ Explosions (creation, removal)
  - ✅ Collision Detection (bullet-enemy, player-enemy)
  - ✅ Game Loop (unified animation frame management)

## 🏗️ Current Architecture

### Stores
1. **GameLogicStore** - Core game state and special missile
2. **AudioStore** - Audio management and playback
3. **GameObjectsStore** - All game objects and interactions
4. **SettingsStore** - Game settings and preferences

### Hooks
- **`useGameLogic`** - Main orchestrator hook that uses all stores
- **`useFrameworkReady`** - Framework initialization

## 🎯 Benefits Achieved

### Performance
- ✅ Unified game loop instead of multiple useEffect loops
- ✅ Reduced re-renders through centralized state
- ✅ Better memory management

### Architecture
- ✅ Single source of truth for game objects
- ✅ Clean separation of concerns
- ✅ Eliminated complex hook dependencies
- ✅ Centralized collision detection logic

### Developer Experience
- ✅ Easier debugging with centralized state
- ✅ Cleaner component interfaces
- ✅ Better TypeScript support
- ✅ Simplified state management

## 🔧 Technical Improvements

### Game Loop Optimization
- **Before**: Multiple `useEffect` loops for bullets, enemies, collisions
- **After**: Single unified game loop in `GameObjectsStore`

### Collision Detection
- **Before**: Separate collision logic in `useCollisionDetection`
- **After**: Integrated collision detection in `GameObjectsStore`

### State Management
- **Before**: Complex hook interdependencies
- **After**: Clean store-based architecture
