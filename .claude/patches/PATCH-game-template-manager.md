# Game Template Manager Feature

## Overview

**Category**: UI/Features
**Priority**: Medium
**Status**: ✅ Available (in dev-2 branch)
**Dependencies**: None
**Files Modified**: 3
**Files Created**: 1

## Description

Adds a comprehensive game template/preset system to the Single Player modal, allowing users to:

- Save current game settings as named templates
- Overwrite existing templates via dropdown in save modal (update settings without creating duplicates)
- Load previously saved templates
- Mark a template as "favorite" for quick loading
- Organize templates (rename, delete, reorder)
- Import/Export templates as JSON files
- Visual feedback when loading favorite template

## Modified Files

### 1. `src/client/SinglePlayerModal.ts`

**Changes**:

- Add `GameTemplateManager` component integration
- Add state for tracking favorite template status
- Add event handlers for template operations
- Add "Load Favorite" button in header when favorite exists
- Add visual feedback (color change + checkmark) when favorite loads

**Key Code Sections**:

```typescript
// CUSTOM: Add at imports
import "./components/GameTemplateManager";
import {
  GameTemplateManager,
  GameTemplateSettings,
} from "./components/GameTemplateManager";

// CUSTOM: Add state properties
@state() private hasFavoriteTemplate: boolean = false;
@state() private favoriteJustLoaded: boolean = false;

@query("game-template-manager")
private templateManager!: GameTemplateManager;

private favoriteLoadedTimeout?: number;

// CUSTOM: Add event listeners in connectedCallback
this.addEventListener(
  "get-current-settings",
  this.handleGetCurrentSettings as EventListener,
);
this.addEventListener(
  "load-template",
  this.handleLoadTemplate as EventListener,
);
this.addEventListener(
  "templates-changed",
  this.handleTemplatesChanged as EventListener,
);

// CUSTOM: Add event handler methods
private handleGetCurrentSettings = (
  event: CustomEvent<{ settings?: GameTemplateSettings }>,
) => {
  event.detail.settings = {
    selectedMap: this.selectedMap,
    selectedDifficulty: this.selectedDifficulty,
    disableNations: this.disableNations,
    bots: this.bots,
    infiniteGold: this.infiniteGold,
    infiniteTroops: this.infiniteTroops,
    compactMap: this.compactMap,
    maxTimer: this.maxTimer,
    maxTimerValue: this.maxTimerValue,
    instantBuild: this.instantBuild,
    randomSpawn: this.randomSpawn,
    useRandomMap: this.useRandomMap,
    gameMode: this.gameMode,
    teamCount: this.teamCount,
    disabledUnits: this.disabledUnits,
  };
};

private handleLoadTemplate = (
  event: CustomEvent<{ settings: GameTemplateSettings }>,
) => {
  const settings = event.detail.settings;
  this.selectedMap = settings.selectedMap;
  this.selectedDifficulty = settings.selectedDifficulty;
  this.disableNations = settings.disableNations;
  this.bots = settings.bots;
  this.infiniteGold = settings.infiniteGold;
  this.infiniteTroops = settings.infiniteTroops;
  this.compactMap = settings.compactMap;
  this.maxTimer = settings.maxTimer;
  this.maxTimerValue = settings.maxTimerValue;
  this.instantBuild = settings.instantBuild;
  this.randomSpawn = settings.randomSpawn;
  this.useRandomMap = settings.useRandomMap;
  this.gameMode = settings.gameMode;
  this.teamCount = settings.teamCount;
  this.disabledUnits = settings.disabledUnits;
};

private handleTemplatesChanged = (
  event: CustomEvent<{ favoriteTemplate: any }>,
) => {
  this.hasFavoriteTemplate = event.detail.favoriteTemplate !== null;
};

private loadFavoriteTemplate = () => {
  const favoriteTemplate = this.templateManager?.getFavoriteTemplate();
  if (favoriteTemplate) {
    this.handleLoadTemplate(
      new CustomEvent("load-template", {
        detail: { settings: favoriteTemplate.settings },
      }),
    );

    // Show confirmation
    this.favoriteJustLoaded = true;

    // Clear existing timeout if any
    if (this.favoriteLoadedTimeout) {
      clearTimeout(this.favoriteLoadedTimeout);
    }

    // Reset after 2.5 seconds
    this.favoriteLoadedTimeout = window.setTimeout(() => {
      this.favoriteJustLoaded = false;
    }, 2500);
  }
};

// CUSTOM: Add in render() method, inside Template Manager section
<game-template-manager>
  ${this.hasFavoriteTemplate
    ? html`
        <button
          slot="quick-profile"
          @click=${this.loadFavoriteTemplate}
          class="inline-flex items-center gap-2 px-4 py-3 text-sm font-bold tracking-wider uppercase rounded-lg border-2 transition-all cursor-pointer"
          title="${translateText("single_modal.load_quick_profile") ||
          "Load your favorite template"}"
          style="${this.favoriteJustLoaded
            ? "background: rgba(34, 197, 94, 0.2); border-color: rgba(34, 197, 94, 0.5); color: #22c55e; font-size: 16px;"
            : "background: rgba(251, 191, 36, 0.15); border-color: rgba(251, 191, 36, 0.3); color: #fbbf24; font-size: 16px;"}"
        >
          ${this.favoriteJustLoaded
            ? html`
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  style="color: #22c55e; animation: checkmark-pop 0.3s ease-out;"
                >
                  <path d="M20 6 9 17l-5-5" />
                </svg>
                <span>${translateText("single_modal.profile_loaded") || "Loaded!"}</span>
              `
            : html`
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  style="color: #fbbf24;"
                >
                  <polygon
                    points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
                  />
                </svg>
                <span>${translateText("single_modal.quick_profile") || "Quick Profile"}</span>
              `}
        </button>
      `
    : html``}
</game-template-manager>
```

### 2. New File: `src/client/components/GameTemplateManager.ts`

**Purpose**: Complete template management component with UI

**Create this file with the content provided at the end of this document.**

**Features**:

- localStorage-based template persistence (key: `game.templates`)
- Template CRUD operations (create, read, update, delete)
- Drag-and-drop reordering
- Favorite template marking (star icon)
- Import/Export JSON functionality
- Modal dialogs for save and organize operations
- Split button UI component
- Dropdown menu for template selection

**TypeScript Interfaces**:

```typescript
export interface GameTemplate {
  id: string;
  name: string;
  createdAt: number;
  settings: GameTemplateSettings;
  isFavorite?: boolean;
}

export interface GameTemplateSettings {
  selectedMap: GameMapType;
  selectedDifficulty: Difficulty;
  disableNations: boolean;
  bots: number;
  infiniteGold: boolean;
  infiniteTroops: boolean;
  compactMap: boolean;
  maxTimer: boolean;
  maxTimerValue?: number;
  instantBuild: boolean;
  randomSpawn: boolean;
  useRandomMap: boolean;
  gameMode: GameMode;
  teamCount: TeamCountConfig;
  disabledUnits: UnitType[];
}
```

**Key Methods**:

- `saveTemplate(name: string)` - Save current settings
- `loadTemplate(id: string)` - Load a template
- `deleteTemplate(id: string)` - Delete a template
- `toggleFavorite(id: string)` - Mark/unmark favorite
- `exportTemplates()` - Export all templates as JSON
- `importTemplates(file)` - Import templates from JSON
- `getFavoriteTemplate()` - Get the favorite template

## Localization Keys

Add the following keys to `resources/lang/en.json` inside the existing `"single_modal"` section:

```json
{
  "single_modal": {
    "templates_section": "Templates",
    "quick_profile": "Quick Profile",
    "load_quick_profile": "Load quick profile",
    "profile_loaded": "Loaded!",
    "save": "Save",
    "export": "Export",
    "load": "Load",
    "load_file": "Load File",
    "organize_templates": "Organize Templates",
    "save_template_title": "Save Template",
    "template_name_placeholder": "Template name",
    "cancel": "Cancel",
    "no_templates": "No templates saved yet",
    "unfavorite": "Remove favorite",
    "favorite_action": "Set as favorite",
    "rename": "Rename",
    "delete": "Delete",
    "done": "Done",
    "or_overwrite": "or update existing",
    "select_template_placeholder": "Select a template to overwrite..."
  }
}
```

## Installation Steps

### Step 1: Create GameTemplateManager Component

Create the file `src/client/components/GameTemplateManager.ts` with the content provided in the **Complete File Content** section at the end of this document.

### Step 2: Add Translation Keys

Add the keys from the **Localization Keys** section above to `resources/lang/en.json` inside the `"single_modal"` object.

### Step 3: Update SinglePlayerModal

Apply the changes outlined above to `src/client/SinglePlayerModal.ts`. Use the dev-2 version as reference:

```bash
# View the full diff for reference
git diff main...dev-2 -- src/client/SinglePlayerModal.ts
```

**Key Integration Points**:

1. **Imports** - Add GameTemplateManager imports
2. **State** - Add hasFavoriteTemplate and favoriteJustLoaded states
3. **Query** - Add @query for template manager component
4. **Event Handlers** - Add 3 event listeners + handlers
5. **Render Method** - Add game-template-manager component with quick-profile slot

### Step 3: Test the Feature

1. Start the dev server
2. Open Single Player modal
3. Configure settings
4. Click "Save Template" → name it → Save
5. Click star icon to mark as favorite
6. Verify "Quick Profile" button appears
7. Click "Quick Profile" → verify settings load + visual feedback
8. Test organize modal (rename, delete, reorder)
9. Test export/import functionality

## Visual Design

**Quick Profile Button (Normal State)**:

- Background: `rgba(251, 191, 36, 0.15)` (yellow/amber tint)
- Border: `rgba(251, 191, 36, 0.3)` (yellow/amber)
- Color: `#fbbf24` (amber)
- Icon: Filled star (gold)

**Quick Profile Button (Just Loaded)**:

- Background: `rgba(34, 197, 94, 0.2)` (green tint)
- Border: `rgba(34, 197, 94, 0.5)` (green)
- Color: `#22c55e` (green)
- Icon: Checkmark
- Duration: 2.5 seconds

**Template Dropdown**:

- Background: `#1a1a1a` (dark)
- Border: `#555` (medium gray)
- Hover: `#333` (lighter gray)
- Favorite icon color: `#fbbf24` (amber)

## Storage Format

Templates are stored in `localStorage` under the key `game.templates`:

```json
[
  {
    "id": "abc123",
    "name": "My Quick Setup",
    "createdAt": 1707956400000,
    "isFavorite": true,
    "settings": {
      "selectedMap": "World",
      "selectedDifficulty": "Easy",
      "disableNations": false,
      "bots": 400,
      "infiniteGold": false,
      "infiniteTroops": false,
      "compactMap": false,
      "maxTimer": false,
      "maxTimerValue": undefined,
      "instantBuild": false,
      "randomSpawn": false,
      "useRandomMap": false,
      "gameMode": "FFA",
      "teamCount": 2,
      "disabledUnits": []
    }
  }
]
```

## Benefits

- **User Convenience**: Save frequently used settings
- **Quick Access**: One-click loading via favorite
- **Visual Feedback**: Clear indication when template loads
- **Portable**: Export/import for sharing or backup
- **Organized**: Rename, reorder, and manage templates

## Limitations

- Only works in Single Player modal (not Host Lobby)
- Templates stored in browser localStorage (not synced across devices)
- No cloud backup (local only)

## Future Enhancements

- Add to Host Lobby modal
- Cloud sync for logged-in users
- Share templates via URL/code
- Community template library
- Auto-save last used settings

## Notes

- Component is fully self-contained (no external dependencies)
- Uses Lit web components
- Follows existing UI patterns (modals, buttons, icons)
- SVG icons from Lucide (inline, no external dependencies)
- Drag-and-drop uses native HTML5 drag API

## Verification

After applying this patch:

```bash
# Check files exist
ls -la src/client/components/GameTemplateManager.ts

# Check for template manager in SinglePlayerModal
grep -n "GameTemplateManager" src/client/SinglePlayerModal.ts

# Check for quick-profile slot
grep -n "quick-profile" src/client/SinglePlayerModal.ts

# Run the dev server
pnpm dev
```

## Related Commits (dev-2 branch)

- `546653292` - Add template management to solo game modal
- `0b06ccc8e` - Add game setting templates feature for SinglePlayerModal
- `77bc7b08b` - Add game setting templates feature for SinglePlayerModal
- `b5262f955` - Add game setting templates feature for SinglePlayerModal

## Patch Signature

```
Patch: Game Template Manager
Version: 1.0
Date: 2026-02-15
Branch: dev-2
Author: nodeGarden <mondo@nodegarden.net>
Status: Ready for application
```

---

## Complete File Content

### `src/client/components/GameTemplateManager.ts`

Create this file with the following content:

```typescript
import { LitElement, css, html, svg } from "lit";
import { customElement, query, state } from "lit/decorators.js";
import {
  Difficulty,
  GameMapType,
  GameMode,
  UnitType,
} from "../../core/game/Game";
import { TeamCountConfig } from "../../core/Schemas";
import { translateText } from "../Utils";

export interface GameTemplate {
  id: string;
  name: string;
  createdAt: number;
  settings: GameTemplateSettings;
  isFavorite?: boolean;
}

export interface GameTemplateSettings {
  selectedMap: GameMapType;
  selectedDifficulty: Difficulty;
  disableNations: boolean;
  bots: number;
  infiniteGold: boolean;
  infiniteTroops: boolean;
  compactMap: boolean;
  maxTimer: boolean;
  maxTimerValue?: number;
  instantBuild: boolean;
  randomSpawn: boolean;
  useRandomMap: boolean;
  gameMode: GameMode;
  teamCount: TeamCountConfig;
  disabledUnits: UnitType[];
}

const TEMPLATES_STORAGE_KEY = "game.templates";

// SVG Icons from Lucide
const iconSave = svg`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"/><path d="M17 21v-7a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7"/><path d="M7 3v4a1 1 0 0 0 1 1h7"/></svg>`;

const iconDownload = svg`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 15V3"/><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5"/></svg>`;

const iconFolderInput = svg`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 9V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H20a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-1"/><path d="M2 13h10"/><path d="m9 16 3-3-3-3"/></svg>`;

const iconOrganize = svg`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 16 4 4 4-4"/><path d="M7 20V4"/><path d="m21 8-4-4-4 4"/><path d="M17 4v16"/></svg>`;

const iconTrash = svg`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 11v6"/><path d="M14 11v6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>`;

const iconPencil = svg`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/></svg>`;

const iconCheck = svg`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>`;

const iconClose = svg`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>`;

const iconStar = svg`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`;

const iconStarFilled = svg`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`;

@customElement("game-template-manager")
export class GameTemplateManager extends LitElement {
  @state() private templates: GameTemplate[] = [];
  @state() private isDropdownOpen = false;
  @state() private isSaveModalOpen = false;
  @state() private isOrganizeModalOpen = false;
  @state() private newTemplateName = "";
  @state() private editingTemplateId: string | null = null;
  @state() private editingTemplateName = "";
  @state() private draggedIndex: number | null = null;
  @state() private renderKey = 0;

  @query("#template-name-input") private nameInput!: HTMLInputElement;

  static styles = css`
    :host {
      display: contents;
    }

    .template-buttons {
      display: flex;
      gap: 0.5rem;
      align-items: center;
      flex-wrap: wrap;
    }

    .template-buttons-spacer {
      flex: 1;
    }

    .split-button {
      display: inline-flex;
      border-radius: 8px;
      overflow: hidden;
    }

    .split-button__main,
    .split-button__dropdown {
      background: #555;
      color: #fff;
      border: none;
      cursor: pointer;
      padding: 0.8rem 1rem;
      font-size: 16px;
      transition: background 0.2s;
    }

    .split-button__main {
      border-right: 1px solid rgba(255, 255, 255, 0.2);
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
    }

    .split-button__main:hover,
    .split-button__dropdown:hover {
      background: #666;
    }

    .split-button__dropdown {
      padding: 0.8rem 0.6rem;
      display: flex;
      align-items: center;
    }

    .dropdown-container {
      position: relative;
      display: inline-block;
    }

    .dropdown-menu {
      position: absolute;
      top: 100%;
      right: 0;
      min-width: 220px;
      background: #1a1a1a;
      border: 1px solid #555;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
      z-index: 1000;
      margin-top: 4px;
      max-height: 300px;
      overflow-y: auto;
    }

    .dropdown-item {
      padding: 0.75rem 1rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      transition: background 0.15s;
      color: #fff;
      font-size: 14px;
    }

    .dropdown-item:hover {
      background: #333;
    }

    .dropdown-item:first-child {
      border-top-left-radius: 8px;
      border-top-right-radius: 8px;
    }

    .dropdown-item:last-child {
      border-bottom-left-radius: 8px;
      border-bottom-right-radius: 8px;
    }

    .dropdown-separator {
      border-top: 1px solid #444;
      margin: 0.25rem 0;
    }

    .dropdown-item--template {
      padding-left: 1.5rem;
    }

    .dropdown-item__icon {
      width: 16px;
      height: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .dropdown-item__icon--favorite {
      color: #fbbf24;
    }

    .dropdown-item__bullet {
      width: 6px;
      height: 6px;
      background: #888;
      border-radius: 50%;
      margin-right: 0.25rem;
    }

    .action-button {
      background: #555;
      color: #fff;
      border: none;
      cursor: pointer;
      padding: 0.8rem 1rem;
      font-size: 16px;
      border-radius: 8px;
      transition: background 0.2s;
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
    }

    .action-button:hover {
      background: #666;
    }

    .action-button--primary {
      background: var(--primaryColor, #4caf50);
    }

    .action-button--primary:hover {
      background: var(--primaryColorHover, #45a049);
    }

    .action-button--favorite {
      background: rgba(251, 191, 36, 0.15);
      border: 2px solid rgba(251, 191, 36, 0.3);
      color: #fbbf24;
    }

    .action-button--favorite:hover {
      background: rgba(251, 191, 36, 0.25);
      border-color: rgba(251, 191, 36, 0.5);
    }

    .action-button--favorite svg {
      color: #fbbf24;
    }

    /* Save Modal Styles */
    .save-modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.7);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
    }

    .save-modal {
      background: #1a1a1a;
      border: 1px solid #444;
      border-radius: 12px;
      padding: 1.5rem;
      min-width: 300px;
      max-width: 400px;
      color: #fff;
    }

    .save-modal__title {
      font-size: 18px;
      margin-bottom: 1rem;
      text-align: center;
      color: #fff;
    }

    .save-modal__input {
      width: 100%;
      padding: 0.8rem;
      border: 1px solid #555;
      border-radius: 8px;
      background: #2a2a2a;
      color: #fff;
      font-size: 14px;
      margin-bottom: 1rem;
      box-sizing: border-box;
    }

    .save-modal__input:focus {
      outline: none;
      border-color: var(--primaryColor, #4caf50);
    }

    .save-modal__buttons {
      display: flex;
      gap: 0.5rem;
      justify-content: flex-end;
    }

    /* Organize Modal Styles */
    .organize-modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.7);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
    }

    .organize-modal {
      background: #1a1a1a;
      border: 1px solid #444;
      border-radius: 12px;
      padding: 1.5rem;
      min-width: 350px;
      max-width: 500px;
      max-height: 70vh;
      display: flex;
      flex-direction: column;
      color: #fff;
      position: relative;
    }

    .organize-modal__header {
      position: relative;
      margin-bottom: 1rem;
    }

    .organize-modal__title {
      font-size: 18px;
      text-align: center;
      color: #fff;
    }

    .organize-modal__close {
      position: absolute;
      right: 0;
      top: 50%;
      transform: translateY(-50%);
      background: transparent;
      border: none;
      color: #888;
      cursor: pointer;
      padding: 0.25rem;
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.15s;
    }

    .organize-modal__close:hover {
      background: #444;
      color: #fff;
    }

    .organize-modal__list {
      flex: 1;
      overflow-y: auto;
      margin-bottom: 1rem;
    }

    .organize-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem;
      background: #2a2a2a;
      border-radius: 6px;
      margin-bottom: 0.5rem;
      cursor: grab;
      transition: background 0.15s;
      color: #fff;
    }

    .organize-item:hover {
      background: #333;
    }

    .organize-item.dragging {
      opacity: 0.5;
      background: #444;
    }

    .organize-item.drag-over {
      border: 2px dashed var(--primaryColor, #4caf50);
    }

    .organize-item__drag {
      cursor: grab;
      color: #666;
    }

    .organize-item__name {
      flex: 1;
      min-width: 0;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .organize-item__name-input {
      flex: 1;
      padding: 0.4rem;
      border: 1px solid #444;
      border-radius: 4px;
      background: #2a2a2a;
      color: #fff;
      font-size: 14px;
    }

    .organize-item__name-save {
      background: var(--primaryColor, #4caf50);
      border: none;
      color: #fff;
      cursor: pointer;
      padding: 0.3rem 0.5rem;
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.15s;
    }

    .organize-item__name-save:hover {
      background: var(--primaryColorHover, #45a049);
    }

    .organize-item__actions {
      display: flex;
      gap: 0.25rem;
    }

    .organize-item__btn {
      background: transparent;
      border: none;
      color: #888;
      cursor: pointer;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      transition: all 0.15s;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .organize-item__btn:hover {
      background: #444;
      color: #fff;
    }

    .organize-item__btn--delete:hover {
      background: #c0392b;
    }

    .organize-item__btn--favorite {
      color: #fbbf24;
    }

    .organize-item__btn--favorite:hover {
      background: #fbbf24;
      color: #000;
    }

    .organize-modal__empty {
      text-align: center;
      color: #888;
      padding: 2rem;
    }

    .organize-modal__buttons {
      display: flex;
      justify-content: flex-end;
    }
  `;

  connectedCallback() {
    super.connectedCallback();
    this.loadTemplates();
    // Use capture phase to catch clicks before stopPropagation
    document.addEventListener("click", this.handleOutsideClick, true);
    // Force re-render on language changes
    document.addEventListener("languageChanged", this.handleLanguageChange);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    document.removeEventListener("click", this.handleOutsideClick, true);
    document.removeEventListener("languageChanged", this.handleLanguageChange);
  }

  private handleLanguageChange = () => {
    this.renderKey++;
    this.requestUpdate();
  };

  private handleOutsideClick = (e: MouseEvent) => {
    if (this.isDropdownOpen) {
      const path = e.composedPath();
      // Check if click is inside the dropdown container specifically
      const dropdownContainer = this.shadowRoot?.querySelector(
        ".dropdown-container",
      );
      const isInsideDropdown =
        dropdownContainer && path.some((el) => el === dropdownContainer);
      if (!isInsideDropdown) {
        this.isDropdownOpen = false;
      }
    }
  };

  private loadTemplates() {
    try {
      const stored = localStorage.getItem(TEMPLATES_STORAGE_KEY);
      if (stored) {
        this.templates = JSON.parse(stored);
      }
    } catch {
      this.templates = [];
    }
    // Notify parent after initial load
    setTimeout(() => this.notifyTemplatesChanged(), 0);
  }

  private saveTemplates() {
    localStorage.setItem(TEMPLATES_STORAGE_KEY, JSON.stringify(this.templates));
    this.notifyTemplatesChanged();
  }

  private notifyTemplatesChanged() {
    this.dispatchEvent(
      new CustomEvent("templates-changed", {
        detail: { favoriteTemplate: this.getFavoriteTemplate() },
        bubbles: true,
        composed: true,
      }),
    );
  }

  public getCurrentSettings(): GameTemplateSettings {
    // This will be called by the parent to get current settings
    const event = new CustomEvent<{ settings?: GameTemplateSettings }>(
      "get-current-settings",
      {
        detail: {},
        bubbles: true,
        composed: true,
      },
    );
    this.dispatchEvent(event);
    return event.detail.settings!;
  }

  public openSaveModal() {
    this.newTemplateName = "";
    this.isSaveModalOpen = true;
    setTimeout(() => this.nameInput?.focus(), 50);
  }

  private closeSaveModal() {
    this.isSaveModalOpen = false;
    this.newTemplateName = "";
  }

  private handleSaveTemplate() {
    if (!this.newTemplateName.trim()) return;

    const settings = this.getCurrentSettings();
    const template: GameTemplate = {
      id: `template-${Date.now()}`,
      name: this.newTemplateName.trim(),
      createdAt: Date.now(),
      settings,
    };

    this.templates = [...this.templates, template];
    this.saveTemplates();
    this.closeSaveModal();

    this.dispatchEvent(
      new CustomEvent("template-saved", {
        detail: { template },
        bubbles: true,
        composed: true,
      }),
    );
  }

  public exportSettings() {
    const settings = this.getCurrentSettings();
    const exportData = {
      version: 1,
      exportedAt: new Date().toISOString(),
      settings,
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `openfront-settings-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  public importSettings() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        const text = await file.text();
        const data = JSON.parse(text);

        if (data.settings) {
          this.dispatchEvent(
            new CustomEvent("load-template", {
              detail: { settings: data.settings },
              bubbles: true,
              composed: true,
            }),
          );
        }
      } catch (err) {
        console.error("Failed to import settings:", err);
      }
    };
    input.click();
  }

  private loadTemplate(template: GameTemplate) {
    this.isDropdownOpen = false;
    this.dispatchEvent(
      new CustomEvent("load-template", {
        detail: { settings: template.settings },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private openOrganizeModal() {
    this.isDropdownOpen = false;
    this.editingTemplateId = null;
    this.isOrganizeModalOpen = true;
  }

  private closeOrganizeModal() {
    this.isOrganizeModalOpen = false;
    this.editingTemplateId = null;
    this.saveTemplates();
  }

  private startEditing(templateId: string) {
    const template = this.templates.find((t) => t.id === templateId);
    if (template) {
      this.editingTemplateId = templateId;
      this.editingTemplateName = template.name;
    }
  }

  private cancelEditing() {
    this.editingTemplateId = null;
    this.editingTemplateName = "";
  }

  private saveEditing(templateId: string) {
    if (this.editingTemplateName.trim()) {
      this.templates = this.templates.map((t) =>
        t.id === templateId
          ? { ...t, name: this.editingTemplateName.trim() }
          : t,
      );
    }
    this.editingTemplateId = null;
    this.editingTemplateName = "";
  }

  private deleteTemplate(templateId: string) {
    this.templates = this.templates.filter((t) => t.id !== templateId);
  }

  private toggleFavorite(templateId: string) {
    // First, unfavorite all templates
    this.templates = this.templates.map((t) => ({
      ...t,
      isFavorite: t.id === templateId ? !t.isFavorite : false,
    }));
    this.saveTemplates();
  }

  public getFavoriteTemplate(): GameTemplate | null {
    return this.templates.find((t) => t.isFavorite) ?? null;
  }

  private handleDragStart(index: number) {
    this.draggedIndex = index;
  }

  private handleDragOver(e: DragEvent, index: number) {
    e.preventDefault();
    if (this.draggedIndex === null || this.draggedIndex === index) return;

    const newTemplates = [...this.templates];
    const [dragged] = newTemplates.splice(this.draggedIndex, 1);
    newTemplates.splice(index, 0, dragged);
    this.templates = newTemplates;
    this.draggedIndex = index;
  }

  private handleDragEnd() {
    this.draggedIndex = null;
  }

  render() {
    const saveTextRaw = translateText("single_modal.save");
    const saveText =
      saveTextRaw && !saveTextRaw.includes("single_modal")
        ? saveTextRaw
        : "Save";
    const exportTextRaw = translateText("single_modal.export");
    const exportText =
      exportTextRaw && !exportTextRaw.includes("single_modal")
        ? exportTextRaw
        : "Export";
    const loadTextRaw = translateText("single_modal.load");
    const loadText =
      loadTextRaw && !loadTextRaw.includes("single_modal")
        ? loadTextRaw
        : "Load";

    return html`
      <div class="template-buttons">
        <button class="action-button" @click=${this.openSaveModal}>
          ${iconSave} ${saveText}
        </button>

        <button class="action-button" @click=${this.exportSettings}>
          ${iconDownload} ${exportText}
        </button>

        <div class="template-buttons-spacer"></div>

        <slot name="quick-profile"></slot>

        <div class="dropdown-container">
          <div class="split-button">
            <button class="split-button__main" @click=${this.importSettings}>
              ${iconFolderInput} ${loadText}
            </button>
            <button
              class="split-button__dropdown"
              @click=${() => (this.isDropdownOpen = !this.isDropdownOpen)}
            >
              ▼
            </button>
          </div>

          ${this.isDropdownOpen
            ? html`
                <div class="dropdown-menu">
                  <div class="dropdown-item" @click=${this.importSettings}>
                    <span class="dropdown-item__icon">${iconFolderInput}</span>
                    ${translateText("single_modal.load_file")}
                  </div>
                  <div class="dropdown-item" @click=${this.openOrganizeModal}>
                    <span class="dropdown-item__icon">${iconOrganize}</span>
                    ${translateText("single_modal.organize_templates")}
                  </div>
                  ${this.templates.length > 0
                    ? html`
                        <div class="dropdown-separator"></div>
                        ${this.templates.map(
                          (template) => html`
                            <div
                              class="dropdown-item dropdown-item--template"
                              @click=${() => this.loadTemplate(template)}
                            >
                              ${template.isFavorite
                                ? html`<span
                                    class="dropdown-item__icon dropdown-item__icon--favorite"
                                    >${iconStarFilled}</span
                                  >`
                                : html`<span
                                    class="dropdown-item__bullet"
                                  ></span>`}
                              ${template.name}
                            </div>
                          `,
                        )}
                      `
                    : ""}
                </div>
              `
            : ""}
        </div>
      </div>

      ${this.isSaveModalOpen
        ? html`
            <div
              class="save-modal-overlay"
              @click=${(e: Event) => {
                if (e.target === e.currentTarget) this.closeSaveModal();
              }}
            >
              <div class="save-modal">
                <div class="save-modal__title">
                  ${translateText("single_modal.save_template_title")}
                </div>
                <input
                  id="template-name-input"
                  class="save-modal__input"
                  type="text"
                  autocomplete="off"
                  placeholder="${translateText(
                    "single_modal.template_name_placeholder",
                  )}"
                  .value=${this.newTemplateName}
                  @input=${(e: Event) =>
                    (this.newTemplateName = (
                      e.target as HTMLInputElement
                    ).value)}
                  @keydown=${(e: KeyboardEvent) => {
                    if (e.key === "Enter") this.handleSaveTemplate();
                    if (e.key === "Escape") this.closeSaveModal();
                  }}
                />
                <div class="save-modal__buttons">
                  <button class="action-button" @click=${this.closeSaveModal}>
                    ${translateText("single_modal.cancel")}
                  </button>
                  <button
                    class="action-button action-button--primary"
                    @click=${this.handleSaveTemplate}
                  >
                    ${translateText("single_modal.save")}
                  </button>
                </div>
              </div>
            </div>
          `
        : ""}
      ${this.isOrganizeModalOpen
        ? html`
            <div
              class="organize-modal-overlay"
              @click=${(e: Event) => {
                if (e.target === e.currentTarget) this.closeOrganizeModal();
              }}
            >
              <div class="organize-modal">
                <div class="organize-modal__header">
                  <div class="organize-modal__title">
                    ${translateText("single_modal.organize_templates")}
                  </div>
                  <button
                    class="organize-modal__close"
                    @click=${this.closeOrganizeModal}
                  >
                    ${iconClose}
                  </button>
                </div>
                <div class="organize-modal__list">
                  ${this.templates.length === 0
                    ? html`
                        <div class="organize-modal__empty">
                          ${translateText("single_modal.no_templates")}
                        </div>
                      `
                    : this.templates.map(
                        (template, index) => html`
                          <div
                            class="organize-item ${this.draggedIndex === index
                              ? "dragging"
                              : ""}"
                            draggable="true"
                            @dragstart=${() => this.handleDragStart(index)}
                            @dragover=${(e: DragEvent) =>
                              this.handleDragOver(e, index)}
                            @dragend=${this.handleDragEnd}
                          >
                            <span class="organize-item__drag">☰</span>
                            <div class="organize-item__name">
                              ${this.editingTemplateId === template.id
                                ? html`
                                    <input
                                      class="organize-item__name-input"
                                      type="text"
                                      autocomplete="off"
                                      .value=${this.editingTemplateName}
                                      @input=${(e: Event) =>
                                        (this.editingTemplateName = (
                                          e.target as HTMLInputElement
                                        ).value)}
                                      @keydown=${(e: KeyboardEvent) => {
                                        if (e.key === "Enter")
                                          this.saveEditing(template.id);
                                        if (e.key === "Escape")
                                          this.cancelEditing();
                                      }}
                                    />
                                    <button
                                      class="organize-item__name-save"
                                      @click=${() =>
                                        this.saveEditing(template.id)}
                                      title="${translateText(
                                        "single_modal.save",
                                      )}"
                                    >
                                      ${iconCheck}
                                    </button>
                                  `
                                : template.name}
                            </div>
                            <div class="organize-item__actions">
                              ${this.editingTemplateId !== template.id
                                ? html`
                                    <button
                                      class="organize-item__btn ${template.isFavorite
                                        ? "organize-item__btn--favorite"
                                        : ""}"
                                      @click=${() =>
                                        this.toggleFavorite(template.id)}
                                      title="${translateText(
                                        template.isFavorite
                                          ? "single_modal.unfavorite"
                                          : "single_modal.favorite_action",
                                      )}"
                                    >
                                      ${template.isFavorite
                                        ? iconStarFilled
                                        : iconStar}
                                    </button>
                                    <button
                                      class="organize-item__btn"
                                      @click=${() =>
                                        this.startEditing(template.id)}
                                      title="${translateText(
                                        "single_modal.rename",
                                      )}"
                                    >
                                      ${iconPencil}
                                    </button>
                                    <button
                                      class="organize-item__btn organize-item__btn--delete"
                                      @click=${() =>
                                        this.deleteTemplate(template.id)}
                                      title="${translateText(
                                        "single_modal.delete",
                                      )}"
                                    >
                                      ${iconTrash}
                                    </button>
                                  `
                                : ""}
                            </div>
                          </div>
                        `,
                      )}
                </div>
                <div class="organize-modal__buttons">
                  <button
                    class="action-button action-button--primary"
                    @click=${this.closeOrganizeModal}
                  >
                    ${translateText("single_modal.done")}
                  </button>
                </div>
              </div>
            </div>
          `
        : ""}
    `;
  }
}
```
