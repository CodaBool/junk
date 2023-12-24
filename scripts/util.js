/* @license 2023 CodaBool all rights reserved */

import { Terminal, ID, Skilled } from "./ui.js"

export function within(tile, point) {
  const cX = (Math.abs(tile.width) / 2);
  const cY = (Math.abs(tile.height) / 2);

  let pt = {
      x: (point.x - (tile.x + cX)),
      y: (point.y - (tile.y + cY))
  }

  if (tile.rotation != 0) {
      //rotate the point
      function rotate(cx, cy, x, y, angle) {
          var rad = Math.toRadians(angle),
              cos = Math.cos(rad),
              sin = Math.sin(rad),
              run = x - cx,
              rise = y - cy,
              tx = (cos * run) + (sin * rise) + cx,
              ty = (cos * rise) - (sin * run) + cy;
          return { x: tx, y: ty };
      }

      pt = rotate(0, 0, pt.x, pt.y, tile.rotation);
  }

  pt.x = (pt.x / tile.texture.scaleX) + cX;
  pt.y = (pt.y / tile.texture.scaleY) + cY;

  if (pt.x < 0 ||
      pt.x > Math.abs(tile.width) ||
      pt.y < 0 ||
      pt.y > Math.abs(tile.height))
      return false;

  return tile._object?._texturePolygon ? tile._object?._texturePolygon.contains(pt.x, pt.y) : true;
}

export function overlap(tile, token, dest) {
  function pointRotation(radiusX, radiusY, rayX, rayY, degree) {
    const run = rayX - radiusX
    const rise = rayY - radiusY
    const cos = Math.cos(Math.toRadians(degree))
    const sin = Math.sin(Math.toRadians(degree))
    return { 
      x: (cos * run) + (sin * rise) + radiusX,
      y: (cos * rise) - (sin * run) + radiusY,
    }
  } 

  const radiusX = (Math.abs(tile.width) / 2)
  const radiusY = (Math.abs(tile.height) / 2)
  const offsetWidth = ((token.width ?? 0) * (token?.parent?.dimensions?.size ?? 0)) / 2
  const offsetHeight = ((token.height ?? 0) * (token?.parent?.dimensions?.size ?? 0)) / 2
  const tokenX1 = token.x + offsetWidth
  const tokenY1 = token.y + offsetHeight
  const tokenX2 = dest.x + offsetWidth
  const tokenY2 = dest.y + offsetHeight

  const tokenRay = new Ray(
    {
      x: tokenX1 - (tile.x + radiusX),
      y: tokenY1 - (tile.y + radiusY),
    },
    {
      x: tokenX2 - (tile.x + radiusX),
      y: tokenY2 - (tile.y + radiusY),
    })

  if (tile.rotation != 0) {
    tokenRay.A = pointRotation(0, 0, tokenRay.A.x, tokenRay.A.y, tile.rotation);
    tokenRay.B = pointRotation(0, 0, tokenRay.B.x, tokenRay.B.y, tile.rotation);
  }

  tokenRay.A.x = (tokenRay.A.x / tile.texture.scaleX) + radiusX;
  tokenRay.A.y = (tokenRay.A.y / tile.texture.scaleY) + radiusY;
  tokenRay.B.x = (tokenRay.B.x / tile.texture.scaleX) + radiusX;
  tokenRay.B.y = (tokenRay.B.y / tile.texture.scaleY) + radiusY;
  
  let segments = tileData(tile).filter(s => foundry.utils.lineSegmentIntersects(tokenRay.A, tokenRay.B, s.a, s.b));

  let intersect = segments
    .map(s => {
      let point = foundry.utils.lineSegmentIntersection(tokenRay.A, tokenRay.B, s.a, s.b);
      let t0 = point.t0;
      point = { x: (point.x - radiusX) * tile.texture.scaleX, y: (point.y - radiusY) * tile.texture.scaleY }
      point = pointRotation(0, 0, point.x, point.y, tile.rotation * -1);
      point = { x: point.x + (tile.x + radiusX), y: point.y + (tile.y + radiusY) }
      point.t0 = t0;
      return point;
    });
  return intersect;
}

function tileData(tile, usealpha = false) {
  let width = Math.abs(tile.width);
  let height = Math.abs(tile.height);

  let segments = [
      { a: { x: 0, y: 0 }, b: { x: width, y: 0 } },
      { a: { x: width, y: 0 }, b: { x: width, y: height } },
      { a: { x: width, y: height }, b: { x: 0, y: height } },
      { a: { x: 0, y: height }, b: { x: 0, y: 0 } }
  ];

  if (usealpha) {
      segments = [];
      for (let i = 0; i < tile.object._textureBorderPoints.length - 2; i += 2) {
          segments.push({ a: { x: tile.object._textureBorderPoints[i], y: tile.object._textureBorderPoints[i + 1] }, b: { x: tile.object._textureBorderPoints[i + 2], y: tile.object._textureBorderPoints[i + 3] } });
      }
      segments.push({ a: { x: tile.object._textureBorderPoints[tile.object._textureBorderPoints.length - 2], y: tile.object._textureBorderPoints[tile.object._textureBorderPoints.length - 1] }, b: { x: tile.object._textureBorderPoints[0], y: tile.object._textureBorderPoints[1] } })
  } 

  return segments;
}

export function checkCollision(doc, update, tile) {
  const tokenMidX = ((doc.width * doc.parent.dimensions.size) / 2)
  const tokenMidY = ((doc.height * doc.parent.dimensions.size) / 2)
  const tokenPos = { x: doc.x + tokenMidX, y: doc.y + tokenMidY }
  const dest = { x: update.x || doc.x, y: update.y || doc.y }
  const contains = within(tile, tokenPos)
  const collisions = overlap(tile, doc, dest)
  if (contains && collisions.length) {

    // run exit macro
    const macroId = canvas.tiles.get(tile._id).document.flags[ID]?.exitMacro
    const macro = game.macros.find(m => m.data._id === macroId)
    if (macro) macro.execute()

    if ($(".terminal-window").length) {
      $(`.${ID}-window`).find(".header-button").click()
    }
    if ($(".terminal-skilled").length) {
      $(`.${ID}-skilled`).find(".header-button").click()
    }
  }
  if (contains || (update.x === undefined && update.y === undefined) || !collisions.length) {
    return
  }

  const flags = canvas.tiles.get(tile._id).document.flags[ID]
  if (!flags.enabled) return

  const macro = game.macros.find(m => m.data._id === flags?.entryMacro)
  if (macro) macro.execute()

  if ($(".terminal-window").length === 0) {
    const skilled = canvas.tiles.get(tile._id).document.flags[ID]?.skilled
    if (game.user.isGM) {
      if (skilled) {
        ui.notifications.info("Terminal | Skill check skipped since you are a GM")
      }
      new Terminal(tile._id, 2).render(true)
      return
    }
    if (skilled) {
      new Skilled(tile._id).render(true)
      game.socket.emit('module.terminal', {action: "skilled", uid: game.user.id, tid: tile._id})
      return
    }
    game.socket.emit('module.terminal', {action: "reveal", uid: game.user.id, tid: tile._id})
  }
}

export function giveAccess(data) {
  const journalId = game.settings.get(ID, "tiles")[data.tid]
  const j = game.journal.get(journalId)
  if (!j) {
    ui.notifications.error("Terminal | there is no journal associated with this Terminal", {permanent: true})
    return
  }
  const perm = j.ownership.default
  if (game.settings.get(ID, "notice")) {
    ui.notifications.info(`Terminal | ${game.users.get(data.uid).name} has been given observer on ${j.name} (this notice is just for GMs)`)
  }
  if (perm < 2) {
    j.update({ "ownership": { [data.uid]: 2 } }) // observer
  }

  // check on if any pages are not inherit
  const hasNoneOwn = j.pages.some(p => p.ownership.default === CONST.DOCUMENT_OWNERSHIP_LEVELS.NONE)
  if (hasNoneOwn) {
    ui.notifications.warn(`${game.users.get(data.uid).name} was given observer for ${j.name}. But pages within the journal were found to have a default ownership of 'none'. Those pages have been hidden from ${game.users.get(data.uid).name}`)
  }
  
  game.socket.emit('module.terminal', {
    ...data, action: "render", name: j.name, jid: j._id, perm
  })
}

export async function unlockDoor(data) {
  const scene = game.scenes.get(data.sid)

  // unlock door
  let changeReq = false
  const result = await scene.updateEmbeddedDocuments(
    "Wall",
    scene.walls.map(wall => {
      if (wall.id === data.wid && wall.ds === CONST.WALL_DOOR_STATES.LOCKED) {
        changeReq = true
        return {_id: wall.id, ds: CONST.WALL_DOOR_STATES.OPEN}
      }
      return {_id: wall.id}
    })
  )

  if (!changeReq) {
    ui.notifications.info(`Terminal | ${data.name} tried to unlock a door that wasn't locked`)
    return
  }

  if (result.length === 0) {
    ui.notifications.error(`Terminal | Failed to open door with wall id ${data.wid}`, {permanent: true})
    return
  }

  if (result[0].ds === CONST.WALL_DOOR_STATES.OPEN) {
    ui.notifications.info(`Terminal | Door on ${scene.name} has been unlocked & opened by ${data.name}`)
  } else if (changeReq) {
    ui.notifications.error(`Terminal | Failed to open door with wall id ${data.wid}`, {permanent: true})
  }
}

export async function revealMap(sceneId) {
  const scene = game.scenes.get(sceneId)
  const dimensions = scene.dimensions
  let [created_light] = await scene.createEmbeddedDocuments('AmbientLight', [{dim: dimensions.maxR, vision: true, walls: false, x: dimensions.width/2, y: dimensions.height/2}])
  await new Promise(r => setTimeout(r, 100))
  await created_light.update({hidden: true})
  await created_light.delete()
}

// IDs can be found under game.system.id
export const successLines = new Map([
  ["alienrpg", "maybe it isn't game over."],
  ["starwarsffg", "pure pazaak!"],
  ["blade-runner", "faster than any skin job could."],
  ["cyberpunk-red-core", "preem work."],
  ["fallout", "computer whiz"],
  // ["lancer", ""],
  // ["impmal", "Warhammer 40,000: Imperium Maledictum"],
  // ["wrath-and-glory", "Warhammer 40,000: Wrath & Glory"],
])

export const stylePresets = new Map([
  ["alienrpg", "alien"],
  ["starwarsffg", "star-wars"],
  ["blade-runner", "blade-runner"],
  ["cyberpunk-red-core", "cyberpunk"],
  ["fallout", "fallout"],
])

export const ASCII = {
ALIEN: `
                             __        ___       __  
  ________ _   ______ ______/ /_____  / (_)___  / /__
 / ___/ _ \\ | / / __ \`/ ___/ __/ __ \\/ / / __ \\/ //_/
 (__  )  __/ |/ / /_/ (__  ) /_/ /_/ / / / / / / ,<   
 /____/\\___/|___/\\__,_/____/\\__/\\____/_/_/_/ /_/_/|_|  
`,
ATLAS: `<pre>
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣀⠀⠀⠀⠀⠀⠀⣀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢹⣄⠀⠀⠀⠀⣠⡟⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⣤⡀⠀⢀⣤⣶⣿⣿⣿⣿⣿⣿⣿⣿⣶⣤⡀⣀⣤⣶⡟⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠈⣻⣾⣿⣿⣿⡿⠟⠛⠛⠛⠛⠻⢿⣿⣿⣿⡿⣻⡟⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⣴⣿⣿⣿⠟⠁⠀⠀⠀⠀⢀⣠⣴⣿⣿⡿⠋⣼⣿⣦⠀⠀⠀⠀⠀
⠀⢠⣄⣀⣼⣿⣿⡿⠁⠀⠀⠀⣀⣤⣾⣿⣿⣿⡿⠋⢀⣼⢿⣿⣿⣧⣀⣠⡄⠀
⠀⠀⠀⠙⣿⣿⣿⠁⠀⠀⠀⣼⠛⢿⣿⣿⡿⠋⠀⢀⡾⠃⠈⣿⣿⣿⠋⠀⠀⠀
⠀⠀⠀⠀⣿⣿⣿⠀⠀⢀⣾⠃⠀⠀⢙⡋⠀⠀⢠⡿⠁⠀⠀⣿⣿⣿⠀⠀⠀⠀
⠀⠀⠀⣠⣿⣿⣿⡀⢀⡾⠁⠀⢀⣴⣿⣿⣦⣠⡟⠁⠀⠀⢀⣿⣿⣿⣄⠀⠀⠀
⠀⠘⠋⠉⢻⣿⣿⣷⡿⠁⢀⣴⣿⣿⣿⡿⠟⠋⠀⠀⠀⢀⣾⣿⣿⡟⠉⠙⠃⠀
⠀⠀⠀⠀⠀⢻⣿⡟⢀⣴⣿⣿⠿⠋⠁⠀⠀⠀⠀⢀⣴⣿⣿⣿⡟⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⣼⢟⣴⣿⣿⣿⣷⣦⣤⣤⣤⣤⣴⣶⣿⣿⣿⡿⣯⡀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⣼⠿⠛⠉⠉⠛⠿⣿⣿⣿⣿⣿⣿⣿⣿⠿⠛⠉⠀⠈⠛⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣸⠋⠀⠉⠉⠀⠙⣧⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠉⠀⠀⠀⠀⠀⠀⠉⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
</pre>`,
DOOR: `<pre>
 ______________
|\\ ___________ /|
| |  /|,| |   | |
| | |,x,| |   | |
| | |,x,' |   | |
| | |,x   ,   | |
| | |/    |   | |
| |    /] ,   | |
| |   [/ ()   | |
| |       |   | |
| |       |   | |
| |       |   | |
| |      ,'   | |
| |   ,'      | |
|_|,'_________|_|
</pre>`,

// big money-se
FALLOUT: `
$$$$$$$\\            $$\\                           
$$  __$$\\           $$ |                          
$$ |  $$ | $$$$$$\\  $$$$$$$\\   $$$$$$$\\  $$$$$$\\  
$$$$$$$  |$$  __$$\\ $$  __$$\\ $$  _____|$$  __$$\\ 
$$  __$$< $$ /  $$ |$$ |  $$ |$$ /      $$ /  $$ |
$$ |  $$ |$$ |  $$ |$$ |  $$ |$$ |      $$ |  $$ |
$$ |  $$ |\\$$$$$$  |$$$$$$$  |\\$$$$$$$\\ \\$$$$$$  |
\\__|  \\__| \\______/ \\_______/  \\_______| \\______/ 
`,
CYBERPUNK: `
   ___   __            _ 
  / _ | / /_____ _____(_)
 / __ |/  '_/ _ \`/ __/ / 
/_/ |_/_/\\_\\\\_,_/_/ /_/  
`,

// aligator
STARWARS: `
      ::::::::   ::::::::  :::::::::  :::::::::: ::::    ::: :::::::::: ::::::::::: 
    :+:    :+: :+:    :+: :+:    :+: :+:        :+:+:   :+: :+:            :+:      
   +:+        +:+    +:+ +:+    +:+ +:+        :+:+:+  +:+ +:+            +:+       
  +#+        +#+    +:+ +#++:++#:  +#++:++#   +#+ +:+ +#+ +#++:++#       +#+        
 +#+        +#+    +#+ +#+    +#+ +#+        +#+  +#+#+# +#+            +#+         
#+#    #+# #+#    #+# #+#    #+# #+#        #+#   #+#+# #+#            #+#          
########   ########  ###    ### ########## ###    #### ##########     ###           
`,

// slant relief
BLADERUNNER: `
__/\\\\\\______________/\\\\\\_________________/\\\\\\\\\\\\_____/\\\\\\\\\\\\________________________________________________        
 _\\/\\\\\\_____________\\/\\\\\\________________\\////\\\\\\____\\////\\\\\\________________________________________________       
  _\\/\\\\\\_____________\\/\\\\\\___________________\\/\\\\\\_______\\/\\\\\\________________________________________________      
   _\\//\\\\\\____/\\\\\\____/\\\\\\___/\\\\\\\\\\\\\\\\\\_______\\/\\\\\\_______\\/\\\\\\_____/\\\\\\\\\\\\\\\\\\________/\\\\\\\\\\\\\\\\_____/\\\\\\\\\\\\\\\\__     
    __\\//\\\\\\__/\\\\\\\\\\__/\\\\\\___\\////////\\\\\\______\\/\\\\\\_______\\/\\\\\\____\\////////\\\\\\_____/\\\\\\//////____/\\\\\\/////\\\\\\_    
     ___\\//\\\\\\/\\\\\\/\\\\\\/\\\\\\______/\\\\\\\\\\\\\\\\\\\\_____\\/\\\\\\_______\\/\\\\\\______/\\\\\\\\\\\\\\\\\\\\___/\\\\\\__________/\\\\\\\\\\\\\\\\\\\\\\__   
      ____\\//\\\\\\\\\\\\//\\\\\\\\\\______/\\\\\\/////\\\\\\_____\\/\\\\\\_______\\/\\\\\\_____/\\\\\\/////\\\\\\__\\//\\\\\\________\\//\\\\///////___  
       _____\\//\\\\\\__\\//\\\\\\______\\//\\\\\\\\\\\\\\\\/\\\\__/\\\\\\\\\\\\\\\\\\__/\\\\\\\\\\\\\\\\\\_\\//\\\\\\\\\\\\\\\\/\\\\__\\///\\\\\\\\\\\\\\\\__\\//\\\\\\\\\\\\\\\\\\\\_ 
        ______\\///____\\///________\\////////\\//__\\/////////__\\/////////___\\////////\\//_____\\////////____\\//////////__
`,
}
