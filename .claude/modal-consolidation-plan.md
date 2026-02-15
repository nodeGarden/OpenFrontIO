# Modal Consolidation Plan: SinglePlayerModal + HostLobbyModal

## Overview

Consolidate `SinglePlayerModal.ts` and `HostLobbyModal.ts` into a single unified `GameSetupModal` component to reduce code duplication and simplify maintenance.

## Current State

### Files

- `src/client/SinglePlayerModal.ts` (~606 lines)
- `src/client/HostLobbyModal.ts` (~911 lines)

### Key Differences

| Aspect           | SinglePlayerModal                               | HostLobbyModal                                       |
| ---------------- | ----------------------------------------------- | ---------------------------------------------------- |
| **Header**       | "Single Player"                                 | "Create Private Lobby"                               |
| **Lobby ID**     | None                                            | Shows copyable lobby ID with visibility toggle       |
| **Players List** | None                                            | Shows `<lobby-team-view>` with connected players     |
| **Start Button** | "Start Game" (always enabled)                   | "Waiting..." / "Start Game" (requires 2+ players)    |
| **Game Mode**    | None                                            | FFA / Teams selection                                |
| **Team Count**   | None                                            | 2-7, Quads, Trios, Duos, HumansVsNations             |
| **Action**       | Dispatches `join-lobby` event with local config | Creates lobby via API, polls players, starts via API |

### Shared Sections (Identical)

- Map selection with categories
- Difficulty selection
- Options section:
  - Bots slider
  - Disable nations checkbox
  - Instant build checkbox
  - Random spawn checkbox
  - Donate gold checkbox
  - Donate troops checkbox
  - Infinite gold checkbox
  - Infinite troops checkbox
  - Compact map checkbox
  - Max timer checkbox with value input
- Unit type enables/disables

## Proposed Solution

### New Component Structure

```typescript
@customElement("game-setup-modal")
export class GameSetupModal extends LitElement {
  @property({ type: String }) mode: "single" | "host" = "single";

  // Shared state
  @state() private selectedMap: GameMapType = GameMapType.World;
  @state() private selectedDifficulty: Difficulty = Difficulty.Medium;
  @state() private useRandomMap: boolean = false;
  @state() private disabledUnits: UnitType[] = [];
  // ... other shared options

  // Host-only state
  @state() private lobbyId = "";
  @state() private clients: ClientInfo[] = [];
  @state() private gameMode: GameMode = GameMode.FFA;
  @state() private teamCount: TeamCountConfig = 2;
  // ...
}
```

### Implementation Steps

1. **Create new file** `src/client/GameSetupModal.ts`

2. **Extract shared sections** into reusable render methods:

   ```typescript
   private renderMapSelection() { ... }
   private renderDifficultySelection() { ... }
   private renderOptionsSection() { ... }
   private renderUnitTypeOptions() { ... }
   ```

3. **Add conditional sections**:

   ```typescript
   ${this.mode === 'host' ? this.renderLobbyIdBox() : ''}
   ${this.mode === 'host' ? this.renderGameModeSelection() : ''}
   ${this.mode === 'host' ? this.renderTeamCountSelection() : ''}
   ${this.mode === 'host' ? this.renderPlayersSection() : ''}
   ```

4. **Handle different start actions**:

   ```typescript
   private handleStart() {
     if (this.mode === 'single') {
       this.startSinglePlayer();
     } else {
       this.startMultiplayerGame();
     }
   }
   ```

5. **Dynamic title**:

   ```typescript
   get modalTitle() {
     return this.mode === 'single'
       ? translateText("single_modal.title")
       : translateText("host_modal.title");
   }
   ```

6. **Update imports** in `Main.ts` and other files that use these modals

7. **Deprecate old components** (keep as aliases initially for backwards compatibility)

8. **Update translation keys** to use shared keys where possible

## Considerations

### State Management

- Host mode requires polling interval for player updates
- Need to clean up intervals on close
- Host mode needs API integration for lobby creation/management

### Testing

- Test single player mode works exactly as before
- Test host mode works exactly as before
- Test switching between modes (if supported)

### Migration Strategy

1. Create new unified component
2. Keep old components as thin wrappers initially
3. Migrate usages one at a time
4. Remove old components once migration complete

## Estimated Effort

- **Development**: 4-6 hours
- **Testing**: 2-3 hours
- **Code review & polish**: 1-2 hours

## Related Files

- `src/client/Main.ts` - imports and uses both modals
- `src/client/components/LobbyTeamView.ts` - used by host modal
- `src/client/components/Maps.ts` - map display component
- `src/client/components/Difficulties.ts` - difficulty display component
- `src/client/utilities/RenderUnitTypeOptions.ts` - shared utility
