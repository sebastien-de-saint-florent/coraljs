///<reference path="../ref.d.ts"/>
module Meta {
    /**
     * Generate a style property on the target object.<br/>
     * Target object must extend {@linkcode Coral.Component}.
     * @method Meta#StyleProperty
     * @param {Object} object Target class prototype or Object
     * @param {string} key Property key for the style attribute
     * @param {string} styleKey Style key on the Dom element
     */
    export function StyleProperty(object: { $el: JQuery }, key: string, styleKey?: string) {
        styleKey = styleKey || key;
        Object.defineProperty(object, key, {
            get: function () {
                var domElt = this.$el;
                if (domElt)
                    return domElt.css(styleKey);
                return this.__explicit_style ? this.__explicit_style[styleKey] : undefined;
            },
            set: function (v) {
                if (!this.hasOwnProperty(Meta.StyleProperty.EXPLICIT_STYLE_KEY))
                    this.__explicit_style = {};
                this.__explicit_style[styleKey] = v;
                var domElt = this.$el;
                if (domElt)
                    domElt.css(styleKey, v);
            }
        });
    }

    export module StyleProperty {
        /**
         * Metadata key where explicit styles are stored.
         * @constant Meta.StyleProperty.EXPLICIT_STYLE_KEY
         * @type {string}
         * @default
         */
        export var EXPLICIT_STYLE_KEY = "__explicit_style";

        /**
         * Apply all explicit styles to the Dom element.
         * @method Meta.StyleProperty.applyExplicitStyles
         * @param {Object} object Target object.
         */
        export function applyExplicitStyles(object: {$el:JQuery}) {
            var domElt = object.$el;
            if (domElt && (<any>object).__explicit_style)
                domElt.css((<any>object).__explicit_style);
        }
    }
}