import { world, system, MolangVariableMap } from "@minecraft/server";

system.runInterval(() => {
    for (const player of world.getPlayers()) {
        if (!player.isSprinting || player.isInWater) continue;
        
        // Ground check: is there a block immediately below the player?
        const blockBelow = player.dimension.getBlock({ 
            x: player.location.x, 
            y: player.location.y - 0.1, 
            z: player.location.z 
        });
        
        if (!blockBelow || blockBelow.isAir || blockBelow.typeId === "minecraft:water") continue;

        // Sparse check: only spawn every few ticks for dust-like feel
        if (system.currentTick % 2 !== 0) continue;

        const pos = player.location;
        const view = player.getViewDirection();
        
        // Normalize horizontal view for consistent side-offset
        const horizontalLen = Math.sqrt(view.x * view.x + view.z * view.z) || 1;
        const normX = view.x / horizontalLen;
        const normZ = view.z / horizontalLen;

        // Perpendicular vector for V-shape wings (right-hand rule on Y)
        const perpX = -normZ;
        const perpZ = normX;

        // Alternate or random side for V-shape
        const side = Math.random() > 0.5 ? 1 : -1;
        const sideSpread = 0.4; // How wide the V opens

        const dx = (-view.x * 1.2) + (perpX * side * sideSpread) + (Math.random() - 0.5) * 0.2;
        const dy = 1.2 + (Math.random() * 0.4); 
        const dz = (-view.z * 1.2) + (perpZ * side * sideSpread) + (Math.random() - 0.5) * 0.2;

        const spawnPos = {
            x: pos.x - view.x * 0.3 + (perpX * side * 0.1),
            y: pos.y + 0.1,
            z: pos.z - view.z * 0.3 + (perpZ * side * 0.1)
        };

        const molang = new MolangVariableMap();
        const randomSize = 1.0 + Math.random() * 5.0;

        molang.setFloat("variable.dir_x", dx);
        molang.setFloat("variable.dir_y", dy);
        molang.setFloat("variable.dir_z", dz);
        molang.setFloat("variable.size", randomSize);

        player.dimension.spawnParticle("wn:trailing_trails", spawnPos, molang);
    }
}, 1);
