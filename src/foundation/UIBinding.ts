///<reference path="../ref.d.ts"/>
module Coral {
    var simpleBindingExp = /^[^{}]+$/;
    var compositeBindingExp = /^{[^{}]+}$/;
    export class UIBinding {
        public binded: bool;
        constructor(host, chain: string, node: Node, property?: string);
        constructor(host, chain: string, node: JQuery, property?: string);
        /**
         * Binding on a UI Dom Node.<br/>
         * This class is an abstract base class and is not intended to be instanciated directly.
         * @constructor Coral.UIBinding
         * @property {boolean} binded <code>true</code> if the <code>UIBinding</code> is currently binded.
         * @param {Object} host The object hosting the root property.
         * @param {string} chain A binding chain or a composition.
         * @param {Object} node DOM node object.
         * @param {string} [property] Target property key.
         */
        constructor(host, chain:string, node, public property?:string) {
            if (simpleBindingExp.test(chain))
                this.binding = new Binding(host, chain, this, "result");
            else if (compositeBindingExp.test(chain))
                this.binding = new Binding(host, chain.substring(1, chain.length - 1), this, "result");
            else
                this.binding = new CompositeBinding(host, new Coral.BindingComposition(chain), this, "result");
            this.node = node instanceof $ ? node : $(node);
        }
        private binding: { bind(); unbind();};
        public node:JQuery;
        
        private _result:any;
        private get result() {
            return this._result;
        }
        private set result(v:any) {
            var oldResult = this._result;
            this._result = v;
            this.resultChange(v, oldResult);
        }

        /**
         * Internal watcher change handler.<br/>
         * This function assign the Dom node target property with the new value.
         * @private
         */
        resultChange(newValue?, oldValue?) {

        }

        /**
         * Start the UI binding.<br/>
         * The current value is automatically set on the HTML DOM node.
         * @method bind
         * @memberof Coral.UIBinding#
         * @returns {Coral.UIBinding} this
         */
        bind():UIBinding {
            this.binding.bind();
            return this;
        }

        /**
         * Stop the UI binding.
         * @method unbind
         * @memberof Coral.UIBinding#
         * @returns {Coral.UIBinding} this
         */
        unbind():UIBinding {
            this.binding.unbind();
            this._result = undefined;
            return this;
        }
    }

    export class AttributeBinding extends UIBinding {
        constructor(host, chain: string, node: HTMLElement, property: string);
        constructor(host, chain: string, node: JQuery, property: string);
        /**
         * UI binding to a property of an HTML DOM node.
         * @constructor Coral.AttributeBinding
         * @extends Coral.UIBinding
         * @param {Object} host The object hosting the root property.
         * @param {string} chain A binding chain or a composition.
         * @param {Object} node HTML DOM node object.
         * @param {string} property Target property key.
         */
        constructor(host, chain: string, node, property:string) {
            super(host, chain, node, property);
        }

        resultChange(newValue?, oldValue?) {
            if (newValue)
                this.node.attr(this.property, newValue);
            else
                this.node.removeAttr(this.property);
        }
    }

    export class StyleBinding extends UIBinding{
        constructor(host, chain: string, node: HTMLElement, property: string);
        constructor(host, chain: string, node: JQuery, property: string);
        /**
         * UI binding to a style property of an HTML DOM node.
         * @constructor Coral.StyleBinding
         * @extends Coral.UIBinding
         * @param {Object} host The object hosting the root property.
         * @param {string} chain A binding chain or a composition.
         * @param {Object} node HTML DOM node object.
         * @param {string} property Target property key.
         */
         constructor(host, chain:string, node, property:string) {
            super(host, chain, node, property);
        }

        resultChange(newValue?, oldValue?) {
            this.node.css(this.property, newValue);
        }
    }

    export class ContentBinding extends UIBinding{
        constructor(host, chain: string, node: HTMLElement, raw?: bool);
        constructor(host, chain: string, node: JQuery, raw?: bool);
        /**
         * UI binding to the content of an HTML DOM node.
         * @constructor Coral.ContentBinding
         * @extends Coral.UIBinding
         * @param {Object} host The object hosting the root property.
         * @param {string} chain A binding chain or a composition.
         * @param {Object} node HTML DOM node object.
         * @param {boolean} raw If true content is append to DOM without escaping HTML.
         */
         constructor(host, chain:string, node, public raw?:bool) {
            super(host, chain, node);
        }

        resultChange(newValue?, oldValue?) {
            if (this.raw)
                this.node.html(newValue);
            else
                this.node.text(newValue);
        }
    }

    export class ClassSwitchBinding extends UIBinding {
        constructor(host, chain: string, node: HTMLElement, className: string);
        constructor(host, chain: string, node: JQuery, className: string);
        /**
         * UI binding of a css class on an HTML DOM node.<br/>
         * If host/chain result is <code>true</code>, <code>className</code> is apply to the DOM node.
         * @constructor Coral.ClassSwitchBinding
         * @extends Coral.UIBinding
         * @param {Object} host The object hosting the root property.
         * @param {string} chain A binding chain or a composition.
         * @param {Object} node HTML DOM node object.
         * @param {string} className css class name.
         */
         constructor(host, chain:string, node, public className:string) {
            super(host, chain, node);
        }

        resultChange(newValue?, oldValue?) {
            if (newValue && !oldValue)
                this.node.addClass(this.className);
            else if (!newValue && oldValue)
                this.node.removeClass(this.className);
        }
    }

    export class ClassBinding extends UIBinding {
        constructor(host, chain: string, node: HTMLElement);
        constructor(host, chain: string, node: JQuery);
        /**
         * UI binding of a css class on an HTML DOM node.<br/>
         * host/chain result is used as an additional css class name for the DOM node.<br/>
         * When the result change, previous value is removed from css classes.
         * @constructor Coral.ClassBinding
         * @extends Coral.UIBinding
         * @param {Object} host The object hosting the root property.
         * @param {string} chain A binding chain or a composition.
         * @param {Object} node HTML DOM node object.
         */
         constructor(host, chain:string, node) {
            super(host, chain, node);
        }

        resultChange(newValue?, oldValue?) {
            if (oldValue)
                this.node.removeClass(oldValue);
            if (newValue)
                this.node.addClass(newValue);
        }
    }
}
