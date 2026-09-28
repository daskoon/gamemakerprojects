const fs = require('fs');
const crypto = require('crypto');

function generateGUID() {
    return crypto.randomUUID();
}

const projectFile = 'threeman delux.yyp';
let project = JSON.parse(fs.readFileSync(projectFile, 'utf8'));

// 1. Define standard folders
const folderNames = ["Sprites", "Scripts", "Objects", "Rooms", "Options"];
project.Folders = folderNames.map(name => ({
    "id": generateGUID(),
    "modelName": "GMFolder",
    "name": name,
    "folderPath": `folders/${name}.yy`,
    "resourceType": "GMFolder",
    "resourceVersion": "1.0"
}));

// 2. Link resources to folders (Format 1 expects resources to be in the folder list)
// Actually, in Format 1, the .yyp lists resources and the .yy files point to parents.
// But some versions need the folders array to exist for the browser to draw.

fs.writeFileSync(projectFile, JSON.stringify(project, null, 4));
console.log("Folder structure added to .yyp");
