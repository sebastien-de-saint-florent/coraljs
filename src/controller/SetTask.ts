///<reference path="../ref.d.ts"/>
module Coral {
    export class SetTask extends Coral.Task {
        target;
        property: string;
        value;
        /**
         * SetTask is a simple task that set a value on a given object.
         * @constructor Coral.SetTask
         * @extends Coral.Task
         * @see $SetTask
         * @property {Object} target The object hosting <code>property</code>.
         * @property {string} property The property key to set.
         * @property {Object} value The value to set property with.
         * @param {Coral.Descriptor} [description] A descriptor.
         * @param [context] The context passed to the new instance. All bindings and state dependencies will be tracked on this context.
         * @param [owner] The object that create and own the new instance.
         */
        constructor(description?: Descriptor<SetTask>, context?, owner?) {
            super(description, context, owner);
        }

        run() {
            super.run();
            if (this.target && this.property)
                this.target[this.property] = this.value;
            this.done();
        }
    }

    export interface ISetTaskDescriptor extends ITaskDescriptor {
        target?: Object;
        property?: string;
        value?;
        targetWatcher?;
        propertyWatcher?;
        valueWatcher?;
    }
}

/**
 * Shortcut for creating a {@linkcode Coral.SetTask} Descriptor.
 * @method $SetTask
 * @see Coral.SetTask
 * @param description Attributes, Events and Watchers description
 * @returns {Coral.Descriptor}
 */
function $SetTask(description: Coral.ISetTaskDescriptor): Coral.Descriptor<Coral.SetTask> {
    return new Coral.Descriptor(Coral.SetTask, description)
}