const fs = require('fs');
const path = require('path');

function parseGMJson(str) {
    try { return eval('(' + str + ')'); } catch(e) { return null; }
}

const project = JSON.parse(fs.readFileSync('threeman delux.yyp', 'utf8'));
const folderMap = {};
project.Folders.forEach(f => folderMap[f.name] = f.id);

function updateParent(filePath, folderName) {
    if (!fs.existsSync(filePath)) return;
    let str = fs.readFileSync(filePath, 'utf8');
    let obj = parseGMJson(str);
    if (!obj) return;

    obj.parent = {
        "name": folderName,
        "path": `folders/${folderName}.yy`
    };
    
    // In Format 1, the .yy for a resource often needs the parent folder ID
    // but usually, it's just the path. Let's ensure the path is correct.
    fs.writeFileSync(filePath, JSON.stringify(obj, null, 4));
    console.log(`Updated parent for ${filePath} to ${folderName}`);
}

['spr_dice', 'spr_felt', 'spr_wood', 'spr_brick'].forEach(n => updateParent(`sprites/${n}/${n}.yy`, 'Sprites'));
['obj_dice', 'obj_game_controller'].forEach(n => updateParent(`objects/${n}/${n}.yy`, 'Objects'));
['scr_laws', 'scr_rules'].forEach(n => updateParent(`scripts/${n}/${n}.yy`, 'Scripts'));
updateParent('rooms/Room1/Room1.yy', 'Rooms');
