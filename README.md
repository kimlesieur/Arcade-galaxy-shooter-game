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


