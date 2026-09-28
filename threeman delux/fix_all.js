const fs = require('fs');
const path = require('path');

function parseGMJson(str) {
    try { return eval('(' + str + ')'); } catch(e) { return null; }
}

function stringifyGM(obj) {
    let json = JSON.stringify(obj, null, 2);
    return json.replace(/([}\]" \d\w])\n( +[}\]])/g, '$1,\n$2');
}

const ORDERS = {
    "$GMSprite": ["$GMSprite", "%Name", "bboxMode", "bbox_bottom", "bbox_left", "bbox_right", "bbox_top", "collisionKind", "collisionTolerance", "DynamicTexturePage", "edgeFiltering", "For3D", "ForcedTexturePage", "frames", "gridX", "gridY", "height", "layers", "name", "origin", "parent", "preMultiplyAlpha", "resourceType", "resourceVersion", "sequence", "swatchColours", "swfPrecision", "textureGroupId", "type", "width"],
    "$GMObject": ["$GMObject", "%Name", "eventList", "managed", "name", "overriddenProperties", "parent", "parentObjectId", "physicsAngularDamping", "physicsDensity", "physicsFriction", "physicsGroup", "physicsKinematic", "physicsLinearDamping", "physicsObject", "physicsRestitution", "physicsSensor", "physicsShape", "physicsShapePoints", "physicsStartAwake", "properties", "resourceType", "resourceVersion", "solid", "spriteId", "spriteMaskId", "visible"],
    "$GMScript": ["$GMScript", "%Name", "isCompatibility", "isDnD", "name", "parent", "resourceType", "resourceVersion"],
    "$GMRoom": ["$GMRoom", "%Name", "creationCodeFile", "inheritCode", "inheritCreationOrder", "inheritLayers", "instanceCreationOrder", "isDnd", "layers", "name", "parent", "parentRoom", "physicsSettings", "resourceType", "resourceVersion", "roomSettings", "sequenceId", "views", "viewSettings", "volume"],
    "$GMProject": ["$GMProject", "%Name", "AudioGroups", "configs", "defaultScriptType", "Folders", "ForcedPrefabProjectReferences", "IncludedFiles", "isEcma", "LibraryEmitters", "MetaData", "name", "resources", "resourceType", "resourceVersion", "RoomOrderNodes", "templateType", "TextureGroups"],
    "$GMMainOptions": ["$GMMainOptions", "%Name", "name", "option_allow_instance_change", "option_audio_error_behaviour", "option_author", "option_collision_compatibility", "option_copy_on_write_enabled", "option_draw_colour", "option_gameguid", "option_gameid", "option_game_speed", "option_legacy_json_parsing", "option_legacy_number_conversion", "option_legacy_other_behaviour", "option_legacy_primitive_drawing", "option_mips_for_3d_textures", "option_remove_unused_assets", "option_sci_usesci", "option_spine_licence", "option_steam_app_id", "option_template_description", "option_template_icon", "option_template_image", "option_window_colour", "resourceType", "resourceVersion"],
    "$GMWindowsOptions": ["$GMWindowsOptions", "%Name", "name", "option_windows_allow_fullscreen_switching", "option_windows_borderless", "option_windows_company_info", "option_windows_copyright_info", "option_windows_copy_exe_to_dest", "option_windows_d3dswapeffectdiscard", "option_windows_description_info", "option_windows_disable_sandbox", "option_windows_display_cursor", "option_windows_display_name", "option_windows_enable_steam", "option_windows_executable_name", "option_windows_icon", "option_windows_installer_finished", "option_windows_installer_header", "option_windows_interpolate_pixels", "option_windows_license", "option_windows_nsis_file", "option_windows_product_info", "option_windows_resize_window", "option_windows_save_location", "option_windows_scale", "option_windows_sleep_margin", "option_windows_splash_screen", "option_windows_start_fullscreen", "option_windows_steam_use_alternative_launcher", "option_windows_texture_page", "option_windows_use_splash", "option_windows_version", "option_windows_vsync", "resourceType", "resourceVersion"],
    "$GMOperaGXOptions": ["$GMOperaGXOptions", "%Name", "name", "option_operagx_display_cursor", "option_operagx_editUrl", "option_operagx_game_name", "option_operagx_guid", "option_operagx_internalShareUrl", "option_operagx_interpolate_pixels", "option_operagx_mod_editUrl", "option_operagx_mod_game_name", "option_operagx_mod_guid", "option_operagx_mod_internalShareUrl", "option_operagx_mod_next_version", "option_operagx_mod_publicShareUrl", "option_operagx_mod_team_id", "option_operagx_mod_team_name", "option_operagx_mod_version", "option_operagx_next_version", "option_operagx_publicShareUrl", "option_operagx_scale", "option_operagx_team_id", "option_operagx_team_name", "option_operagx_texture_page", "option_operagx_transparent_background", "option_operagx_version", "resourceType", "resourceVersion"],
    "GMRInstance": ["$GMRInstance", "%Name", "colour", "frozen", "hasCreationCode", "ignore", "imageIndex", "imageSpeed", "inheritCode", "inheritedItemId", "inheritedRelativeStackingOrder", "inheritItemSettings", "isDnd", "name", "objectId", "properties", "resourceType", "resourceVersion", "rotation", "scaleX", "scaleY", "userdefinedAnimFPS", "visible", "x", "y"]
};

function fixFile(filePath) {
    if (!filePath.endsWith('.yy') && !filePath.endsWith('.yyp')) return;
    let str = fs.readFileSync(filePath, 'utf8');
    let obj = parseGMJson(str);
    if (!obj) return;

    let typeTag = Object.keys(obj).find(k => k.startsWith('$GM'));
    let order = ORDERS[typeTag];
    
    if (!order) return;

    let newObj = {};
    order.forEach(key => {
        let val = obj[key];
        if (val === undefined) {
            if (key === "inheritCode") val = false;
            if (key === "inheritItemSettings") val = false;
            if (key === "DynamicTexturePage") val = false;
            if (key === "For3D") val = false;
            if (key === "resourceVersion") val = "2.0";
            if (key === typeTag) val = (typeTag === '$GMProject' || typeTag.includes('Options')) ? "v1" : "";
        }

        if (val !== undefined) {
            if (Array.isArray(val)) {
                newObj[key] = val.map(item => {
                    if (item && typeof item === 'object' && !Array.isArray(item)) {
                        let iTag = Object.keys(item).find(ik => ik.startsWith('$GM'));
                        let iOrder = ORDERS[iTag] || Object.keys(item).sort();
                        let ni = {};
                        iOrder.forEach(ik => {
                            if (item[ik] !== undefined) ni[ik] = item[ik];
                            else if (ik === "inheritCode") ni[ik] = false;
                            else if (ik === "inheritItemSettings") ni[ik] = false;
                        });
                        return ni;
                    }
                    return item;
                });
            } else {
                newObj[key] = val;
            }
        }
    });

    fs.writeFileSync(filePath, stringifyGM(newObj));
    console.log("Fully Ordered: " + filePath);
}

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        if (fs.statSync(dirPath).isDirectory()) {
            if (f !== '.git' && f !== 'gm_mcp' && f !== 'template_proj') walkDir(dirPath, callback);
        } else {
            callback(dirPath);
        }
    });
}

walkDir('.', fixFile);
console.log("Complete Native Ordering Applied.");
