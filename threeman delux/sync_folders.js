const fs = require('fs');
const path = require('path');

const projectFile = 'threeman delux.yyp';
const project = JSON.parse(fs.readFileSync(projectFile, 'utf8'));

const folderDir = 'folders';
if (!fs.existsSync(folderDir)) fs.mkdirSync(folderDir);

project.Folders.forEach(folder => {
    // In Format 1, the .yy file for a folder uses the 'id' as its internal 'id'
    const yy = {
        "id": folder.id,
        "modelName": "GMFolder",
        "name": folder.name,
        "folderPath": folder.folderPath,
        "resourceType": "GMFolder",
        "resourceVersion": "1.0"
    };
    
    // Sort keys alphabetically
    let sortedYY = {};
    Object.keys(yy).sort().forEach(k => {
        sortedYY[k] = yy[k];
    });

    const json = JSON.stringify(sortedYY, null, 4);
    fs.writeFileSync(path.join(folderDir, `${folder.name}.yy`), json);
    console.log(`Synchronized folder: ${folder.name} with ID ${folder.id}`);
});
