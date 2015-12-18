# OpenLayers Export Map
A class capable of exporting base layer tiles and vector layer tiles using OpenLayers Version 2

## Installation 
In order to install the Export Map function you have to include the main JS file in your head tag

`<script src="../ExportMap.js" type="text/javascript"></script>` or `ExportMap.min.js` if your using the minified version!

Once this is there, you should be ready to go! To trigger the export map functions you will need to call

`exportMap.trigger();` - you can pass a canvas object into this function or leave it blank (it'll create one for you!)

Now you should see your map in a Canvas HTML Element!

## Testing
If you look in the `test` folder you will be able to see examples on how to use the class. More will be added to cover other base maps and include vector layers

## Troubleshooting

1. My vector layer isnt exporting!
  - You need to change the Renderer for the Vector layer to use Canvas. More info can be found here: http://gis.stackexchange.com/a/71925
  
## Credits

Thanks to CampToCamp for the initial idea on how to export maps.
