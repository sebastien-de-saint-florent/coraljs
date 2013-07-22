///<reference path="../ref.d.ts"/>
module Coral {
    export class CompositeBinding {
        public binded: bool;
        constructor(host, composition: string, target, property: string);
        constructor(host, composition: Coral.BindingComposition, target, property: string);
        /**
         * <code>CompositeBinding</code> is a concatenation of strings and bindings<br/>
         * composition must match the regexp <code>([^{}]*|\{[\w.]*\})*</code>
         * @constructor Coral.CompositeBinding
         * @property {boolean} binded <code>true</code> if the <code>CompositeBinding</code> is currently binded.
         * @param {Object} host The object hosting the root property.
         * @param {string|Coral.BindingComposition} composition Concatenated strings and bindings.
         * @param {Object} target Host object of the target property.
         * @param {string} property Target property key.
         */
         constructor(private host, composition: any, private target, private property:string) {
            this.watchers = [];
            if (!(composition instanceof BindingComposition))
                composition = new BindingComposition(composition);
            this.composition = composition;
            for (var i = 0; i < composition.components.length; ++i) {
                if (composition.components[i].m === Coral.BindingComposition.BINDING_COMPONENT)
                    this.watchers[i] = new Coral.Watcher(host, composition.components[i].v, this.handleChange, this);
            }
        }
        private watchers: Coral.Watcher[];
        private composition: Coral.BindingComposition

        /**
         * @private
         */
         handleChange() {
            var result = "";
            for (var i = 0; i < this.composition.components.length; ++i) {
                if (this.watchers[i])
                    result += this.watchers[i].result;
                else
                    result += this.composition.components[i].v;
            }
            this.target[this.property] = result;
        }

        /**
         * Start the binding by creating all bindings declared in 'composition'
         * @method bind
         * @memberof Coral.CompositeBinding#
         * @returns {Coral.CompositeBinding} this
         */
         bind():CompositeBinding {
            if (!this.binded) {
                this.binded = true;
                for (var i = 0; i < this.watchers.length; ++i) {
                    if (this.watchers[i])
                        this.watchers[i].bind();
                }
                this.handleChange();
            }
            return this;
        }

        /**
         * Stop the binding
         * @method unbind
         * @memberof Coral.CompositeBinding#
         * @returns {Coral.CompositeBinding} this
         */
         unbind():CompositeBinding {
            if (this.binded) {
                this.binded = false;
                for (var i = 0; i < this.watchers.length; ++i) {
                    if (this.watchers[i])
                        this.watchers[i].unbind();
                }
            }
            return this;
        }
    }
}

