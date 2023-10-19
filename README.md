# The Dam Selector

This module contains the implementation of the *Dam Selector*, a `selectorType` for Jahia 8.1.2.x

This module simplifies the process for contributors who want to choose a digital asset provider for adding new media to their content.
The selector's dropdown list is automatically filled with the enabled DAM providers specific to the web project,
making the selection process effortless.

![][001]

![][002]

## Module content
This module contains:
* A React application : [DamSelector.jsx][react:DamSelector.js].
  This application serves as a custom jContent SelectorType, designed to showcase all the enabled Dam Pickers available
  for use within the web project where it is deployed.

## How To use it
The *Dam Selector* functions as a jContent SelectorType and can be activated using a [JSON override][academy:override].
For instance, it is utilized by the [Industrial templateSet][git:industrial] to oversee image and video source providers.
In this templateSet to enable the Dam Selector for the image property of the specified [carousel content type][git:industrial:cnd], we follow these steps:
- write a content definition with a weakreference to contribute an image
```cnd
[tint:owlcarouselItemS] > jnt:content, timix:videoReference, mix:title
 - image (weakreference, picker[type='image']) mandatory
```
- create a [json file][git:industrial:override] with the following object :
```json
{
  "name": "tint:owlcarouselItemS",
  "fields": [
    {
      "name": "image",
      "selectorType": "DamSelector"
    }
  ]
}
```
If you use the Dam Selector don't forget to add a [dependency][git:industrial:pom.xml] with the module **dam-selector**

## How to reference your DAM Picker
The *Dam Selector* scans all the entries within the `damSelectorConfiguration` in the **Jahia React Registry**.
For each entry, it verifies if the configured Dam module is accessible for the current web project.
When a match is found, it includes the Dam as an option in the dropdown menu.

The `damSelectorConfiguration` entry is registred as follows with:
- a `key`, in the example below **Picker**. This key must be the name of the selectorType used to pick a media.
- a config object :
  - `types` of the nodes you can pick with the picker.
  - `label` : name of the Dam service (e.g. Cloudinary).
  - `description` : use as tooltips in the options of the dropdown.
  - `module` : name (artifactId) of the jahia module which contains the Dam selectorType.
  - `icon` : logo of the Dam company.

Below an example of configuration for the [Embedded Jahia Dam][jahiaConfig] :
```js
registry.add('damSelectorConfiguration', 'Picker', {
    types: ['jmix:image', 'jnt:file'],
    label: 'dam-selector:label.selectorConfig.label',
    description: 'dam-selector:label.selectorConfig.description',
    module: 'default',
    icon: svgJahiaLogo
});
```
You can find other examples of configuration for [Cloudinary][cloudyConfig], [Widen][widenConfig] and [Keepeek][keepeekConfig]

[001]: ./doc/images/001_selector.png
[002]: ./doc/images/002_choice.png

[react:DamSelector.js]: ./src/javascript/DamSelector/DamSelector.jsx
[git:industrial]: https://github.com/hduchesne/industrial
[git:industrial:cnd]: https://github.com/hduchesne/industrial/blob/main/src/main/resources/META-INF/definitions.cnd
[git:industrial:override]: https://github.com/hduchesne/industrial/blob/main/src/main/resources/META-INF/jahia-content-editor-forms/fieldsets/tint_owlcarouselItemS.json
[git:industrial:pom.xml]:https://github.com/hduchesne/industrial/blob/main/pom.xml
[academy:override]: https://academy.jahia.com/documentation/developer/jahia/8/extending-and-customizing-jahia-ui/customizing-content-editor-forms/examples-of-content-definition-json-overrides
[jahiaConfig]:./src/javascript/init.js
[cloudyConfig]:https://github.com/Jahia/cloudinary-picker/blob/main/src/javascript/init.js
[widenConfig]:https://github.com/Jahia/widen-asset-picker/blob/main/src/javascript/init.js
[keepeekConfig]:https://github.com/Jahia/keepicker/blob/main/src/javascript/init.js