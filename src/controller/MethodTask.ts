///<reference path="../ref.d.ts"/>
module Coral {
    export class MethodTask extends Coral.Task {
        apply: boolean;
        target;
        method: string;
        params;

        /**
         * MethodTask is a simple task that call a method on a given object.
         * @constructor Coral.MethodTask
         * @extends Coral.Task
         * @see $MethodTask
         * @property {Object} target The object hosting <code>method</code>.
         * @property {string} method The method to call on object <code>target</code>.
         * @property {boolean} apply If <code>true</code>, the method is call with <code>apply</code>.
         * @property {Object} params Params to pass to the method.
         * @param {Coral.Descriptor} [description] A descriptor.
         * @param [context] The context passed to the new instance. All bindings and state dependencies will be tracked on this context.
         * @param [owner] The object that create and own the new instance.
         */
        constructor(description?: Descriptor<MethodTask>, context?, owner?) {
            this.apply = false;
            super(description, context, owner);
        }

        run() {
            super.run();
            if (this.target && this.method) {
                if (this.params)
                    this.apply ? this.target[this.method].apply(this.target, this.params) : this.target[this.method].call(this.target, this.params);
                else
                    this.target[this.method]();
            }
            this.done();
        }
    }

    export interface IMethodTaskDescriptor extends ITaskDescriptor {
        target?: Object;
        method?: string;
        apply?: bool;
        params?;
        targetWatcher?;
        methodWatcher?;
        applyWatcher?;
        paramsWatcher?;
    }
}

/**
 * Shortcut for creating a {@linkcode Coral.MethodTask} Descriptor
 * @method $MethodTask
 * @see Coral.MethodTask
 * @param description Attributes, Events and Watchers description
 * @returns {Coral.Descriptor}
 */
function $MethodTask(description: Coral.IMethodTaskDescriptor): Coral.Descriptor<Coral.MethodTask> {
    return new Coral.Descriptor(Coral.MethodTask, description)
}