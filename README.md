# Reanimated example

<p>
  <!-- iOS -->
  <img alt="Supports Expo iOS" longdesc="Supports Expo iOS" src="https://img.shields.io/badge/iOS-4630EB.svg?style=flat-square&logo=APPLE&labelColor=999999&logoColor=fff" />
  <!-- Android -->
  <img alt="Supports Expo Android" longdesc="Supports Expo Android" src="https://img.shields.io/badge/Android-4630EB.svg?style=flat-square&logo=ANDROID&labelColor=A4C639&logoColor=fff" />
  <!-- Web -->
</p>

## 🚀 How to use

> `npx create-expo my-app --example with-reanimated`

- Run `yarn` or `npm install`
- Run `yarn start` or `npm run start` to try it out.

## 📝 Notes

- [`react-native-reanimated` docs](https://docs.swmansion.com/react-native-reanimated/)

## Develop the Game Engine

### 1. Player Plane & Movement
- Render the player's spaceship at the bottom of the screen
- Implement touch or drag controls to move the player left/right
- Display the player's position visually

### 2. Background Stars
- Add a simple animated starfield background
- Stars should move downward to create a sense of motion

### 3. Enemy Ships
- Render basic enemy ships at the top of the screen
- Make them move downward at a constant speed
- No shooting or collision yet

### 4. Player Shooting
- Allow the player to shoot bullets upward by tapping or holding a button
- Render bullets and make them move upward

### 5. Enemy Collisions & Scoring
- Detect collisions between player bullets and enemy ships
- Remove hit enemies and increment the score

### 6. Player Health
- Detect collisions between ennemies and player + reduce health when it happens

### 7. Game Over & Restart
- End the game when the player's health reaches zero
- Show a game over screen and allow restarting

### 8. Audio Effects
- Add haptic feedback on player collisions
- Add sound effects

### 9. Visual Effects
- Add explosion animations
- Polish UI elements


## Extra 
### A. Add power-ups
- Create bonus elements that player can catch
- These bonus adds power to his ship for some limited time (it changes the fired ammo munition type : missiles, ...)

### B. Enemy Shooting
- Make enemies shoot bullets downward

# Features

## Special Missile Feature
The special missile feature adds an interactive button to the bottom-right corner of the game screen that allows players to fire powerful special missiles.

### How It Works

#### Button Interaction
- **Long Press**: Hold down the special missile button to start charging
- **Circular Progress**: A circular progress bar fills around the button as it charges
- **Visual Feedback**: 
  - Button glows orange while charging
  - Button turns green when fully charged
  - Progress bar shows charging status
- **Haptic Feedback**: 
  - Light vibration when charging starts
  - Medium vibration when charging is cancelled
  - Success vibration when fully charged
  - Heavy vibration when special missile is fired

#### Special Missile Properties
- **Damage**: 3x damage compared to regular bullets (3 vs 1)
- **Speed**: 20% faster than regular bullets (600 vs 500 pixels/second)
- **Size**: Larger radius than regular bullets (10 vs 6 pixels)
- **Color**: Orange (#ff6b35) instead of yellow
- **Sound**: Louder sound effect when fired

### Technical Implementation

##### Components
1. **SpecialMissileButton.tsx**: Main button component with circular progress
2. **GameScreen.tsx**: Integration with game logic
3. **GameRenderer.tsx**: Visual rendering of special missiles
4. **types.ts**: Extended bullet type definitions

#### Key Features
- **Gesture Handling**: Uses react-native-gesture-handler for long press detection
- **Skia Graphics**: Circular progress bar rendered with Skia
- **State Management**: Proper cleanup and state management for charging
- **Audio Integration**: Special sound effects for the feature
- **Haptic Feedback**: Multiple haptic feedback points for better UX

#### Charging Mechanics
- **Charge Time**: 2 seconds to fully charge
- **Progress Updates**: 50ms intervals for smooth visual feedback
- **Auto-Trigger**: Automatically fires when fully charged
- **Cancellation**: Releasing before full charge cancels the action

## Usage
1. Long press the special missile button (bottom-right corner)
2. Hold until the circular progress bar fills completely
3. The special missile will automatically fire
4. The button resets and can be used again

## Future Enhancements
- Cooldown period between uses
- Multiple special missile types
- Power-up system integration
- Visual effects for special missile trails
- Different charging times based on game difficulty 