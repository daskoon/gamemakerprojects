const fs = require('fs');
const crypto = require('crypto');

function generateGUID() {
    return crypto.randomUUID();
}

const projectFile = 'threeman delux.yyp';
let project = JSON.parse(fs.readFileSync(projectFile, 'utf8'));

const assets = [
    { path: "rooms/Room1/Room1.yy", type: "GMRoom" },
    { path: "sprites/spr_dice/spr_dice.yy", type: "GMSprite" },
    { path: "sprites/spr_felt/spr_felt.yy", type: "GMSprite" },
    { path: "sprites/spr_wood/spr_wood.yy", type: "GMSprite" },
    { path: "sprites/spr_brick/spr_brick.yy", type: "GMSprite" },
    { path: "objects/obj_dice/obj_dice.yy", type: "GMObject" },
    { path: "objects/obj_game_controller/obj_game_controller.yy", type: "GMObject" },
    { path: "scripts/scr_laws/scr_laws.yy", type: "GMScript" },
    { path: "scripts/scr_rules/scr_rules.yy", type: "GMScript" },
    { path: "options/windows/options_windows.yy", type: "GMWindowsOptions" }
];

assets.forEach(asset => {
    // Avoid duplicates
    if (!project.resources.some(r => r.Value.resourcePath === asset.path.replace(/\//g, "\\"))) {
        project.resources.push({
            "Key": generateGUID(),
            "Value": {
                "id": generateGUID(),
                "modelName": "GMResourceInfo",
                "configDeltaFiles": [],
                "configDeltas": [],
                "resourceCreationConfig": "default",
                "resourceFiles": [],
                "resourcePath": asset.path.replace(/\//g, "\\"),
                "resourceType": asset.type
            }
        });
    }
});

// Register Room in room_order
if (project.room_order.length === 0) {
    project.room_order.push({
        "id": generateGUID(),
        "modelName": "GMRoomOrderInfo",
        "roomId": "rooms\\Room1\\Room1.yy"
    });
}

fs.writeFileSync(projectFile, JSON.stringify(project, null, 4));
console.log("All assets registered in Format 1.");
