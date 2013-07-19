///<reference path="../ref.d.ts"/>
module Coral {
    var functionExp = /(.*)\(\s*\)/;
    export class BindingBase {
        public binded:bool;
        public result;
        /**
         * <code>Watcher</code> object create property listeners on a chain of objects and trigger a callback upon modification.
         * @constructor Coral.BindingBase
         * @property result
         * @property {boolean} binded <code>true</code> if the <code>Watcher</code> is currently binded.
         * @param {Object} host The object hosting the root property.
         * @param {string} chain A dot separated chain of properties or method calls.
         */
         constructor(public host, public chain:string) {
            this.properties = chain.split(".");
            this.functions = {};
            for (var i = 0; i < this.properties.length; ++i) {
                var exec = functionExp.exec(this.properties[i]);
                if (exec && exec.length > 0)
                    this.functions[i] = exec[1];
            }
            this.watchers = [];
            this.result = undefined;
         }
         public properties:string[];
         public functions:{};
         public watchers:any[];
         public chainResults:any[];

        /**
         * Stop the watcher by removing all created property listeners and dependencies.
         * @method unbind
         * @memberof Coral.BindingBase#
         * @returns {Coral.BindingBase} this
         */
         unbind():BindingBase {
            if (this.binded) {
                this.binded = false;
                while (this.watchers.length > 0) {
                    var watcher = this.watchers.pop();
                    if (watcher) {
                        if (Array.isArray(watcher))
                            for (var i = 0; i < watcher.length; ++i)
                                watcher[i].unbind();
                        else
                            Meta.Bindable.unbind(this.chainResults[this.watchers.length], this.properties[this.watchers.length], watcher);
                    }
                }
                this.chainResults = undefined;
                this.result = undefined;
            }
            return this;
        }

        /**
         * Internal method that create all needed property listeners and Watcher recursively
         * @private
         */
        public createWatchers(object, index:number) {
            var key:string = this.functions[index] || this.properties[index];
            var deps:string[] = Meta.Bindable.getDependencies(object, key);
            if (deps) {
                var subWatchers = [];
                for (var i = 0; i < deps.length; ++i) {
                    var dep = deps[i].split("@");
                    if (dep.length == 1)
                        subWatchers.push(new Watcher(object, dep[0], this.watcherDependency, this, index).bind());
                    else if (dep.length == 2)
                        subWatchers.push(new EventWatcher(object, dep[0], dep[1], this.eventWatcherDependency, this, index).bind());
                }
                this.watchers.push(subWatchers);
            }
            else if (!this.functions[index])
                this.watchers.push(Meta.Bindable.bind(object, key, this, index));
            else
                this.watchers.push(undefined);

            var result = object[this.properties[index]];
            if (this.functions[index])
                result = object[this.functions[index]]();
            this.chainResults[index + 1] = result;
            if (result && index + 1 < this.properties.length)
                return this.createWatchers(result, index + 1);
            return result;
        }

        /**
         * @private
         */
        private eventWatcherDependency(event?, index?:number) {
            var object = this.chainResults[index];
            var oldValue = this.chainResults[index + 1];
            var newValue = this.functions[index] ? object[this.functions[index]]() : object[this.properties[index]];
            if (oldValue === newValue)
                return;
            this.chainResults[index + 1] = newValue;
            this.handleChange(newValue, oldValue, index);
        }

        /**
         * @private
         */
        private watcherDependency(newValue?, oldValue?, index?:number) {
            var object = this.chainResults[index];
            oldValue = this.chainResults[index + 1];
            newValue = this.functions[index] ? object[this.functions[index]]() : object[this.properties[index]];
            if (oldValue === newValue)
                return;
            this.chainResults[index + 1] = newValue;
            this.handleChange(newValue, oldValue, index);
        }

        /**
         * shall be override
         * @private
         */
        public handleChange(newValue?, oldValue?, index?:number) {
        }
    }
}
Meta.Mixin(Coral.BindingBase.prototype, Meta.Bindable.PropertyListenerMixin);

