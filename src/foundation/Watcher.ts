///<reference path="../ref.d.ts"/>
module Coral{
    export class Watcher extends Coral.BindingBase {
        /**
         * <code>Watcher</code> object create property listeners on a chain of objects and trigger a callback upon modification.
         * @constructor Coral.Watcher
         * @extends Coral.BindingBase
         * @property result The current value beeing watched.
         * @property {boolean} binded <code>true</code> if the <code>Watcher</code> is currently binded.
         * @param {Object} host The object hosting the root property.
         * @param {string} chain A dot separated chain of properties or method calls.
         * @param {Function} handler The callback triggered when the result change.
         * @param {Object} [context] The context object applied to the handler.
         * @param [params] Additional params to be passed to the handler.
         * @example
// Simple Watcher
var host = {
	nested: {
		val:2
	}
};
var watcher = new Coral.Watcher(host, "nested.val", function(newValue, oldValue, params) {
	// handler triggered
});
         * @example
// Watcher with function call
var host = {
	nested: {
		getVal:function() {return 2;}
	}
};
var watcher = new Coral.Watcher(host, "nested.getVal()", function(newValue, oldValue, params) {
	// handler triggered
});
         */
        constructor(host, chain:string, private handler:(newValue?, oldValue?, params?) => any, private context?, private params?) {
            super(host, chain);
        }

        /**
         * Start the watcher by creating all needed property listeners and dependencies.
         * @method bind
         * @memberof Coral.Watcher#
         * @param {boolean} [trigger=false] If true handler will be called after bind finish.
         * @returns {Coral.Watcher} this
         */
        bind(trigger?:bool):Watcher {
            if (!this.binded) {
                this.binded = true;
                this.chainResults = [this.host];
                this.result = this.createWatchers(this.host, 0);
                if (trigger)
                    this.handler.call(this.context, this.result, undefined, this.params);
            }
            return this;
        }

        /**
         * This method handle any change in the watched chain
         * It delete useless watchers, create new ones and trigger notify handler if needed
         * @private
         */
        public handleChange(newValue?, oldValue?, index?:number) {
            while (this.watchers.length > index + 1) {
                this.chainResults[this.watchers.length] = undefined;
                var watcher = this.watchers.pop();
                if (watcher) {
                    if (Array.isArray(watcher))
                        for (var i = 0; i < watcher.length; ++i)
                            watcher[i].unbind();
                    else
                        Meta.Bindable.unbind(this.chainResults[this.watchers.length], this.properties[this.watchers.length], watcher);
                }
            }
            var oldResult = this.result;
            this.chainResults[index + 1] = newValue;
            this.result = newValue;
            if (newValue && index + 1 < this.properties.length)
                this.result = this.createWatchers(newValue, index + 1);
            if (this.result !== oldResult) {
                this.handler.call(this.context, this.result, oldResult, this.params);
            }
        }
    }
}
