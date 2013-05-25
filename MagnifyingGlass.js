/*
THIS SOFTWARE IS PROVIDED BY OPENLAYERS CONTRIBUTORS ``AS IS'' AND ANY EXPRESS
OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT
SHALL COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT,
INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE
OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF
ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

/**
 * @requires OpenLayers/Control.js
 */

/**
 * Class: OpenLayers.Control.MagnifyingGlass
 * The MagnifyingGlass is a visible control
 *
 * Inherits from:
 *  - <OpenLayers.Control>
 */
OpenLayers.Control.MagnifyingGlass = OpenLayers.Class(OpenLayers.Control, {
    /** 
     * Property: control
     * {DOMElement} Div control containing magnifying glass image 
     */
    control: null,

    /** 
     * Property: position
     * {<OpenLayers.Pixel>} 
     */
    position: null,

    /**
     * Constructor: OpenLayers.Control.MagnifyingGlass
     * 
     * Parameters:
     * options - {Object}
     */
    initialize: function(options) {
        this.position = new OpenLayers.Pixel(OpenLayers.Control.MagnifyingGlass.X,
                                             OpenLayers.Control.MagnifyingGlass.Y);
        OpenLayers.Control.prototype.initialize.apply(this, arguments);
    },

    /**
     * APIMethod: destroy
     */
    destroy: function() {
        this._removeButton(this.control);
        this.position = null;
        OpenLayers.Control.prototype.destroy.apply(this, arguments);
    },

    /**
     * Method: draw
     *
     * Parameters:
     * px - {<OpenLayers.Pixel>} 
     * 
     * Returns:
     * {DOMElement} A reference to the container div for the MagnifyingGlass control.
     */
    draw: function(px) {
        OpenLayers.Control.prototype.draw.apply(this, arguments);
        px = this.position;

        var img = "magnifying-glass.png";
        var id = "magnifying-glass";
        var imgLocation = OpenLayers.Util.getImagesLocation(img) + img;
        
        this.control = OpenLayers.Util.createAlphaImageDiv(this.id + "_" + id,
            px, {w: 30, h: 31}, imgLocation, "absolute");

        this.control.style.cursor = "pointer";
        this.control.action = id;
        this.control.map = this.map;

        OpenLayers.Event.observe(this.control, "mousedown", 
            OpenLayers.Function.bindAsEventListener(this.buttonDown, this.control));

        this.div.appendChild(this.control);    
        return this.div;
    },

    /**
     * Method: _removeButton
     * 
     * Parameters:
     * btn - {Object}
     */
    _removeButton: function(btn) {
        OpenLayers.Event.stopObservingElement(btn);
        btn.map = null;
        btn.getSlideFactor = null;
        this.div.removeChild(btn);
        btn = null;
    },
    
    /**
     * Method: buttonDown
     *
     * Parameters:
     * evt - {Event} 
     */
    buttonDown: function (evt) {
        if(!this.map) {
            console.log("OpenLayers.Control.MagnifyingGlass - Map object undefined");
            return;
        }

        var glassControl = evt.target;
        glassControl.style["padding"] = "2px";
        glassControl.style["background-color"] = "#E7E7E9";        
        glassControl.style["border"] = "2px solid #ABABAD";
        glassControl.style["webkit-border-radius"] = "4px 4px 4px 4px";
        glassControl.style["-moz-border-radius"] = "4px 4px 4px 4px";
        glassControl.style["border-radius"] = "4px 4px 4px 4px";

        var layerName =  "MagnifyingGlassLayer" + Math.floor(Math.random() * 1000000).toString();
        var drawingLayer = new OpenLayers.Layer.Vector(layerName);
        this.map.addLayer(drawingLayer);

        var featureCtrl = new OpenLayers.Control.DrawFeature(
            drawingLayer,
            OpenLayers.Handler.RegularPolygon, {
                handlerOptions: {sides: 100}
            }
        )

        this.map.addControl(featureCtrl);

        drawingLayer.events.register("featuresadded", null, function(evt) {
            glassControl.style["border"] = "none";
            glassControl.style["background-color"] = "transparent";
            featureCtrl.deactivate();
            this.map.removeControl(featureCtrl);
            this.map.zoomToExtent(drawingLayer.features[0].geometry.getBounds());

            var layers = this.map.getLayersByName(layerName)

            if(layers[0] != undefined) {
                this.map.removeLayer(layers[0]);
                delete layers[0];
            }
        });
        
        featureCtrl.activate();
        OpenLayers.Event.stop(evt);
    },

    CLASS_NAME: "OpenLayers.Control.MagnifyingGlass"
});

/**
 * Constant: X
 * {Integer}
 */
OpenLayers.Control.MagnifyingGlass.X = 25;

/**
 * Constant: Y
 * {Integer}
 */
OpenLayers.Control.MagnifyingGlass.Y = 5;