const fs = require("fs");
const path = require("path");

const projectRoot = path.resolve(__dirname, "..");
const yypPath = path.join(projectRoot, "threeman delux.yyp");

function readYYP() {
  return JSON.parse(fs.readFileSync(yypPath, "utf8"));
}

function writeYYP(yyp) {
  fs.writeFileSync(yypPath, JSON.stringify(yyp, null, 2));
}

const command = process.argv[2];
const args = JSON.parse(process.argv[3] || "{}");

const { execSync } = require("child_process");

const igorPath = "C:\\ProgramData\\GameMakerStudio2\\Cache\\runtimes\\runtime-2024.14.2.256\\bin\\igor\\windows\\x64\\Igor.exe";

async function run() {
  const yyp = readYYP();
  
  switch (command) {
    case "gm_build_and_run": {
        const platform = args.platform || "windows";
        const config = args.config || "Default";
        const action = args.action || "Run";
        const runtimePath = "C:\\ProgramData\\GameMakerStudio2\\Cache\\runtimes\\runtime-2024.14.2.256";
        const userPath = "C:\\Users\\transmacsual\\AppData\\Roaming\\GameMakerStudio2\\daskoon_5022932";
        const licensePath = path.join(projectRoot, "licence.plist");
        const optionsPath = path.join(projectRoot, "custom_settings.json");
        const outputDir = path.join(projectRoot, "output");
        if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
        const targetFile = path.join(outputDir, "threeman_delux.exe");

        // Correct syntax for Igor 2024.14: actions are positional at the end
        const cmd = `"${igorPath}" --project="${yypPath}" --config="${config}" --rp="${runtimePath}" --user="${userPath}" --lf="${licensePath}" --options="${optionsPath}" --of="${targetFile}" --runtime=VM ${platform} ${action}`;
        console.log(`Executing build action (120s timeout): ${cmd}`);
        
        try {
            execSync(cmd, { stdio: "inherit", timeout: 120000 });
            
            // VALIDATION: Check if output exists and is > 1MB
            if (fs.existsSync(targetFile)) {
                const stats = fs.statSync(targetFile);
                const sizeMB = stats.size / (1024 * 1024);
                if (sizeMB > 1.0) {
                    console.log(`\u2713 Build Succeeded: ${targetFile} (${sizeMB.toFixed(2)} MB)`);
                } else {
                    console.error(`\u2717 Blank Build: Executable found but size is only ${sizeMB.toFixed(2)} MB (expected > 1MB)`);
                }
            } else {
                console.error("\u2717 Build Failed: No executable produced.");
            }
        } catch (e) {
            if (e.code === 'ETIMEDOUT') {
                console.error("❌ Build hung - timeout triggered after 120s");
            } else {
                console.error("Build failed. Note: Igor requires a valid license/login session from the IDE.");
            }
        }
        break;
    }
    case "gm_add_sprite_from_web": {
      const { name, web_path } = args;
      const sourcePath = path.join(projectRoot, web_path);
      const spriteDir = path.join(projectRoot, "sprites", name);
      if (!fs.existsSync(spriteDir)) fs.mkdirSync(spriteDir, { recursive: true });

      const targetPng = path.join(spriteDir, `${name}.png`);
      fs.copyFileSync(sourcePath, targetPng);

      const yy = {
        "resourceType": "GMSprite", "resourceVersion": "2.0", "name": name,
        "bbox_bottom": 63, "bbox_left": 0, "bbox_right": 63, "bbox_top": 0, "bboxMode": 0,
        "collisionKind": 1, "collisionTolerance": 0, "frames": [ { "resourceType":"GMSpriteFrame","resourceVersion":"2.0","name":"frame1" } ],
        "height": 64, "width": 64, "layers": [ { "resourceType":"GMImageLayer","resourceVersion":"2.0","name":"default","visible":true,"isLocked":false,"blendMode":0,"opacity":100.0 } ],
        "origin": 0, "parent": { "name": "Sprites", "path": "folders/Sprites.yy" },
        "sequence": { "resourceType": "GMSequence", "resourceVersion": "2.0", "name": name, "length": 1.0, "playback": 1, "playbackSpeed": 30.0, "playbackSpeedType": 0, "tracks": [] },
        "textureGroupId": { "name": "Default", "path": "texturegroups/Default" },
        "type": 0,
      };

      fs.writeFileSync(path.join(spriteDir, `${name}.yy`), JSON.stringify(yy, null, 2));
      if (!yyp.resources.some(r => r.id.name === name)) {
        yyp.resources.push({ id: { name: name, path: `sprites/${name}/${name}.yy` } });
        writeYYP(yyp);
      }
      console.log(`Successfully added sprite ${name}`);
      break;
    }

    case "gm_add_sound_from_web": {
      const { name, web_path } = args;
      const sourcePath = path.join(projectRoot, web_path);
      const soundDir = path.join(projectRoot, "sounds", name);
      if (!fs.existsSync(soundDir)) fs.mkdirSync(soundDir, { recursive: true });

      const ext = path.extname(web_path);
      const targetSound = path.join(soundDir, `${name}${ext}`);
      fs.copyFileSync(sourcePath, targetSound);

      const yy = {
        "resourceType": "GMSound", "resourceVersion": "2.0", "name": name,
        "audioGroupId": { "name": "audiogroup_default", "path": "audiogroups/audiogroup_default" },
        "bitDepth": 1, "bitRate": 128, "compression": 0, "conversionMode": 0, "duration": 0.0,
        "parent": { "name": "Sounds", "path": "folders/Sounds.yy" },
        "preload": false, "sampleRate": 44100, "type": 0, "volume": 1.0,
      };

      fs.writeFileSync(path.join(soundDir, `${name}.yy`), JSON.stringify(yy, null, 2));
      if (!yyp.resources.some(r => r.id.name === name)) {
        yyp.resources.push({ id: { name: name, path: `sounds/${name}/${name}.yy` } });
        writeYYP(yyp);
      }
      console.log(`Successfully added sound ${name}`);
      break;
    }

    case "gm_add_script": {
      const { name, code } = args;
      const scriptDir = path.join(projectRoot, "scripts", name);
      if (!fs.existsSync(scriptDir)) fs.mkdirSync(scriptDir, { recursive: true });

      const yy = { "resourceType": "GMScript", "resourceVersion": "2.0", "name": name, "isCompatibility": false, "isDnD": false, "parent": { "name": "Scripts", "path": "folders/Scripts.yy" } };
      fs.writeFileSync(path.join(scriptDir, `${name}.yy`), JSON.stringify(yy, null, 2));
      fs.writeFileSync(path.join(scriptDir, `${name}.gml`), code);

      if (!yyp.resources.some(r => r.id.name === name)) {
        yyp.resources.push({ id: { name: name, path: `scripts/${name}/${name}.yy` } });
        writeYYP(yyp);
      }
      console.log(`Successfully added script ${name}`);
      break;
    }

    case "gm_add_object": {
      const { name, create_code, step_code, draw_code, sprite_name } = args;
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
      if (draw_code) {
        fs.writeFileSync(path.join(objDir, "Draw_0.gml"), draw_code);
        eventList.push({ "resourceType":"GMEvent","resourceVersion":"2.0","name":"","collisionObjectId":null,"eventNum":0,"eventType":8,"isDnD":false });
      }

      const yy = {
        "resourceType": "GMObject", "resourceVersion": "2.0", "name": name, "eventList": eventList, "managed": true,
        "parent": { "name": "Objects", "path": "folders/Objects.yy" },
        "spriteId": sprite_name ? { "name": sprite_name, "path": `sprites/${sprite_name}/${sprite_name}.yy` } : null,
        "visible": true,
      };

      fs.writeFileSync(path.join(objDir, `${name}.yy`), JSON.stringify(yy, null, 2));
      if (!yyp.resources.some(r => r.id.name === name)) {
        yyp.resources.push({ id: { name: name, path: `objects/${name}/${name}.yy` } });
        writeYYP(yyp);
      }
      console.log(`Successfully added object ${name}`);
      break;
    }

    default:
      console.error(`Unknown command: ${command}`);
  }
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
