# High Noon Scene Standard v1

The saloon is the reference scene for every future level.

Each level should define five pieces:

1. **Background** — one full 16:9 backplate image.
2. **Anchors** — named, reusable positions tied to believable objects in the art. Do not place actors with unexplained raw coordinates once a scene has been converted.
3. **Occluders** — transparent full-size PNG overlays copied from the background. These render above actors so tables, bars, balcony rails, barrels, doors, etc. can hide the correct parts of a character.
4. **Ambient actors** — civilians or other characters that already exist in the room before their encounter beat begins.
5. **Encounters** — the fixed, learnable sequence of civilian and villain actions.

## Anchor shape

```js
anchorName: { x: 50, y: 65, scale: 0.8, z: 20 }
```

`x` and `y` are percentages of the scene. `y` is the actor's foot/bottom anchor. `scale` represents depth. `z` is available for same-layer ordering.

## Reusable motion names

- `rise` — actor rises vertically from cover.
- `leanRight` — actor leans out from the left side of an object.
- `leanLeft` — actor leans out from the right side of an object.
- `doorEnter` — actor begins at a door/deep anchor and moves toward a shooting anchor.
- `balconyStep` — actor steps from an upstairs doorway to a balcony firing position.
- `standExitLeft` — seated civilian stands and exits left.
- `standExitRight` — seated civilian stands and exits right.

Additional motions should reuse this pattern rather than adding one-off coordinate logic.

## Occluder rule

Occluder PNGs must have the exact same pixel dimensions and crop as the background. Everything except the foreground object is transparent. Examples:

- table front/chairs
- piano body
- barrel or crate
- saloon doors
- bar counter/front
- balcony railing

Actors render between the background and these overlays.

## Hitbox rule

Actors behind cover should not be shootable through the hidden part of their body. Each encounter may define a reduced hitbox:

```js
hitbox: { left: 10, right: 10, top: 0, bottom: 45 }
```

Values are percentages inset from the actor rectangle.

## Future-level workflow

For Main Street, Bank, Livery, and Hideout: finish the background first, identify believable cover objects, create named anchors, extract occluder PNGs, place any persistent civilians, then author the fixed encounter sequence. Only after geometry is locked should final sprite animation sheets be produced.
