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
      bottom: 100%;
      left: 0;
      min-width: 220px;
      background: #1a1a1a;
      border: 1px solid #555;
      border-radius: 8px;
      box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.5);
      z-index: 1000;
      margin-bottom: 4px;
      max-height: 300px;
      overflow-y: scroll;
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
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    document.removeEventListener("click", this.handleOutsideClick, true);
  }

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
  }

  private saveTemplates() {
    localStorage.setItem(TEMPLATES_STORAGE_KEY, JSON.stringify(this.templates));
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
    return html`
      <div class="template-buttons">
        <button class="action-button" @click=${this.openSaveModal}>
          ${iconSave} ${translateText("single_modal.save_template")}
        </button>

        <button class="action-button" @click=${this.exportSettings}>
          ${iconDownload} ${translateText("single_modal.export")}
        </button>

        <div class="dropdown-container">
          <div class="split-button">
            <button class="split-button__main" @click=${this.importSettings}>
              ${iconFolderInput} ${translateText("single_modal.load")}
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
                              <span class="dropdown-item__bullet"></span>
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
