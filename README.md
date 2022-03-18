# Header Cards

Allows you to add badges and cards to the header in [Home Assistant](https://www.home-assistant.io/)

<img width="298" alt="image" src="https://user-images.githubusercontent.com/2099542/156809984-2bb15473-cfc4-4159-9a11-2595f001915e.png">

## Installation

You can install this manually or via [HACS](https://github.com/custom-components/hacs) if you want easy updating,

### Manually
* Download the **lovelace-header-cards.js** file and place it in your `www` folder.
* Add the file as a resource

### With HACS
Search for "Header Cards" in the Frontend section of HACS and follow the instructions.

## Config Options

| Config Option  | Type | Default | Description |
|:---------------|:---------------|:---------------|:----------|
|`replace_tabs:`| Boolean | false | Hides the tabs in the header (e.g. if you have created custom navigation buttons) |
|`justify_content:`| String | "right" | affects the layout of the badges and cards in the header - see below for more details |
|`badges:`| List |  | List of badges to add to header
|`cards:` | List |  | List of cards to add to header |

## Simple config example

```
header_cards:
  badges:
    - entity: binary_sensor.motion_trigger
      name: ''
  cards:
    - type: markdown
      content: |
        Hello it is {{ states("sensor.time") }}
views:
...
```

Note: `views:` is only included there to indicate where this config should be positioned in the Lovelace config

## justify_content

You can use this option to control the layout of the badges and cards in the header.
If this is not set, they will be aligned to the right hand size of the header.

Any of the values supported by the **justify-content** CSS property are accepted.
See [here](https://www.w3schools.com/cssref/css3_pr_justify-content.asp) for more details.


For example:

```
header_cards:
  justify_content: space-between
  badges:
    - entity: binary_sensor.motion_trigger
      name: ''
  cards:
    - type: custom:mushroom-chips-card
      chips:
        - type: weather
          entity: weather.dark_sky
          show_conditions: true
          show_temperature: true
          style: |
            ha-card {
              background: rgba(0,0,0,0);
            }
          tap_action:
            action: navigate
            navigation_path: /lovelace-desktop/weather-and-temperature
views:
...
```

Gives a layout like:

<img width="957" alt="image" src="https://user-images.githubusercontent.com/2099542/159037395-4380af9b-cc78-4029-9356-661456f7c05e.png">


### Limitations
There are some limitations in this initial release.

* Not all cards will display correctly in the header - you may be able to use card-mod to update the styling to make them fit better if there are issues
* Badges with labels may not display properly, the image may not display fully and the label may extend beyond the bottom of the header - removing the label by using `name: ''` avoids this.
