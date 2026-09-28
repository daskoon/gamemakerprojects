const fs = require('fs');

function parseGMJson(str) {
    return eval('(' + str + ')');
}

function fixYY(filePath, typeTag, extra = {}) {
    if (!fs.existsSync(filePath)) return;
    let obj = parseGMJson(fs.readFileSync(filePath, 'utf8'));
    for (let k in extra) if (obj[k] === undefined) obj[k] = extra[k];

    // THE MAGIC: Sort EVERY key alphabetically.
    // Streaming parsers usually expect this exact order.
    let sortedKeys = Object.keys(obj).sort();
    
    let newObj = {};
    newObj[typeTag] = ""; // Mapping to Record Version 0
    newObj["%Name"] = obj.name;

    sortedKeys.forEach(k => {
        if (k !== typeTag && k !== '%Name') {
            newObj[k] = obj[k];
        }
    });

    // Write with trailing commas
    let json = JSON.stringify(newObj, null, 2);
    json = json.replace(/([}\]" \d\w])\n( +[}\]])/g, '$1,\n$2');
    fs.writeFileSync(filePath, json);
}

const spriteDefaults = {
    "DynamicTexturePage": false,
    "edgeFiltering": false,
    "For3D": false,
    "ForcedTexturePage": false,
    "preMultiplyAlpha": false,
    "resourceVersion": "2.0",
    "frames": [{ "name": "frame1", "resourceType": "GMSpriteFrame", "resourceVersion": "2.0" }]
};

['spr_dice', 'spr_felt', 'spr_wood', 'spr_brick'].forEach(n => fixYY(`sprites/${n}/${n}.yy`, '$GMSprite', spriteDefaults));
['obj_dice', 'obj_game_controller'].forEach(n => fixYY(`objects/${n}/${n}.yy`, '$GMObject', { "resourceVersion": "2.0" }));
['scr_laws', 'scr_rules'].forEach(n => fixYY(`scripts/${n}/${n}.yy`, '$GMScript', { "resourceVersion": "2.0" }));

// Room fix
let roomPath = 'rooms/Room1/Room1.yy';
if (fs.existsSync(roomPath)) {
    let room = parseGMJson(fs.readFileSync(roomPath, 'utf8'));
    if (room.layers) {
        room.layers.forEach(l => {
            if (l.instances) {
                l.instances = l.instances.map(inst => {
                    inst.inheritCode = false;
                    inst.inheritItemSettings = false;
                    let iKeys = Object.keys(inst).sort();
                    let ni = { "$GMRInstance": "v4", "%Name": inst.name };
                    iKeys.forEach(ik => { if(ik !== '$GMRInstance' && ik !== '%Name') ni[ik] = inst[ik]; });
                    return ni;
                });
            }
        });
    }
    let rKeys = Object.keys(room).sort();
    let nr = { "$GMRoom": "", "%Name": "Room1" };
    rKeys.forEach(rk => { if(rk !== '$GMRoom' && rk !== '%Name') nr[rk] = room[rk]; });
    let rJson = JSON.stringify(nr, null, 2).replace(/([}\]" \d\w])\n( +[}\]])/g, '$1,\n$2');
    fs.writeFileSync(roomPath, rJson);
}

console.log("Alpha-sort repair complete.");
