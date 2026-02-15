# Prompt Template for AI Agents to Apply Patches

Use this prompt when asking AI agents to apply custom patches to the OpenFront codebase.

---

## Standard Prompt

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

---

## Detailed Prompt (for complex scenarios)

```
I need you to apply custom patches to this codebase after an upstream update. The patches are part of a modular patch management system.

SYSTEM OVERVIEW:
- Patch registry: `.claude/PATCHES-index.yaml` (master list with metadata)
- Patch files: `.claude/patches/PATCH-*.md` (individual patch instructions)
- Documentation: `.claude/PATCH-SYSTEM.md` (how the system works)
- Configuration: `.claude/custom-config.ts` (feature toggles)

YOUR TASK:

Step 1: Read the Patch Registry
- Open `.claude/PATCHES-index.yaml`
- Parse the YAML to understand:
  - Which patches are enabled (`enabled: true`)
  - What order to apply them (`application_order` list)
  - What dependencies exist
  - What files each patch modifies

Step 2: Apply Patches in Order
For each patch ID in `application_order`:
  a) Check if enabled - skip if `enabled: false`
  b) Read the patch file: `.claude/patches/PATCH-{id}.md`
  c) Parse YAML frontmatter for:
     - Target files
     - Number of expected changes
     - Dependencies
  d) Read Markdown body for:
     - Description of what the patch does
     - Step-by-step implementation instructions
     - Before/after code examples
     - Pattern matching rules
  e) Apply the patch:
     - Use pattern matching to find injection points
     - Don't rely on line numbers (they may have shifted)
     - Add `// CUSTOM:` comments as shown
     - Preserve indentation and formatting
  f) Verify the change was made correctly

Step 3: Handle Dependencies
- Ensure `.claude/custom-config.ts` exists before applying patches that depend on it
- Ensure `.env` file exists for patches that use environment variables
- Check dependency list in YAML frontmatter

Step 4: Error Handling
- If a pattern isn't found: report the issue and suggest manual review
- If a file doesn't exist: report missing file
- If a patch is already applied: skip it (detect by `// CUSTOM:` markers)
- If there are conflicts: report them clearly

Step 5: Verification
After applying all patches:
- Search for all `// CUSTOM:` comments: `grep -r "CUSTOM:" src/`
- Verify count matches expected total from YAML metadata
- Check that TypeScript compiles without errors
- Verify no duplicate patches were applied

Step 6: Report Results
Provide a summary:
```

# Patch Application Report

✅ Successfully applied: X/Y patches
❌ Failed: Z patches

Details:
✅ vite-logger - Applied 2 changes to vite.config.ts
✅ console-override - Applied 2 changes to src/client/Main.ts
❌ disable-ads - Pattern not found in src/client/Main.ts (line may have moved)

Next Steps:

- Review failed patches manually
- Run `pnpm dev:client` and `pnpm dev:server` to verify
- Check console output for any errors

```

CRITICAL RULES:
1. NEVER modify patch files themselves
2. NEVER skip the `// CUSTOM:` markers
3. ALWAYS use pattern matching, not line numbers
4. ALWAYS preserve original code formatting
5. DON'T "improve" or refactor the patch code
6. DO apply patches exactly as written

If you encounter any ambiguity or conflicts, STOP and report rather than guessing.
```

---

## Quick Prompt (for routine re-application)

```
Re-apply all enabled patches from `.claude/PATCHES-index.yaml`. Follow the instructions in each patch file under `.claude/patches/`. Use pattern matching to find injection points, mark all changes with `// CUSTOM:` comments, and report any failures.
```

---

## Verification-Only Prompt

```
Verify that all enabled patches from `.claude/PATCHES-index.yaml` are currently applied to the codebase. For each enabled patch:
1. Read the patch file from `.claude/patches/`
2. Check that the expected code changes are present
3. Look for `// CUSTOM:` markers matching the patch
4. Report status: ✅ fully applied, ⚠️ partially applied, or ❌ not applied

Provide a summary of verification results.
```

---

## Context-Aware Prompt (after git merge)

```
I just merged changes from upstream and some patches may have been overwritten. Please:

1. Check which patch files were affected by reading `git diff HEAD .claude/`
2. Read `.claude/PATCHES-index.yaml` to see which patches are enabled
3. For each enabled patch, verify if it's still applied by checking for `// CUSTOM:` markers
4. Re-apply any patches that were lost during the merge
5. Report which patches needed to be re-applied

Start by running `git status` and `grep -r "CUSTOM:" src/` to understand the current state.
```

---

## Tips for Writing Custom Prompts

### Do's:

- ✅ Reference the YAML index as the source of truth
- ✅ Emphasize pattern matching over line numbers
- ✅ Request a summary report at the end
- ✅ Mention the documentation files for context
- ✅ Ask for verification after applying
- ✅ Specify to preserve `// CUSTOM:` markers

### Don'ts:

- ❌ Don't ask the agent to modify the patch files
- ❌ Don't specify line numbers (they change)
- ❌ Don't ask to "improve" the patches
- ❌ Don't skip verification steps
- ❌ Don't assume patches are applied in any order other than `application_order`

### Key Phrases to Include:

- "Read `.claude/PATCHES-index.yaml`"
- "Follow the `application_order`"
- "Use pattern matching, not line numbers"
- "Mark changes with `// CUSTOM:` comments"
- "Verify each patch after applying"
- "Report any failures clearly"

---

## Example Conversation Flow

**User:** [Uses standard prompt above]

**Agent:**

```
Reading patch registry from .claude/PATCHES-index.yaml...
Found 9 patches, 9 enabled.

Applying patches in dependency order:
1. ✅ npmrc - Created .npmrc file
2. ✅ vite-logger - Applied to vite.config.ts (2 changes)
3. ✅ console-override - Applied to src/client/Main.ts (2 changes)
...

Summary: Successfully applied 9/9 patches
All changes marked with // CUSTOM: comments
Ready for verification.
```

**User:** "Please verify the patches were applied correctly"

**Agent:**

```
Verifying patches...
Running: grep -r "CUSTOM:" src/

Found 24 CUSTOM markers (expected 24)
✅ All patches verified successfully

Files modified:
- vite.config.ts (2 markers)
- .npmrc (1 marker)
- src/client/Main.ts (3 markers)
...

All patches are correctly applied.
```

---

## Troubleshooting Prompts

### If patches fail to apply:

```
Some patches failed to apply. For each failed patch:
1. Show me the pattern it was searching for
2. Search the target file for similar patterns
3. Show me the current code at that location
4. Suggest whether the pattern needs updating or if manual intervention is needed
```

### If unclear about patch state:

```
I'm not sure if patches are applied. Please:
1. Count all `// CUSTOM:` markers in the codebase
2. Compare with expected count from PATCHES-index.yaml
3. List any patches that appear to be missing
4. Show me the current state of each target file
```

### After major upstream changes:

```
There was a major upstream refactor. Please:
1. Read UPDATE-GUIDE.md for pattern matching strategies
2. For each enabled patch, try to find the injection point
3. If a pattern fails, search for related code in nearby files
4. Report any patches that need to be manually updated
5. Suggest new patterns for patches that failed
```
