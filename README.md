# detect-device
Lightweight device detection library to use as middleware in Express.js
(based on https://github.com/rguerreiro/express-device and https://github.com/bjankord/Categorizr)

Following categories are recognizable: `desktop`, `tablet`, `phone`, `tv`, `bot`

It allows to set specific path for template rendering for each specific device.

Comparing to libraries on which its based, it also use some optimization to avoid a lot of IO operations per request.

Regexp's used to detect device type are collected into one object with logic operators - so you can easily edit them when needed.

## Sample usage:
```javascript
var device = require('detect-device');

app.use(device.bind({
    viewRouting: true,
    defaultType: 'desktop',
    defaultRoute: [ 'tv', 'tablet', 'bot' ]
}));
...
requests after middleware will contain property request.device which could be desktop, tablet, phone, tv or bot
```

## Options:
 - `defaultType` (default **'desktop'**) - if UA cannot be matched, this will be used as device type
 - `viewRouting` (default **false**) - enable/disable templates routing. If folder for current device type not found, `defaultType` will be used
 - `defaultRoute` (default **empty array**) - list device types which will route templates to `defaultRoute` (allow optimize logic a bit) (plus library will ass all non-exist device type folders here by itself)
 - `lookupRouteExistence` (default **false**) - enable existence check for template before usage, if it doesn't exist - uses root folder

# View routing
View routing allows automatically use folder for specific device having structure like:
```
 / views / desktop / 
         / phone / 
         / tablet / 
```
So you shouldn't care about manual template path specifying.

When library initialized first, it check known types (not specified in `defaultRoute`) in views folder and if some of them is not exist, it will be added to `defaultRoute`.

Afterwards when template is rendered, it checks if current device type included to `defaultRoute` and in that case render `/views/%defaultType%/%templateName%`

Otherwise it just render template `/views/%deviceType%/%templateName%` - but without checking if template actually is.

If you need this check, you can set `lookupRouteExistence` to true (in case template not exist will try render `/views/%templateName%` - that's could be useful for common templates)
