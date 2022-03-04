# Header Cards

Allows you to add badges and cards to the header in [Home Assistant](https://www.home-assistant.io/)

![image](https://user-images.githubusercontent.com/2099542/156801065-cee10322-dbf6-4347-bb76-90d7e4c2c590.png)

## Config Options

| Config Option | Type | Description |
|:---------------|:---------------|:----------|
|`badges:`| List | List of badges to add to header
|`cards:` | List | List of cards to add to header |

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


### Limitations
There are some limitations in this initial release.

* Not all cards will display correctly in the header - you may be able to use card-mod to update the styling to make them fit better if there are issues
* Badges with labels may not display properly, the image may not display fully and the label may extend beyond the bottom of the header - removing the label by using `name: ''` avoids this.
