///<reference path="../ref.d.ts"/>
module Coral {
    export class Container extends Coral.BaseContainer {
        childs: Coral.Descriptor<Coral.Component>[];
        /**
         * Container class is a {@linkcode Coral.BaseContainer} that use a {@linkcode Coral.DescriptorsFactory}
         * @constructor Coral.Container
         * @extends Coral.BaseContainer
         * @see $Container
         * @property {Array} childs An array of {@linkcode Coral.Descriptor}. All described objects are delegated to <code>childsFactory</code>.
         * @param {Coral.Descriptor} [description] A descriptor.
         * @param [context] The context passed to the new instance. All bindings and state dependencies will be tracked on this context.
         * @param [owner] The object that create and own the new instance.
         * @param [item] An optional item used for item rendering.
         */
        constructor(description?: Descriptor<Coral.Component>, context?, owner?, item?) {
            super(description, context, owner, item);
        }
    
        /**
         * <code>true</code> if <code>childs</code> property come from an external context.<br/>
         * Implementation of {@linkcode Coral.BaseContainer#areChildsExternal}
         * @method areChildsExternal
         * @memberof Coral.Container#
         * @returns {boolean} <code>true</code> if childs descriptors come from an external context
         */
        areChildsExternal():boolean {
            return this.isExternal("childs");
        }
    }

    Container.prototype.childsFactory = new Coral.Descriptor(DescriptorsFactory, {
        descriptors: new Coral.Bind("childs", Coral.Bind.SIMPLE_BINDING_MODE)
    });

    export interface IContainerDescriptor extends IBaseContainerDescriptor {
        childs?: Descriptor<Coral.Component>[];
        childsWatcher?;
    }
}

/**
 * Shortcut for creating a {@linkcode Coral.Container} Descriptor
 * @method $Container
 * @see Coral.Container
 * @param description Attributes, Events and Watchers description
 * @returns {Coral.Descriptor}
 */
function $Container(description: Coral.IContainerDescriptor): Coral.Descriptor<Coral.Container> {
	return new Coral.Descriptor(Coral.Container, description)
}