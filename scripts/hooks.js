/* @license 2023 CodaBool all rights reserved */

import { Settings, Terminal, ID, Style }from './ui.js'
import { checkCollision, giveAccess, unlockDoor, successLines, stylePresets, revealMap, ASCII }from './util.js'
export const audio = {volume: 1}

Hooks.on("init", async () => {
  setTimeout(() => {
    const u = game.users?.filter(u => u.active && u.isGM)
    if (!u?.length) {
      ui.notifications.warn("No GM was found to be online. Some features of Terminal will not function.")
    }
  }, 15_000)
  
  game.settings.register(ID, "tiles", {
		scope: "world",
    restricted: true,
    type: Object,
    default: {},
	})
  game.settings.register(ID, "styles", {
		scope: "world",
    restricted: true,
    type: Object,
    default: {
      "fallout": {
        ascii: ASCII.FALLOUT,
        shadow: "#19572e",
        base: "#23a84f",
        highlight: "#b6fab6",
        name: "Fallout",
        click: "/modules/terminal/audio/fallout_click.mp3",
        close: "/modules/terminal/audio/fallout_close.mp3",
        startup: "/modules/terminal/audio/fallout_startup.mp3",
        uuid: "fallout",
        readOnly: true,
      },
      "alien": {
        ascii: ASCII.ALIEN,
        shadow: "#19572e",
        base: "#23a84f",
        highlight: "#b6fab6",
        name: "Alien",
        click: "modules/terminal/audio/alien_click.mp3",
        close: "modules/terminal/audio/alien_close.mp3",
        startup: "modules/terminal/audio/alien_startup.mp3",
        uuid: "alien",
        readOnly: true,
      },
      "star-wars": {
        ascii: ASCII.STARWARS,
        shadow: "#000d1c",
        base: "#409bbf",
        highlight: "#8bcbf7",
        name: "Star Wars",
        background: "modules/terminal/background/blue.mp4",
        click: "modules/terminal/audio/star_wars_click.mp3",
        close: "modules/terminal/audio/star_wars_close.mp3",
        startup: "modules/terminal/audio/star_wars_startup.mp3",
        uuid: "star-wars",
        opacity: .2,
        readOnly: true,
      },
      "cyberpunk": {
        ascii: ASCII.CYBERPUNK,
        background: "modules/terminal/background/cyberpunk.webp",
        shadow: "#5a0000",
        base: "#ff0000",
        highlight: "#ff9595",
        name: "Cyberpunk",
        click: "modules/terminal/audio/cyberpunk_click.mp3",
        close: "modules/terminal/audio/cyberpunk_close.mp3",
        startup: "modules/terminal/audio/cyberpunk_startup.mp3",
        uuid: "cyberpunk",
        opacity: .8,
        readOnly: true,
      },
      "blade-runner": {
        ascii: ASCII.BLADERUNNER,
        shadow: "#3d3d3d",
        base: "#ffff92",
        highlight: "#ffffff",
        name: "Blade Runner",
        background: "modules/terminal/background/blade_runner.webp",
        click: "modules/terminal/audio/blade_runner_click.mp3",
        close: "modules/terminal/audio/blade_runner_close.mp3",
        startup: "modules/terminal/audio/blade_runner_startup.mp3",
        uuid: "blade-runner",
        opacity: .6,
        readOnly: true,
      },
      "generic-red": {
        ascii: ASCII.STARWARS,
        shadow: "#340000",
        base: "#b52a2a",
        highlight: "#f98686",
        name: "Generic Red",
        background: "modules/terminal/background/red.mp4",
        click: "modules/terminal/audio/blade_runner_click.mp3",
        close: "modules/terminal/audio/cyberpunk_close.mp3",
        startup: "modules/terminal/audio/generic_startup.mp3",
        uuid: "generic-red",
        opacity: .2,
        readOnly: true,
      },
      "generic-green": {
        ascii: ASCII.STARWARS,
        shadow: "#19572e",
        base: "#23a84f",
        highlight: "#b6fab6",
        name: "Generic Green",
        background: "modules/terminal/background/green.mp4",
        click: "modules/terminal/audio/blade_runner_click.mp3",
        close: "modules/terminal/audio/cyberpunk_close.mp3",
        startup: "modules/terminal/audio/generic_startup.mp3",
        uuid: "generic-green",
        opacity: .2,
        readOnly: true,
      },
      // "lancer": { },
      // "warhammer": { },
      // "mothership": { },
      // "starfinder": { },
    },
	})

  game.settings.register(ID, "screensaver", {
		scope: "world",
    name: "🖵 Screensaver",
    hint: "Skill check required Terminals display an interactive visual. This might not aesthetically mesh well with some game systems.",
    type: Boolean,
    default: true,
    config: true,
    restricted: true,
	})
  game.settings.register(ID, "notice", {
		scope: "world",
    name: "🔔 Permission notifications",
    hint: "Give a notification when someone is given observer permission to a Journal",
    type: Boolean,
    default: false,
    config: true,
    restricted: true,
	})
  game.settings.registerMenu(ID, "styleMenu",{
    name: "🎨 Styles",
    label: "Edit Styles",
    hint: "Create custom styling for your terminals",
    type: Style,
    icon: "fa-solid fa-paintbrush", 
    restricted: true,
  })
  Handlebars.registerHelper('readonlyIf', readOnly => {
    return readOnly ? 'readonly disabled' : ''
  })
  game.socket.on('module.terminal', async data => {
    if (data.action === "reveal") {
      if (!game.user.isGM) return
      giveAccess(data)
    } else if (data.action === "unlock") {
      if (!game.user.isGM) return
      unlockDoor(data)
    } else if (data.action === "close") {
      if (game.user.id !== data.uid) return
      if ($(`.${ID}-skilled`).length) {
        ui.notifications.info("❌ Terminal access denied")
        $(`.${ID}-skilled`).find(".header-button").click()
      }
    } else if (data.action === "notify") {
      if (!game.user.isGM) return
      ui.notifications.error(data.message, {permanent: true})
    } else if (data.action === "explore") {
      if (!game.user.isGM) return
      revealMap(data.sid)
      ui.notifications.info(`🗺️ ${data.name} has downloaded the map for ${game.scenes.get(data.sid).name} and shared it`)
    } else if (data.action === "render") {
      if (game.user.id !== data.uid) return
      if (data.close && $(`.${ID}-skilled`).length) {
        $(`.${ID}-skilled`).find(".header-button").click()
      }
      if (data.skilled) {
        ui.notifications.info("🔓 Terminal access granted " + (successLines.get(game.system.id) ?? ""))
      }
      new Terminal(data.tid, data.perm).render(true)
      // too buggy to try and find if token is on tile. just assume they are still on it

      // const tile = canvas.tiles.get(data.tid)
      // const tokens = game.scenes.viewed.tokens.filter(t => t.isOwner)
      // let onTile = false
      // console.log("starting wait")
      // await new Promise(r => setTimeout(() => r('Waited for 1 second'), 400))
      // console.log("finish wait")
      // for (const token of tokens) {
      //   const tokenMidX = ((token.width * token.parent.dimensions.size) / 2)
      //   const tokenMidY = ((token.height * token.parent.dimensions.size) / 2)
      //   const tokenPos = { x: token.x + tokenMidX, y: token.y + tokenMidY }
      //   if (within(tile.document, tokenPos)) {
      //     onTile = true
      //   }
      // }
      // if (onTile) {
      //   new Terminal(data.tid, data.perm).render(true)
      // } else {
      //   ui.notifications.error("You were granted access but have walked away from the terminal", {permanent: true})
      // }

    } else if (data.action === "skilled") {
      if (!game.user.isGM) return
      const user = game.users.get(data.uid)
      data.close = true
      new Dialog({
        title: "Access",
        content: `<p style="font-size:1.4em"><strong>${user.name}</strong> is attempting to open a skill required Terminal. Have them perform your <strong>skill check</strong> of choice. Then chose the appropriate action.</p><br/>`,
        buttons: {
          allow: {
            icon: '<i class="fas fa-check"></i>',
            label: `Allow ${user.name}`,
            callback: () => {
              data.skilled = true
              giveAccess(data)
            }
          },
          deny: {
            icon: '<i class="fa-solid fa-ban"></i>',
            label: `Deny ${user.name}`,
            callback: () => {
              game.socket.emit('module.terminal', { action: "close", uid: data.uid })
            }
          },
        },
      }).render(true)
    } else {
      if (!game.user.isGM) return
      const j = game.journal.get(data.jid)

      if (!j) {
        ui.notifications.error("Terminal | Changing permission on a journal failed because it could not be found. Ensure you have a journal associated with all enabled Terminals", {permanent: true})
        return
      }

      if (game.settings.get(ID, "notice")) {
        ui.notifications.info(`Terminal | Everyone has been given observer on ${j.name} (this notice is just for GMs)`)
      }

      // check on if any pages are not inherit
      const hasNoneOwn = j.pages.some(p => p.ownership.default === CONST.DOCUMENT_OWNERSHIP_LEVELS.NONE)
      if (hasNoneOwn) {
        ui.notifications.warn(`${j.name} was given a default ownership of Observer. But pages within the journal were found to have a default ownership of 'none'. You may need to reveal those page(s) manually. If you want all pages accessible.`, {permanent: true})
      }

      j.update({ "ownership": { "default": 2 } }) // observer
      ChatMessage.create({
        content: `@UUID[JournalEntry.${data.jid}]{${j.name}} has been discovered`,
      })
    }
  })
})

Hooks.on('preUpdateToken', async (token, update) => {
  token.parent.tiles.forEach(tile => {
    if (tile.flags[ID]?.enabled) {
      if (game.modules.get("levels")?.active) {
        if (token.elevation >= (tile.flags.levels?.rangeBottom ?? -1000) && token.elevation <= (tile.flags.levels?.rangeTop ?? 1000)) {
          checkCollision(token, update, tile)
        }
      } else {
        checkCollision(token, update, tile)
      }
    }
  })
})

// Hooks.on("renderSettingsConfig", (_, html) => { })

// interface should be better but it defaults to .5 so it's less predicatable
Hooks.on("globalAmbientVolumeChanged", async volume => {
  audio.volume = volume
  for (const sound of Object.values(audio)) {
    if (typeof sound === 'number') continue
    sound.volume = volume
  }
})

// validation on tile settings
Hooks.on("updateTile", tile => {
  if (!tile.getFlag(ID, "enabled")) return

  // style
  if (!tile.getFlag(ID, "style")) {
    ui.notifications.error("Terminal | No style selected. This is required!")
  }

  // unlock
  const wallIds = tile.getFlag(ID, "unlockIds").replace(/\s/g, '').split(",")
  for (const id of wallIds) {
    if (id === "") continue
    if (!canvas.walls.get(id)) {
      ui.notifications.error(`Terminal | Wall ${id} is not valid`, {permanent: true})
      break
    } else {
      if (!canvas.walls.get(id)?.doorControl) {
        ui.notifications.error(`Terminal | Wall ${id} is not a door`, {permanent: true})
        break
      }
    }
  }
  
  // exit macro
  const exitMacroId = tile.getFlag(ID, "exitMacro")
  const exitMacro = game.macros.find(m => m.data._id === exitMacroId)
  if (!exitMacro && exitMacroId !== "") {
    ui.notifications.error(`Terminal | The exit macro ${exitMacroId} could not be found`, {permanent: true})
  }

  // entry macro
  const entryMacroId = tile.getFlag(ID, "entryMacro")
  const entryMacro = game.macros.find(m => m.data._id === entryMacroId)
  if (!entryMacro && entryMacroId !== "") {
    ui.notifications.error(`Terminal | The exit macro ${entryMacroId} could not be found`, {permanent: true})
  }

  // journal
  const journalId = game.settings.get("terminal", "tiles")[tile._id]
  if (!game.journal.get(journalId)) {
    ui.notifications.error("Terminal | A Journal must be associated with an enabled Terminal. Assign a journal from the Tile's Terminal tab.", {permanent: true})
  }
})

Hooks.on("renderTileConfig", (app, html, data) => {
  const style = app.object.getFlag(ID, "style")
  const enabled = app.object.getFlag(ID, "enabled")
  const skilled = app.object.getFlag(ID, "skilled")
  const explore = app.object.getFlag(ID, "explore")
  const unlockIds = app.object.getFlag(ID, "unlockIds")
  const exitMacro = app.object.getFlag(ID, "exitMacro")
  const entryMacro = app.object.getFlag(ID, "entryMacro")

  let content = `
  <div class='tab' data-tab='${ID}'>
    <div class="form-group slim">
      <label>Terminal Enabled</label>
      <div class="form-fields">
        <input type="checkbox" name="flags.${ID}.enabled" ${enabled && "checked"}>
      </div>
      <p class="hint">When enabled any token which moves onto the tile will open the UI.</p>
    </div>
    <div class="form-group slim">
      <div class="form-fields" style="display: block;">
        <button id="terminal-data-btn" style="margin: .8em 0 .8em 0; height: 2.5em;">
          <i class="fa-solid fa-book fa-beat" style="margin-right:1em;"></i>
          Assign Journal
        </button>
      </div>
    </div>
    <div class="form-group slim">
      <label>Require Skill Check</label>
      <div class="form-fields">
        <input type="checkbox" name="flags.${ID}.skilled" ${skilled && "checked"}>
      </div>
      <p class="hint">Tile will need require GM confirmation before given read access. Allowing a chance for skill check rolls.</p>
    </div>
    <p style="text-align:center; color:grey;">Comma seperated list of wall IDs in this scene (hint: doors use wall IDs! The top left button of a wall's settings copies the ID)</p>
    <div class="form-group slim">
      <label>Unlock door(s)</label>
      <div class="form-fields">
        <input name="flags.${ID}.unlockIds" value="${unlockIds || ""}">
      </div>
    </div>
    <p style="text-align:center; color:grey;">Use the ID of the macro (warning, these run regardless of if the terminal ui is open. but do require the terminal to be enabled)</p>
    <div class="form-group slim">
      <label>Run Macro on Entry</label>
      <div class="form-fields">
        <input name="flags.${ID}.entryMacro" value="${entryMacro || ""}">
      </div>
    </div>
    <div class="form-group slim" style="margin-bottom:1em;">
      <label>Run Macro on Exit</label>
      <div class="form-fields">
        <input name="flags.${ID}.exitMacro" value="${exitMacro || ""}">
      </div>
    </div>
    <div class="form-group slim" style="margin-bottom:1em;">
      <label>Style</label>
      <select name="flags.${ID}.style" id="${ID}-select"></select>
      <p class="hint">Configure additional styles in the game settings menu.</p>
    </div>
    <p style="text-align:center; color:grey;">Include a button which will explore entire scene</p>
    <div class="form-group slim" style="margin-bottom:1em;">
      <label>Download map data</label>
      <div class="form-fields">
        <input type="checkbox" name="flags.${ID}.explore" ${explore && "checked"}>
      </div>
    </div>
  </div>
  `

  if (!data.data._id) {
    content = `<div class='tab' data-tab='${ID}'><p style="color:grey;">You must "Create Tile" before editing Terminal settings</p></div>`
  }

  html.find(".tabs .item").eq(2).after(`
    <a class="item" data-tab="${ID}">
      <i class="fa-solid fa-computer"></i> Terminal
    </a>
  `)
  html.find(".tab").eq(2).after(content)

  if (data.data._id) {
    const select = $(`#${ID}-select`)
    const styles = game.settings.get(ID, "styles")
    let lastUUID = ""
    $.each(styles, (uuid, data) => {
      lastUUID = uuid
      select.append($('<option>', {
        text: data.name,
        value: data.uuid,
      }))
    })

    if (style) {
      select.val(style)
    } else {

      // pick a default style
      if (stylePresets.get(game.system.id)) {
        select.val(stylePresets.get(game.system.id))
      } else {
        if (lastUUID) select.val(lastUUID)
      }
    }
  }

  const btn = document.getElementById(`${ID}-data-btn`)
  btn?.addEventListener('click', e => {
    e.preventDefault()
    new Settings(data.data._id).render(true)
  })
})
