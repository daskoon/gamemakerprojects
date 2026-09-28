const fs = require('fs');
const path = require('path');

function parseGMJson(str) {
    return eval('(' + str + ')');
}

function stringifyGM(obj) {
    // Basic stringify then regex to add trailing commas before } and ]
    let json = JSON.stringify(obj, null, 2);
    return json.replace(/([}\]" \d\w])\n( +[}\]])/g, '$1,\n$2');
}

function fixFile(filePath, typeTag, order, extra = {}) {
    if (!fs.existsSync(filePath)) return;
    let obj = parseGMJson(fs.readFileSync(filePath, 'utf8'));
    
    // Merge extra defaults
    for (let k in extra) if (obj[k] === undefined) obj[k] = extra[k];

    let newObj = {};
    newObj[typeTag] = "v1";
    newObj["%Name"] = obj.name || path.basename(filePath, '.yy');

    order.forEach(k => {
        if (obj[k] !== undefined) {
            if (k === 'layers' && Array.isArray(obj[k])) {
                newObj[k] = obj[k].map(l => {
                    if (l.resourceType) return l; // Already formatted
                    let nl = { "resourceType": "GMImageLayer", "resourceVersion": "2.0" };
                    Object.keys(l).sort().forEach(lk => nl[lk] = l[lk]);
                    return nl;
                });
            } else {
                newObj[k] = obj[k];
            }
        }
    });

    // Add remaining keys alphabetically at the end just in case
    Object.keys(obj).sort().forEach(k => {
        if (newObj[k] === undefined && k !== typeTag && k !== '%Name') newObj[k] = obj[k];
    });

    fs.writeFileSync(filePath, stringifyGM(newObj));
}

// ORDER DEFINITIONS
const spriteOrder = ["bboxMode","bbox_bottom","bbox_left","bbox_right","bbox_top","collisionKind","collisionTolerance","DynamicTexturePage","edgeFiltering","For3D","ForcedTexturePage","frames","gridX","gridY","height","layers","name","origin","parent","preMultiplyAlpha","resourceType","resourceVersion","sequence","swatchColours","swfPrecision","textureGroupId","type","width"];
const objectOrder = ["eventList","managed","name","overriddenProperties","parent","parentObjectId","physicsAngularDamping","physicsDensity","physicsFriction","physicsGroup","physicsKinematic","physicsLinearDamping","physicsObject","physicsRestitution","physicsSensor","physicsShape","physicsShapePoints","physicsStartAwake","properties","resourceType","resourceVersion","solid","spriteId","spriteMaskId","visible"];
const scriptOrder = ["isCompatibility","isDnD","name","parent","resourceType","resourceVersion"];
const instanceOrder = ["colour","frozen","hasCreationCode","ignore","imageIndex","imageSpeed","inheritCode","inheritedItemId","inheritedRelativeStackingOrder","inheritItemSettings","isDnd","name","objectId","properties","resourceType","resourceVersion","rotation","scaleX","scaleY","userdefinedAnimFPS","visible","x","y"];

// REPAIR ASSETS
['spr_dice', 'spr_felt', 'spr_wood', 'spr_brick'].forEach(n => fixFile(`sprites/${n}/${n}.yy`, '$GMSprite', spriteOrder, { "DynamicTexturePage": false, "edgeFiltering": false, "For3D": false, "ForcedTexturePage": false, "preMultiplyAlpha": false, "resourceVersion": "2.0" }));
['obj_dice', 'obj_game_controller'].forEach(n => fixFile(`objects/${n}/${n}.yy`, '$GMObject', objectOrder, { "resourceVersion": "2.0", "managed": true }));
['scr_laws', 'scr_rules'].forEach(n => fixFile(`scripts/${n}/${n}.yy`, '$GMScript', scriptOrder, { "resourceVersion": "2.0" }));

// REPAIR ROOM
const roomPath = 'rooms/Room1/Room1.yy';
if (fs.existsSync(roomPath)) {
    let roomObj = parseGMJson(fs.readFileSync(roomPath, 'utf8'));
    if (roomObj.layers) {
        roomObj.layers.forEach(layer => {
            if (layer.instances) {
                layer.instances = layer.instances.map(inst => {
                    let newInst = { "$GMRInstance": "v4", "%Name": inst.name || inst["%Name"] };
                    instanceOrder.forEach(ik => {
                        if (inst[ik] !== undefined) newInst[ik] = inst[ik];
                        else if (ik === "inheritCode") newInst[ik] = false;
                        else if (ik === "inheritItemSettings") newInst[ik] = false;
                    });
                    return newInst;
                });
            }
        });
    }
    let newRoom = { "$GMRoom": "v1", "%Name": "Room1" };
    Object.keys(roomObj).sort().forEach(k => { if(k !== '$GMRoom' && k !== '%Name') newRoom[k] = roomObj[k]; });
    fs.writeFileSync(roomPath, stringifyGM(newRoom));
}

// REPAIR YYP
const yypPath = 'threeman delux.yyp';
let yyp = parseGMJson(fs.readFileSync(yypPath, 'utf8'));
yyp["$GMProject"] = "v1";
yyp["resourceVersion"] = "2.0";
yyp["MetaData"] = { "IDEVersion": "2024.14.2.256" };
fs.writeFileSync(yypPath, stringifyGM(yyp));

console.log("Master repair complete. Trailing commas restored. Field order enforced.");
