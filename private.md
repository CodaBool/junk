# Dev Notes
## TODO
- SKIP: reset permissions
- SKIP: hacking / puzzle minigame
- SKIP: button to see changelog somewhere
- allow for relocking a door
- verify Firefox windows runs better
  - could use (navigator.userAgent.indexOf("Linux") !== -1) to see if Linux Firefox is in use

## ONLY 2k MINUTES / MONTH ON PRIVATE GITHUB ACTIONS

### Permission resets to Default
> you can set anyone to default with this

```js
let permission = game.journal.get("LV5m2T5XWE312nnm").ownership
for (let u of game.users) {
  if (!u.isGM) delete permission[u.id]
}
game.journal.get("LV5m2T5XWE312nnm").update({ permission })
```

## Links
- [reference](https://brennan.io/2017/06/14/alien-computer-card/)
- [icons](https://fontawesome.com/search?o=r&c=gaming)
- [edit audio](https://audiomass.co/)
- [trim video](https://online-video-cutter.com)
- [make boomerang (adds watermark)](https://clideo.com/how-to-make-boomerang-video)
- [remove watermark](https://online-video-cutter.com/remove-logo)
- [compress](https://www.freeconvert.com/video-compressor)

# Art
- https://codepen.io/obsfx/pen/jOWVOYL box with listener
- https://codepen.io/tholman/pen/BQLQyo typing
- https://codepen.io/umarcbs/pen/mdEJezx typing
- sw video = Isaac Taracks + http://www.taracks.com

# pull latest manifest

wrangler d1 execute foundry --command="SELECT * FROM manifests"


# bugs 
- walking off too fast keeps the terminal open
- walking back on messes with loading timeout

# process
- trim video = https://online-video-cutter.com/
- make boomerang = https://clideo.com/how-to-make-boomerang-video
- remove watermark = https://online-video-cutter.com/remove-logo
- compress = https://www.freeconvert.com/video-compressor

# links

