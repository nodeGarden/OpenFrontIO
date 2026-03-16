# Modular Patch System Documentation

## Overview

This is a modular patch management system designed to make custom code modifications maintainable across upstream updates. It separates patches into individual files and uses a registry to control which patches are applied.

## Design Goals

1. **Modularity**: Each feature modification is an independent patch file
2. **Selectivity**: Enable/disable patches without editing code
3. **Clarity**: Each patch is self-documenting with instructions
4. **Automation**: AI agents can parse and apply patches automatically
5. **Extensibility**: Easy to add new patches as the project evolves
6. **Shareability**: The pattern can be extracted and used in other projects

## Directory Structure

```
.claude/
├── patches/                    # Individual patch files
│   ├── PATCH-vite-logger.md
│   ├── PATCH-console-override.md
│   ├── PATCH-disable-ads.md
│   └── ...
├── PATCHES-index.yaml         # Master registry (YAML format)
├── PATCHES.md                 # Master registry (Markdown format)
├── PATCH-SYSTEM.md           # This documentation
├── custom-config.ts          # Runtime configuration
└── UPDATE-GUIDE.md           # AI agent instructions
```

## Two Format Options

### Option A: YAML Index (Recommended for Automation)

**File**: `PATCHES-index.yaml`

**Pros**:

- Easy to parse programmatically
- Structured metadata (dependencies, priority, tags)
- Can filter/query patches easily
- Better for automation scripts
- Clear enable/disable flags
- Explicit application order

**Example**:

```yaml
patches:
  - id: vite-logger
    name: "Vite Custom Logger"
    file: "patches/PATCH-vite-logger.md"
    enabled: true
    category: "build"
    priority: "medium"
    files_modified: 1
    dependencies: []
    tags: ["build", "vite", "logging"]
    description: "Suppress noisy Vite build warnings"
```

**Agent Usage**:

```typescript
// Parse YAML
const registry = parseYAML("PATCHES-index.yaml");

// Get enabled patches
const enabledPatches = registry.patches.filter((p) => p.enabled);

// Apply in order
for (const patchId of registry.application_order) {
  const patch = enabledPatches.find((p) => p.id === patchId);
  if (patch) {
    applyPatch(patch.file);
  }
}
```

### Option B: Markdown Index (Better for Humans)

**File**: `PATCHES.md`

**Pros**:

- Human-readable at a glance
- Rich formatting (tables, checkboxes, links)
- GitHub renders nicely
- Easier to edit manually
- Can include more context/notes

**Example**:

```markdown
## Active Patches

| Patch                                       | Enabled | Priority | Files | Description            |
| ------------------------------------------- | ------- | -------- | ----- | ---------------------- |
| [Vite Logger](patches/PATCH-vite-logger.md) | ✅      | Medium   | 1     | Suppress Vite warnings |
```

### Option C: Hybrid Approach (Best of Both Worlds)

Use YAML frontmatter in Markdown files:

**Individual Patch Files**:

```markdown
---
id: vite-logger
enabled: true
priority: medium
dependencies: []
tags: [build, vite, logging]
---

# Vite Custom Logger

[Markdown content here]
```

**Pros**:

- Structured metadata for agents (YAML frontmatter)
- Rich documentation for humans (Markdown body)
- Single file format
- Best of both worlds

## Patch File Structure

Each patch file contains:

### 1. Header Section

- Patch ID and name
- Category (build, logging, features, etc.)
- Priority (high, medium, low)
- Enabled/disabled status
- Files modified count
- Dependencies
- Tags for filtering

### 2. Description

- What the patch does
- Why it's needed
- What problem it solves

### 3. Configuration (if applicable)

- Related config options
- Environment variables
- Runtime settings

### 4. Implementation Details

- Step-by-step instructions
- Before/after code examples
- File paths and line numbers (as hints, not requirements)

### 5. Pattern Matching

- Search patterns to find injection points
- Bash commands to locate code
- Patterns that survive line number changes

### 6. Verification

- How to test the patch worked
- Expected behavior
- What should/shouldn't appear in console

### 7. Rollback

- How to disable the patch
- How to revert changes
- Rebuild instructions

### 8. Metadata

- Dependencies on other patches
- Related patches
- Tags for categorization

## Registry Structure

The registry (`PATCHES-index.yaml` or `PATCHES.md`) contains:

### 1. Patch List

- All available patches
- Enable/disable status for each
- Priority levels
- Dependencies

### 2. Dependencies

- Special dependencies (config files, env files)
- What patches require them

### 3. Application Order

- Dependency-based ordering
- Ensures patches apply in correct sequence

## How AI Agents Use This System

### Step 1: Read Registry

```typescript
const registry = readRegistry("PATCHES-index.yaml");
```

### Step 2: Filter Enabled Patches

```typescript
const enabledPatches = registry.patches
  .filter((p) => p.enabled)
  .sort((a, b) => getPriorityValue(a) - getPriorityValue(b));
```

### Step 3: Check Dependencies

```typescript
for (const patch of enabledPatches) {
  if (!checkDependencies(patch.dependencies)) {
    warn(`Skipping ${patch.id}: missing dependencies`);
    continue;
  }
}
```

### Step 4: Apply in Order

```typescript
for (const patchId of registry.application_order) {
  const patch = enabledPatches.find((p) => p.id === patchId);
  if (patch) {
    console.log(`Applying: ${patch.name}`);
    applyPatch(patch.file);
  }
}
```

### Step 5: Verify

```typescript
for (const patch of appliedPatches) {
  verify(patch);
}
```

## Upstream PR Patches

A special patch type for changes cherry-picked from upstream pull requests that haven't been merged yet. These patches track their source PR and can be automatically detected as redundant once the PR is merged into the main branch.

### YAML Frontmatter Fields

```yaml
---
id: pr-3425-train-gold
name: "Asymmetric Train Gold Rewards"
category: upstream-pr
priority: medium
enabled: true
source:
  type: github-pr
  repo: openfrontio/OpenFrontIO
  pr: 3425
  title: "feat: asymmetric train gold rewards (factory owner +5k over city owner)"
  author_discord: ""
  fetched_at: "2026-03-16"
upstream_status: open # open | merged | closed
merged_to_main: false # true once PR is merged into main branch
notes: "" # Additional instructions or context
files_modified: 5
target_files:
  - path: src/core/configuration/Config.ts
  - path: src/core/configuration/DefaultConfig.ts
  - path: src/core/execution/nation/NationStructureBehavior.ts
  - path: src/core/game/TrainStation.ts
  - path: tests/core/game/TrainStation.test.ts
---
```

### Key Fields

| Field                   | Description                                                    |
| ----------------------- | -------------------------------------------------------------- |
| `source.type`           | Always `github-pr` for PR-sourced patches                      |
| `source.repo`           | GitHub repo in `owner/name` format                             |
| `source.pr`             | PR number                                                      |
| `source.title`          | Original PR title                                              |
| `source.author_discord` | PR author's Discord (for contact if issues arise)              |
| `source.fetched_at`     | Date the diff was fetched and applied                          |
| `upstream_status`       | Current PR status: `open`, `merged`, or `closed`               |
| `merged_to_main`        | Set to `true` when the PR is merged — patch becomes redundant  |
| `notes`                 | Additional instructions, caveats, or modifications made on top |

### Lifecycle

1. **Applied**: PR diff is fetched and applied to our branch. Patch file documents the source.
2. **Active**: `upstream_status: open`, `merged_to_main: false` — patch is providing functionality not yet in main.
3. **Redundant**: `upstream_status: merged`, `merged_to_main: true` — after next upstream merge, this patch is no longer needed.
4. **Cleanup**: After merging upstream (which includes the PR), remove the patch file and registry entry.

### Checking Upstream Status

```bash
# Check if a PR has been merged
gh pr view openfrontio/OpenFrontIO --json state,mergedAt < PR_NUMBER > --repo

# Batch check all upstream-pr patches
for pr in 3425 3397 3383 3430; do
  echo -n "PR #$pr: "
  gh pr view $pr --repo openfrontio/OpenFrontIO --json state --jq '.state'
done
```

### When Upstream Merges

After pulling upstream changes that include a merged PR:

1. The patch's code changes are now in main — our patch is redundant
2. Update the patch: `upstream_status: merged`, `merged_to_main: true`, `enabled: false`
3. Verify no conflicts with our other patches
4. Optionally delete the patch file and registry entry

---

## Adding New Patches

### 1. Create Patch File

```bash
touch .claude/patches/PATCH-new-feature.md
```

### 2. Write Patch Content

Follow the structure template:

- Header with metadata
- Description
- Implementation steps
- Pattern matching
- Verification
- Rollback

### 3. Register in Index

Add to `PATCHES-index.yaml`:

```yaml
patches:
  - id: new-feature
    name: "New Feature Name"
    file: "patches/PATCH-new-feature.md"
    enabled: true
    category: "features"
    priority: "medium"
    files_modified: 1
    dependencies: []
    tags: ["tag1", "tag2"]
    description: "What it does"
```

### 4. Update Application Order

Add to `application_order` if it has dependencies:

```yaml
application_order:
  # ... existing patches
  - "dependency-patch"
  - "new-feature" # After dependencies
```

## Disabling Patches

### Temporarily Disable

In `PATCHES-index.yaml`, set `enabled: false`:

```yaml
patches:
  - id: vite-logger
    enabled: false # Disabled
```

### Permanently Remove

1. Delete the patch file
2. Remove from registry
3. Remove from `application_order`
4. Remove from any dependencies lists

## Use Cases

### Use Case 1: Clean Dev After Upstream Update

```bash
# User pulls upstream changes
git pull upstream main

# Patches were overwritten, re-apply them
# AI agent reads PATCHES-index.yaml
# Applies all enabled patches in order
# Verifies each patch
```

### Use Case 2: Selective Feature Control

```yaml
# Disable ads for local dev
- id: disable-ads
  enabled: true
# But enable them for staging tests
# (temporarily set enabled: false)
```

### Use Case 3: Patch Development

```yaml
# Developing a new patch
- id: experimental-feature
  enabled: false # Test manually first

# Once stable
- id: experimental-feature
  enabled: true # Enable for all
```

## Benefits of This System

### 1. Maintainability

- Each patch is independent
- Easy to update individual patches
- Clear documentation prevents confusion

### 2. Flexibility

- Enable/disable without code changes
- Add new patches without affecting existing ones
- Customize per environment (dev/staging/prod)

### 3. Transparency

- All modifications documented
- Easy to understand what's changed
- Easy to review before applying

### 4. Automation

- AI agents can apply patches automatically
- Structured data enables smart tooling
- Verification steps ensure correctness

### 5. Shareability

- Pattern can be extracted to other projects
- Self-contained system
- Minimal dependencies

## Future Enhancements & Script Requirements

### 1. Patch Application Script

**Purpose**: Automatically apply all enabled patches from PATCHES-index.yaml

**Requirements**:

- Parse PATCHES-index.yaml to get patch list
- Filter for `enabled: true` patches
- Apply patches in dependency order (use `application_order` field)
- For each patch:
  - Parse YAML frontmatter to get metadata
  - Parse Markdown body for implementation instructions
  - Use pattern matching (grep/sed) to find injection points
  - Apply code changes
  - Mark patch as applied (track state)
- Error handling:
  - If pattern not found, report error and suggest manual review
  - If file doesn't exist, warn but continue
  - If patch already applied (detect `// CUSTOM:` comments), skip
- Output:
  - Success/failure for each patch
  - Summary: X/Y patches applied successfully
  - List of failed patches with reasons
- Dry-run mode: Show what would be done without making changes

**Example Implementation**:

```bash
#!/bin/bash
# apply-patches.sh - Apply all enabled patches

set -e

YAML_FILE=".claude/PATCHES-index.yaml"
PATCHES_DIR=".claude/patches"

# Parse YAML and extract enabled patches
# For each patch in application_order:
#   1. Read patch file
#   2. Extract YAML frontmatter
#   3. Check if enabled
#   4. Find target files
#   5. Apply pattern matching and code injection
#   6. Verify changes
#   7. Log result

# Report summary
echo "Applied X/Y patches successfully"
```

### 2. Patch Verification Tool

**Purpose**: Verify all enabled patches are currently applied to the codebase

**Requirements**:

- Read PATCHES-index.yaml for enabled patches
- For each enabled patch:
  - Read target files from YAML frontmatter
  - Search for `// CUSTOM:` markers that match patch ID
  - Verify expected code patterns exist
  - Count expected vs actual changes
- Output:
  - ✅ Patch fully applied
  - ⚠️ Patch partially applied (X/Y changes found)
  - ❌ Patch not applied
- Summary report:
  - Total patches: X
  - Fully applied: Y
  - Partially applied: Z
  - Missing: W
- Exit code: 0 if all applied, 1 if any missing

**Example Implementation**:

```bash
#!/bin/bash
# verify-patches.sh - Verify patch application status

for patch in $(get_enabled_patches); do
  check_custom_markers "$patch"
  verify_code_patterns "$patch"
  report_status "$patch"
done
```

### 3. Interactive Patch Manager

**Purpose**: CLI tool for managing patches interactively

**Requirements**:

- Commands:
  - `list` - Show all patches with status (enabled/disabled/applied)
  - `show <patch-id>` - Display patch details and current application status
  - `enable <patch-id>` - Enable patch in YAML registry
  - `disable <patch-id>` - Disable patch in YAML registry
  - `apply [patch-id]` - Apply specific patch or all enabled patches
  - `unapply <patch-id>` - Remove patch from codebase
  - `verify [patch-id]` - Verify specific patch or all patches
  - `status` - Show overall system status
- Features:
  - Colored output (green=applied, red=not applied, yellow=partial)
  - Interactive prompts for dangerous operations
  - Dependency checking (warn if disabling patch that others depend on)
  - Git integration (offer to commit after applying patches)
- Configuration:
  - Support for multiple environments (dev/staging/prod)
  - Profile support (different patch sets for different use cases)

**Example Usage**:

```bash
patch-manager list
# Output:
# ✅ vite-logger (enabled, applied)
# ✅ console-override (enabled, applied)
# ❌ disable-ads (enabled, not applied)
# ⚪ experimental-feature (disabled)

patch-manager apply disable-ads
# Applying patch: disable-ads
# ✅ Applied 1/1 changes to src/client/Main.ts
# Success!

patch-manager verify
# Verifying all patches...
# ✅ 8/9 patches fully applied
# ⚠️  1 patch partially applied: disable-ads (missing import)
```

### 4. Git Hook Integration

**Purpose**: Automatically re-apply patches after git operations

**Requirements**:

- Post-merge hook: Re-apply patches after pulling upstream changes
- Pre-commit hook: Verify patches are still applied before commit
- Post-checkout hook: Re-apply patches when switching branches
- Options:
  - Auto-apply mode: Silently re-apply all patches
  - Interactive mode: Prompt before applying
  - Verify-only mode: Just check, don't apply
- Handle conflicts:
  - If patch fails to apply, create conflict markers
  - Offer to open affected files in editor
  - Log failures for manual resolution

**Example Hook**:

```bash
#!/bin/bash
# .git/hooks/post-merge

echo "Re-applying custom patches..."
.claude/apply-patches.sh || {
  echo "⚠️  Some patches failed to apply"
  echo "Run 'patch-manager verify' to see details"
  exit 0 # Don't fail the merge
}
```

### 5. Patch Conflict Detection

**Purpose**: Detect when upstream changes conflict with patch injection points

**Requirements**:

- Before applying patches, check if patterns still exist
- Compare current code with expected patterns from patch files
- Detect:
  - Missing injection points (pattern not found)
  - Modified injection points (pattern found but context changed)
  - File structure changes (target file moved/deleted)
- Output:
  - Warning for each conflict with location info
  - Suggest alternative patterns or manual review
  - Show diff between expected and actual code
- Integration:
  - Run automatically in apply-patches script
  - Available as standalone command
  - Report in verify-patches output

**Example Output**:

```
⚠️  Conflict detected in vite-logger patch:
  File: vite.config.ts
  Pattern: "return {"
  Issue: Pattern found 3 times (expected 1)
  Suggestion: Use more specific pattern or add line number hint

⚠️  Conflict detected in console-override patch:
  File: src/client/Main.ts
  Pattern: "import { customConfig }"
  Issue: Pattern not found
  Suggestion: Check if file was refactored or import moved
```

### 6. Patch Testing Framework

**Purpose**: Automatically test patches in isolation

**Requirements**:

- Create clean test environment (fresh git worktree)
- Apply patch
- Run verification commands from patch file
- Check for expected outcomes
- Clean up test environment
- Report results

### 7. Patch Generator

**Purpose**: Generate patch files from existing code modifications

**Requirements**:

- Scan codebase for `// CUSTOM:` markers
- Extract code blocks and context
- Generate patch file with:
  - YAML frontmatter (auto-populated)
  - Before/after code blocks
  - Pattern matching rules
  - Verification steps
- Interactive mode to refine generated patch
- Add to PATCHES-index.yaml automatically

## Recommendations

### For This Project

**Choose Option A (YAML Index)** because:

1. Better for AI agent automation
2. Structured metadata enables smart features
3. Easy to parse and query
4. Clear dependency management
5. Explicit application order

**Use Hybrid Patch Files** (YAML frontmatter + Markdown):

- Agents parse frontmatter for metadata
- Humans read Markdown for instructions
- Best of both worlds

### For General Pattern

This pattern works well for:

- Projects with frequent upstream updates
- Projects with custom modifications
- Teams using AI coding assistants
- Open source forks needing to track changes
- Projects with multiple deployment environments

## Example Workflow

### Initial Setup

```bash
# 1. Create patch system
mkdir -p .claude/patches

# 2. Document existing customizations as patches
# Each modification becomes a patch file

# 3. Create registry
# List all patches in PATCHES-index.yaml

# 4. Verify all patches
# Test that they apply correctly
```

### After Upstream Update

```bash
# 1. Pull upstream changes
git pull upstream main

# 2. Check what broke
git diff HEAD .claude/

# 3. Re-apply patches (AI agent does this)
# Reads PATCHES-index.yaml
# Applies enabled patches in order

# 4. Verify and test
pnpm dev:client
pnpm dev:server

# 5. Fix any conflicts manually
# Update patch files if needed
```

### Adding New Feature

```bash
# 1. Create patch file
touch .claude/patches/PATCH-new-feature.md

# 2. Document the modification
# Write patch file following template

# 3. Register in index
# Add to PATCHES-index.yaml

# 4. Test the patch
# Verify it applies correctly

# 5. Enable in registry
enabled: true
```

## Migration Path

To convert existing `PATCHES.md` to this system:

1. **Create directory structure**

   ```bash
   mkdir -p .claude/patches
   ```

2. **Extract each patch section** from PATCHES.md into individual files

3. **Create registry** (PATCHES-index.yaml) with metadata

4. **Update individual patches** with pattern matching instructions

5. **Test patch application** to verify everything works

6. **Archive old PATCHES.md** or convert to index format

## AI Agent Prompts

### Standard Prompt (Recommended)

Use this prompt when asking AI agents to apply patches:

```
Please apply all enabled custom patches to this codebase using the modular patch system.

INSTRUCTIONS:

1. Read `.claude/PATCHES-index.yaml` to get the list of enabled patches and their application order
2. For each patch ID in the `application_order` list:
   - Check if the patch is enabled (`enabled: true`)
   - If enabled, read the corresponding patch file from `.claude/patches/PATCH-{id}.md`
   - Parse the YAML frontmatter for metadata
   - Follow the implementation instructions in the Markdown body
   - Apply changes to the target files listed
   - Mark all changes with `// CUSTOM:` comments as shown in the patch
3. After applying all patches, verify:
   - All files compile without errors
   - All `// CUSTOM:` markers are present
   - Pattern matching was successful
4. Report:
   - Number of patches applied successfully
   - Any patches that failed (with reasons)
   - Any files that couldn't be found or modified

IMPORTANT:
- Use pattern matching (grep/search) to find injection points, NOT line numbers
- Preserve existing code formatting and indentation
- Don't apply patches that are already applied (check for `// CUSTOM:` markers)
- If a pattern isn't found, report it but continue with other patches
- Follow the exact code from the patch files, don't modify or "improve" it

See `.claude/PATCH-SYSTEM.md` for detailed documentation on how the patch system works.
```

### Quick Prompt (Fast Re-application)

```
Re-apply all enabled patches from `.claude/PATCHES-index.yaml`. Follow the instructions in each patch file under `.claude/patches/`. Use pattern matching to find injection points, mark all changes with `// CUSTOM:` comments, and report any failures.
```

### After Git Merge (Upstream Updates)

```
I just merged changes from upstream and some patches may have been overwritten. Please:

1. Check which patch files were affected by reading `git diff HEAD .claude/`
2. Read `.claude/PATCHES-index.yaml` to see which patches are enabled
3. For each enabled patch, verify if it's still applied by checking for `// CUSTOM:` markers
4. Re-apply any patches that were lost during the merge
5. Report which patches needed to be re-applied

Start by running `git status` and `grep -r "CUSTOM:" src/` to understand the current state.
```

### Verification Only (Check Status)

```
Verify that all enabled patches from `.claude/PATCHES-index.yaml` are currently applied to the codebase. For each enabled patch:
1. Read the patch file from `.claude/patches/`
2. Check that the expected code changes are present
3. Look for `// CUSTOM:` markers matching the patch
4. Report status: ✅ fully applied, ⚠️ partially applied, or ❌ not applied

Provide a summary of verification results.
```

### Key Elements for Custom Prompts

When writing your own prompts, always include:

- ✅ Reference to `.claude/PATCHES-index.yaml`
- ✅ Instruction to follow `application_order`
- ✅ Emphasis on pattern matching (NOT line numbers)
- ✅ Requirement to mark changes with `// CUSTOM:` comments
- ✅ Verification step after applying
- ✅ Clear error reporting

See **[APPLY-PATCHES-PROMPT.md](APPLY-PATCHES-PROMPT.md)** for more prompt templates and examples.

---

## Future: Claude Skill

**Goal**: Create a reusable Claude Code skill for patch management

**Vision**: Package this patch system as a Claude skill that can be:

- Invoked with `/apply-patches` command
- Shared across projects
- Published to the Claude skill marketplace
- Used by any project with a similar patch structure

**Skill Features**:

- Auto-detect patch system in project (look for `.claude/PATCHES-index.yaml`)
- Interactive mode: Ask user which patches to apply
- Automatic mode: Apply all enabled patches
- Verification mode: Check patch application status
- Conflict detection: Warn about upstream changes
- Status reporting: Show patch application summary

**Skill Commands**:

```bash
/apply-patches        # Apply all enabled patches
/apply-patches verify # Verify patches are applied
/apply-patches status # Show current patch status
/apply-patches list   # List all available patches
/apply-patches help   # Show patch system documentation
```

**Development Roadmap**:

1. Prototype with existing prompt templates
2. Create skill manifest and configuration
3. Add interactive prompts for user input
4. Implement state tracking (which patches are applied)
5. Add dry-run mode for safety
6. Test across multiple projects
7. Document skill usage and API
8. Publish to skill registry

**Why a Skill?**

- Reusable across all projects with patch systems
- Consistent behavior and interface
- Built-in error handling and validation
- Easy to share with team/community
- Versioned and maintainable
- Can include sophisticated logic (conflict resolution, rollback, etc.)

**When to Build**: After validating the patch system works well in practice and has proven valuable for maintaining custom modifications across upstream updates.

---

## Related Documentation

- **PATCHES-index.yaml**: Master patch registry
- **UPDATE-GUIDE.md**: Detailed AI agent instructions
- **APPLY-PATCHES-PROMPT.md**: AI agent prompt templates
- **custom-config.ts**: Runtime configuration
- **FEATURE-SUMMARY.md**: Lost features from previous branches

---

## Questions or Contributions

This system is designed to be:

- **Flexible**: Adapt it to your needs
- **Extensible**: Add new patch types easily
- **Portable**: Extract and use in other projects

If this pattern proves useful, consider:

1. Extracting to a separate repo
2. Creating tooling around it
3. Sharing with the community
4. Building a patch marketplace/library

The patch system is a living document - improve it as you discover better patterns!
