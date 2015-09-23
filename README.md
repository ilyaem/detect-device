# detect-device
Lite device detection library to use as middleware in Express.js
(based on https://github.com/rguerreiro/express-device and https://github.com/bjankord/Categorizr)

Here is following types are possible: `desktop`, `tablet`, `phone`, `tv`, `bot`

It also allows to set specific path for template rendering for each specific device.

Also it use some optimization to avoid a lot of IO operations per request.

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
 - `defaultRoute` (default **empty array**) - list the list of device types which will route templates to `defaultRoute` - allow optimize logic a bit, also all non-exist device type folders will be added here
 - `lookupRouteExistence` (default **false**) - enabled existence check for template before use it, if its not exist used root folder

# View routing
View routing allows automatically use folder for specific device having structure like:
```
 / views / desktop / 
         / phone / 
         / tablet / 
```
So you shouldn't care about manual specifying template path.

When library initialized first, it check known types (not specified in `defaultRoute`) in views folder and if some of them is not exist, it will be added to `defaultRoute`.

Afterwards when template is rendered, it checks if current device type included to defaultRoute and in that case render `/views/%defaultType%/%templateName%`

Otherwise it just render template `/views/%deviceType%/%templateName%` - but without checking if template actually is.

If you need this check, you can set `lookupRouteExistence` to true so it will check template existence and in case its not found will try render `/views/%templateName%` - that's could be useful for common templates.
