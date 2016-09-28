/**
 * @author Richard Hughes <me@richiehughes.co.uk>
 * @class
 * @description A Class to export base layers and vector layers to a HTML5 canvas
 * @version 1.0
 */

OpenLayers.Control.ExportMap = OpenLayers.Class(OpenLayers.Control, {
    /**
     *
     */
    type: OpenLayers.Control.TYPE_BUTTON,
    canvasComponents: [],
    tileData: {},
    /**
     * Remove all the Canvas Components and the Tile Data
     */
    removeStoredData: function () {
        this.canvasComponents = [];
        this.tileData = {};
    },
    /**
     * A function to trigger the ExportMap functions.
     *
     * @public
     * @param {HTMLElement|undefined} canvas The HTML Element of the Canvas
     * @returns {HTMLElement} The generated canvas element
     */
    trigger: function (canvas) {

        this.setUpCanvas(canvas);

        this.removeStoredData();

        this.map.layers.forEach(function (layer) {
            if (layer.visibility) {
                if (layer instanceof OpenLayers.Layer.Vector) {
                    this.exportVectorLayer(layer);
                } else if (layer instanceof OpenLayers.Layer.Grid) {
                    this.exportGridLayer(layer);
                }
            }
        }.bind(this));

        return this.canvas;
    },
    /**
     * A function to set up the canvas, if none are provided then we'll create
     * a new canvas element
     *
     * @private
     * @param {type} canvas The canvas being used
     * @returns {undefined}
     */
    setUpCanvas: function (canvas) {
        if (!canvas) {
            this.canvas = document.createElement('canvas');
        } else {
            this.canvas = canvas;
        }

        this.canvasContext = this.canvas.getContext('2d');
        this.canvas.width = this.map.viewPortDiv.clientWidth;
        this.canvas.height = this.map.viewPortDiv.clientHeight;
    },
    /**
     * A function to export a Vector Layer onto the canvas. Due to stacking issues
     * canvas produced in this function are added to our canvasComponents array before
     * being added to the canvas at the end of execution
     *
     * @private
     * @param {<OpenLayers.Layer.Vector>} layer The layer to export
     * @returns {undefined}
     */
    exportVectorLayer: function (layer) {
        if (!(layer.renderer instanceof OpenLayers.Renderer.Canvas)) {
            return;
        }

        var canvasRenderer = layer.renderer;
        if (canvasRenderer.canvas !== null) {
            var canvasContext = canvasRenderer.canvas;
            this.canvasComponents.push(canvasContext.canvas);
        }
    },
    /**
     * A function to export the Grid layer. We need to generate all the tiles for the layer
     * and then stitch them together onto the canvas.
     *
     * @private
     * @param {<OpenLayers.Layer.Grid>} layer The layer to export
     * @returns {undefined}
     */
    exportGridLayer: function (layer) {
        this.offsetX = parseInt(this.map.layerContainerDiv.style.left);
        this.offsetY = parseInt(this.map.layerContainerDiv.style.top);
        this.stitchTiles(layer);
    },
    /**
     * This function calculates all the tiles on display and finds their positions
     * relative to the other tiles.
     *
     * @private
     * @param {<OpenLayers.Layer.Grid>} layer The layer to export
     * @returns {undefined}
     */
    stitchTiles: function (layer) {

        var that = this;
        this.imagePromises = [];
        layer.grid.forEach(function (tiles) {
            tiles.forEach(function (tile) {
                var url = layer.getURL(tile.bounds);

                if (!that.tileData[url]) {
                    that.tileData[url] = {
                        x: tile.position.x + that.offsetX,
                        y: tile.position.y + that.offsetY
                    };
                }

                that.imagePromises.push(that.loadImage(url));
            })
        });

        Promise.all(this.imagePromises)
            .then(function () {
                that.drawLoadedImages()
            });
    },
    /**
     * A function to load the tile image from a URL. When all the images have been loaded
     * it will proceed to draw the images on the canvas using the drawCanvasComponent function
     *
     * @private
     * @param {String} url
     * @returns {Promise}
     */
    loadImage: function (url) {
        var that = this;
        return new Promise(function (resolve, reject) {
            var image = document.createElement('img');
            var that2 = that;

            image.onload = function () {
                // Add the tile to the front of the array
                that2.canvasComponents.unshift(image);
                resolve(image);
            };

            image.src = url;
        });
    },
    /**
     * Draw the loaded images
     *
     * @private
     */
    drawLoadedImages: function () {
        var that = this;
        this.canvasComponents.forEach(function (canvasComponent) {
            if (canvasComponent.toString().indexOf('HTMLCanvasElement') > -1) {
                that.drawCanvasComponent(canvasComponent, 0, 0);
                return true;
            }

            var pos = that.tileData[canvasComponent.src];
            that.drawCanvasComponent(canvasComponent, pos.x, pos.y);
        });
    },
    /**
     * Draws a canvas component onto the canvas context
     *
     * @private
     * @param {Canvas|Image} canvasComponent The Canvas or tile image being loaded on to the canvas
     * @param {Number} x The X coordinate of the image
     * @param {Number} y The Y coordinate of the image
     * @returns {undefined}
     */
    drawCanvasComponent: function (canvasComponent, x, y) {
        this.canvasContext.drawImage(canvasComponent, x, y);
    },
    CLASS_NAME: "OpenLayers.Control.ExportMap"
});