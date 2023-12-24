/* @license 2023 CodaBool all rights reserved */

import { ASCII } from './util.js'
import { audio } from './hooks.js'

export const ID = 'terminal'

export class Settings extends FormApplication {
  constructor(id) {
    super()
    this.tileId = id
  }
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      template: `modules/${ID}/templates/setting.hbs`,
      height: 700,
      width: 600,
      title: "Select Journals",
      submitOnChange: true,
    })
  }
  getData() {
    const setting = game.settings.get(ID, "tiles")
    const data = []
    for (const j of game.journal) {
      let checked = false 
      if (setting[this.tileId] === j._id) {
        checked = true
      }
      data.push({
        id: j._id,
        name: j.name,
        checked,
      })
    }
    return { data }
  }
  async _updateObject(event, data) {
    if (!data.journal) return
    console.log("update!!!!!!!!")
    const settings = game.settings.get(ID, "tiles")
    settings[this.tileId] = data.journal
    game.settings.set(ID, "tiles", settings)
    ui.notifications.info(`🔗 Associated ${game.journal.get(data.journal)?.name} with this Terminal`)
  }
}

export class Terminal extends Application {
  constructor(id, perm) {
    super()
    this.tileId = id
    this.perm = perm
  }
  static get defaultOptions() {
    const size = $(window).height() * .8
    return mergeObject(super.defaultOptions, {
      template: `modules/${ID}/templates/terminal.hbs`,
      width: size,
      height: size,
      popOutModuleDisable: true,
      classes: ["terminal-window"]
    })
  }
  close() {
    for (const sound of Object.values(audio)) {
      if (typeof sound === 'number') continue
      sound.fade(0).then(() => sound.stop())
    }
    return super.close()
  }
  getData() {
    const journalId = game.settings.get("terminal", "tiles")[this.tileId]
    const flags = game.scenes.viewed.tiles.get(this.tileId)?.flags["terminal"]
    const styles = game.settings.get(ID, "styles")
    if (!journalId) {
      ui.notifications.error(`Terminal | This Terminal does not have a Journal associated with it. ${game.user.isGM ? "You" : "The GM"} must associate one in the tile settings.`, {permanent: true})
      return { error: "This terminal has no data" }
    }
    if (!styles[flags?.style]) {
      ui.notifications.error(`Terminal | No style found for this Terminal. ${game.user.isGM ? "You" : "The GM"} must assign a style to this terminal in the tile settings.`, {permanent: true})
      return { error: "This terminal has no style" }
    }
    return {
      id: this.tileId,
      perm: this.perm,
      size: $(window).height() * .78,
      revealBtn:  flags?.explore,
      ...styles[flags?.style]
    }
  }
}

export class Skilled extends Application {
  constructor() { super() }
  static get defaultOptions() {
    const size = $(window).height() * .6
    return mergeObject(super.defaultOptions, {
      template: `modules/${ID}/templates/skilled.hbs`,
      width: size,
      height: size,
      classes: ["terminal-skilled"]
    })
  }
  getData() {
    const size = $(window).height() * .6
    // get the performance mode the client is running on
    const performance = game.settings.get("core", "performanceMode")
    return { size, performance }
  }
}

export class StyleForm extends FormApplication {
  constructor(id, readOnly) {
    super()
    this.uuid = id
    this.readOnly = readOnly
  }
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      template: `modules/${ID}/templates/form.hbs`,
      height: 800,
      width: 800,
      title: "Fine tune this style",
      submitOnClose: true,
      submitOnChange: true,
      closeOnSubmit: false,
      classes: ["terminal-form"]
    })
  }
  getData() {
    const styles = game.settings.get(ID, "styles")
    return { ...styles[this.uuid], readOnly: this.readOnly }
  }
  async _updateObject(event, data) {
    if (!Object.keys(data).length) return
    const styles = game.settings.get(ID, "styles")
    // TODO: setting a fallback ascii doesn't seem necessary
    // styles[this.uuid] = { ...data, ascii: data.ascii || ASCII.ALIEN, uuid: this.uuid }
    styles[this.uuid] = { ...data, uuid: this.uuid }
    await game.settings.set(ID, "styles", styles)
    // refresh parent Form
    if ($(`#${ID}-refresh`).length) $(`#${ID}-refresh`).click()
    ui.notifications.info("💾 Style saved")
    this.render()
  }
}

export class Style extends FormApplication {
  constructor() { super() }
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      template: `modules/${ID}/templates/style.hbs`,
      height: 700,
      width: 600,
      title: "Your Styles",
      submitOnClose: true,
      submitOnChange: true,
      closeOnSubmit: false,
      classes: ["terminal-style"]
    })
  }
  async _handleButtonClick(event) {
    const clickedElement = $(event.currentTarget)
    const action = clickedElement.data().action
    let uuid = event.target.id
    const styles = game.settings.get(ID, "styles")
    const len = Object.values(styles).filter(k => k.name.includes("custom ")).length
    if (action === "post") {
      uuid = crypto.randomUUID()
      styles[uuid] = {
        name: "custom style " + (len + 1),
        click: `/modules/${ID}/audio/blade_runner_click.mp3`,
        close: `/modules/${ID}/audio/cyberpunk_close.mp3`,
        startup: `/modules/${ID}/audio/generic_startup.mp3`,
        shadow: "#19572e",
        base: "#23a84f",
        highlight: "#b6fab6",
        ascii: ASCII.STARWARS,
        uuid,
      }
      await game.settings.set(ID, "styles", styles)
      new StyleForm(uuid).render(true)
    } else if (action === "delete") {
      const confirmed = await Dialog.confirm({
        content: `Are you sure you want to delete "${styles[uuid].name}"?`,
        title: "Confirm Deletion",
      })
      if (confirmed) {

        // TODO: should check if any tiles have this style
        delete styles[uuid]
        await game.settings.set(ID, "styles", styles)
      }
    } else if (action === "put") {
      new StyleForm(uuid).render(true)
    } else if (action === "view") {
      new StyleForm(uuid, true).render(true)
    }
    this.render()
  }
  activateListeners(html) {
    super.activateListeners(html)
    html.on('click', "[data-action]", this._handleButtonClick.bind(this))
  }
  _updateObject() {
    this.render()
  }
  getData() {
    const styles = game.settings.get(ID, "styles")
    return { styles }
  }
}
