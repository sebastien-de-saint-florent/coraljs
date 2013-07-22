///<reference path="../ref.d.ts"/>
module Coral {
    export class Binding extends Coral.BindingBase {
        /**
         * <code>Binding</code> object create property listeners to watch an objects chain and assign result to the target property.
         * @constructor Coral.Binding
         * @extends Coral.BindingBase
         * @see Meta.Bindable
         * @property {boolean} binded <code>true</code> if the <code>Binding</code> is currently binded.
         * @param {Object} host The object hosting the root property.
         * @param {string} chain A dot separated chain of properties or method calls.
         * @param {Object} target Host object of the target property.
         * @param {string} property Target property key.
         */
        constructor(host, chain:string, private target, private property:string) {
            super(host, chain);
        }

        /**
         * Start the binding. The current value is automatically set on the target property.
         * @method bind
         * @memberof Coral.Binding#
         * @returns {Coral.Binding} this
         */
        bind():Binding {
            if (!this.binded) {
                this.binded = true;
                this.chainResults = [this.host];
                this.target[this.property] = this.createWatchers(this.host, 0);
            }
            return this;
        }

        /**
         * This method handle any change in watched chain
         * It delete useless watchers, create new ones and set the new value on the target property
         * @private
         */
         handleChange(newValue?, oldValue?, index?:number) {
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
            this.chainResults[index + 1] = newValue;
            var result = newValue;
            if (newValue && index + 1 < this.properties.length)
                result = this.createWatchers(newValue, index + 1);
            this.target[this.property] = result;
        }
    }
}
