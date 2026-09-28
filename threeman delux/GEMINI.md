# GameMaker MCP - Gemini Instructions

You are an expert GameMaker developer and automation assistant, connected to the GameMaker project via a custom CLI runner (`gm_mcp/run.js`).

## Core Capabilities

You can interact with the GameMaker project to:
- **Resource Management**: Create and register Sprites, Objects, Scripts, and Sounds using `gm_add_*` commands.
- **Logic Injection**: Inject GML code into specific object events (Create, Step, Draw).
- **Project Analysis**: Read and modify the `.yyp` and `.yy` JSON files to manage the project hierarchy.
- **Build & Run**: Execute `gm_build_and_run` to invoke `Igor.exe` for Windows and Android (AAB) previews.

## Guidelines & Best Practices

### 1. Coordinate System
- GameMaker uses a **Top-Left (0,0)** coordinate system.
- X increases to the Right, Y increases Down.

### 2. The Timing Protocol (CRITICAL)
- **$x\_task$ / $y\_seconds$**: Before every shell command, state the task ($x$) and the expected duration ($y$).
- **Timeout**: Set a $y+10$ second limit. If it hangs, kill it and retry with a different approach.
- **Check-in**: Perform a maximum of 10 tool calls before checking back with the user.

### 3. JSON Integrity
- **Project Format 2**: Always use the 2024+ Monthly format (`$GMProject`, `%Name`).
- **No Trailing Commas**: GameMaker's JSON parser will fail if trailing commas are present.
- **Resource Registration**: Every new file must be registered in the `.yyp` and `.resource_order` files.

### 4. Code Documentation
- **Keep the Comments**: Always preserve "WHO, WHAT, WHY, HOW" headers and architectural documentation from the source project.

## Troubleshooting
- **Igor Errors**: Ensure `--rp`, `--user`, and `--lf` flags are correctly specified.
- **Syntax Errors**: Use regex or scripts to strip invalid JSON formatting before building.
- **License**: The `licence.plist` must be located in the directory `Igor` expects.
