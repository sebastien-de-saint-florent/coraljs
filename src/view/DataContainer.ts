///<reference path="../ref.d.ts"/>
module Coral {
    export class DataContainer extends Coral.BaseContainer {
        itemRenderer: Coral.Descriptor<Coral.Component>;
        items: Coral.Collection<any>;
        /**
         * DataContainer class is a {@linkcode Coral.BaseContainer} that use a {@linkcode Coral.DataDescriptorsFactory}
         * @constructor Coral.DataContainer
         * @extends Coral.BaseContainer
         * @see $DataContainer
         * @property {Coral.Descriptor} itemRenderer A description for all childs in the container.
         * @property {Coral.Collection} items A collection of data objects. An <code>itemRenderer</code> instance is created for every object in the list.
         * @param {Coral.Descriptor} [description] A descriptor.
         * @param [context] The context passed to the new instance. All bindings and state dependencies will be tracked on this context.
         * @param [owner] The object that create and own the new instance .
         * @param [item] An optional item used for item rendering.
         */
        constructor(description?: Descriptor<DataContainer>, context?, owner?, item?) {
            super(description, context, owner, item);
        }
    
        /**
         * <code>true</code> if <code>itemRenderer</code> property come from an external context.<br/>
         * Implementation of {@linkcode Coral.BaseContainer#areChildsExternal}
         * @method areChildsExternal
         * @memberof Coral.DataContainer#
         * @returns {boolean} <code>true</code> if childs descriptors come from an external context
         */
        areChildsExternal ():boolean {
            return this.isExternal("itemRenderer");
        }
    }

    DataContainer.prototype.childsFactory = new Coral.Descriptor(Coral.DataDescriptorsFactory, {
        itemDescriptor: new Coral.Bind("itemRenderer", Coral.Bind.SIMPLE_BINDING_MODE),
        items: new Coral.Bind("items", Coral.Bind.SIMPLE_BINDING_MODE)
    });

    export interface IDataContainerDescriptor extends IBaseContainerDescriptor {
        itemRenderer?: Descriptor<Coral.Component>;
        items?: Coral.Collection<any>;
        itemRendererWatcher?;
        itemsWatcher?;
    }
}

/**
 * Shortcut for creating a {@linkcode Coral.DataContainer} Descriptor
 * @method $DataContainer
 * @see Coral.DataContainer
 * @param description Attributes, Events and Watchers description
 * @returns {Coral.Descriptor}
 */
function $DataContainer(description: Coral.IDataContainerDescriptor): Coral.Descriptor<Coral.DataContainer> {
    return new Coral.Descriptor(Coral.DataContainer, description)
}