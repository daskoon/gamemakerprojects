
const { Server } = require("@modelcontextprotocol/sdk/server/index.js");
const { StdioServerTransport } = require("@modelcontextprotocol/sdk/server/stdio.js");
const {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} = require("@modelcontextprotocol/sdk/types.js");
const { z } = require("zod");
const fs = require("fs");
const path = require("path");

/**
 * WHAT: GameMaker "Director's Cut" MCP Server.
 * WHY: To provide the AI with programmatic control over a GameMaker 2024+ project.
 * HOW: Manipulates .yyp and .yy JSON files to inject resources and GML logic.
 */

const projectRoot = path.resolve(__dirname, "..");
const yypPath = path.join(projectRoot, "threeman delux.yyp");

function readYYP() {
  return JSON.parse(fs.readFileSync(yypPath, "utf8"));
}

function writeYYP(yyp) {
  fs.writeFileSync(yypPath, JSON.stringify(yyp, null, 2));
}

const server = new Server(
  {
    name: "gamemaker-director",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "gm_add_script",
        description: "Creates a global GML script and registers it in the project.",
        inputSchema: {
          type: "object",
          properties: {
            name: { type: "string", description: "Name of the script (e.g. scr_rules)" },
            code: { type: "string", description: "GML code for the script" },
          },
          required: ["name", "code"],
        },
      },
      {
        name: "gm_add_object",
        description: "Creates a GameMaker object with optional Create and Step events.",
        inputSchema: {
          type: "object",
          properties: {
            name: { type: "string", description: "Name of the object (e.g. obj_controller)" },
            create_code: { type: "string", description: "GML for the Create event" },
            step_code: { type: "string", description: "GML for the Step event" },
            sprite_name: { type: "string", description: "Optional sprite name to assign" },
          },
          required: ["name"],
        },
      },
      {
        name: "gm_add_sprite_from_web",
        description: "Ports a sprite from the web project assets to the GameMaker project.",
        inputSchema: {
          type: "object",
          properties: {
            name: { type: "string", description: "Name of the sprite" },
            web_path: { type: "string", description: "Path in Three_Man_Web_Skoon/..." },
          },
          required: ["name", "web_path"],
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  switch (name) {
    case "gm_add_script": {
      const { name, code } = args;
      const scriptDir = path.join(projectRoot, "scripts", name);
      if (!fs.existsSync(scriptDir)) fs.mkdirSync(scriptDir, { recursive: true });

      const yy = {
        "resourceType": "GMScript",
        "resourceVersion": "2.0",
        "name": name,
        "isCompatibility": false,
        "isDnD": false,
        "parent": { "name": "Scripts", "path": "folders/Scripts.yy" },
      };

      fs.writeFileSync(path.join(scriptDir, `${name}.yy`), JSON.stringify(yy, null, 2));
      fs.writeFileSync(path.join(scriptDir, `${name}.gml`), code);

      const yyp = readYYP();
      const resourceEntry = { id: { name: name, path: `scripts/${name}/${name}.yy` } };
      if (!yyp.resources.some(r => r.id.name === name)) {
          yyp.resources.push(resourceEntry);
          writeYYP(yyp);
      }

      return { content: [{ type: "text", text: `Successfully added script ${name}` }] };
    }

    case "gm_add_object": {
        const { name, create_code, step_code, sprite_name } = args;
        const objDir = path.join(projectRoot, "objects", name);
        if (!fs.existsSync(objDir)) fs.mkdirSync(objDir, { recursive: true });

        const eventList = [];
        if (create_code) {
            fs.writeFileSync(path.join(objDir, "Create_0.gml"), create_code);
            eventList.push({ "resourceType":"GMEvent","resourceVersion":"2.0","name":"","collisionObjectId":null,"eventNum":0,"eventType":0,"isDnD":false });
        }
        if (step_code) {
            fs.writeFileSync(path.join(objDir, "Step_0.gml"), step_code);
            eventList.push({ "resourceType":"GMEvent","resourceVersion":"2.0","name":"","collisionObjectId":null,"eventNum":0,"eventType":3,"isDnD":false });
        }

        const yy = {
            "resourceType": "GMObject",
            "resourceVersion": "2.0",
            "name": name,
            "eventList": eventList,
            "managed": true,
            "parent": { "name": "Objects", "path": "folders/Objects.yy" },
            "spriteId": sprite_name ? { "name": sprite_name, "path": `sprites/${sprite_name}/${sprite_name}.yy` } : null,
            "visible": true,
        };

        fs.writeFileSync(path.join(objDir, `${name}.yy`), JSON.stringify(yy, null, 2));

        const yyp = readYYP();
        const resourceEntry = { id: { name: name, path: `objects/${name}/${name}.yy` } };
        if (!yyp.resources.some(r => r.id.name === name)) {
            yyp.resources.push(resourceEntry);
            writeYYP(yyp);
        }

        return { content: [{ type: "text", text: `Successfully added object ${name}` }] };
    }

    case "gm_add_sprite_from_web": {
        const { name, web_path } = args;
        const sourcePath = path.join(projectRoot, web_path);
        const spriteDir = path.join(projectRoot, "sprites", name);
        if (!fs.existsSync(spriteDir)) fs.mkdirSync(spriteDir, { recursive: true });

        // Copy PNG
        const targetPng = path.join(spriteDir, `${name}.png`);
        fs.copyFileSync(sourcePath, targetPng);

        // Basic Sprite YY (v2.0)
        const yy = {
            "resourceType": "GMSprite",
            "resourceVersion": "2.0",
            "name": name,
            "bbox_bottom": 0,
            "bbox_left": 0,
            "bbox_right": 0,
            "bbox_top": 0,
            "bboxMode": 0,
            "collisionKind": 1,
            "collisionTolerance": 0,
            "DynamicTexturePage": false,
            "edgeFiltering": false,
            "ForcedTexturePage": false,
            "frames": [
                { "resourceType":"GMSpriteFrame","resourceVersion":"2.0","name":"frame1" }
            ],
            "gridX": 0, "gridY": 0,
            "height": 64, // Placeholder - should ideally read PNG size
            "layers": [
                { "resourceType":"GMImageLayer","resourceVersion":"2.0","name":"default","visible":true,"isLocked":false,"blendMode":0,"opacity":100.0 }
            ],
            "name": name,
            "origin": 0,
            "parent": { "name": "Sprites", "path": "folders/Sprites.yy" },
            "preMultiplyAlpha": false,
            "sequence": {
                "resourceType": "GMSequence",
                "resourceVersion": "2.0",
                "name": name,
                "autoRecord": true,
                "backdropHeight": 768,
                "backdropImageOpacity": 0.5,
                "backdropImagePath": "",
                "backdropWidth": 1366,
                "backdropXOffset": 0.0,
                "backdropYOffset": 0.0,
                "events": { "resourceType": "KeyframeStore<MessageEventKeyframe>", "resourceVersion": "2.0", "Keyframes": [] },
                "eventStubScript": null,
                "eventToFunction": {},
                "length": 1.0,
                "lockOrigin": false,
                "moments": { "resourceType": "KeyframeStore<MomentsEventKeyframe>", "resourceVersion": "2.0", "Keyframes": [] },
                "playback": 1,
                "playbackSpeed": 30.0,
                "playbackSpeedType": 0,
                "showBackdrop": true,
                "showBackdropImage": false,
                "timeUnits": 1,
                "tracks": [],
                "visibleRange": null,
                "volume": 1.0,
                "xorigin": 0,
                "yorigin": 0,
            },
            "swatchColours": null,
            "swfPrecision": 2.525,
            "textureGroupId": { "name": "Default", "path": "texturegroups/Default" },
            "type": 0,
            "width": 64,
        };

        fs.writeFileSync(path.join(spriteDir, `${name}.yy`), JSON.stringify(yy, null, 2));

        const yyp = readYYP();
        const resourceEntry = { id: { name: name, path: `sprites/${name}/${name}.yy` } };
        if (!yyp.resources.some(r => r.id.name === name)) {
            yyp.resources.push(resourceEntry);
            writeYYP(yyp);
        }

        return { content: [{ type: "text", text: `Successfully added sprite ${name}` }] };
    }

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
});

async function run() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

run().catch(console.error);
