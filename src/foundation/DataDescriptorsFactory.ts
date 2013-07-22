///<reference path="../ref.d.ts"/>
module Coral {
    export class DataDescriptorsFactory extends Coral.DescribableObject {
        collection: Coral.Collection<Coral.DescribableObject>;
        /**
         * DataDescriptorsFactory create <code>itemDescriptor</code> instances for every object contains in <code>items</code> collection. Changes on <code>items</code> are tracked to ensure all instances are up to date.
         * @constructor Coral.DataDescriptorsFactory
         * @extends Coral.DescribableObject
         * @see $DataDescriptorsFactory
         * @property {Coral.Collection} items The collection of data objects.
         * @property {Coral.Descriptor} itemDescriptor The descriptor that will be instanciated for every item.
         * @property {Coral.Collection} collection The result collection where instances are stored.
         * @param {Coral.Descriptor} [description] A descriptor.
         * @param [context] The context passed to the new instance. All bindings and state dependencies will be tracked on this context.
         * @param [owner] The object that create and own the new instance.
         * @param [item] An optional item used for item rendering.
         */
        constructor(description?: Descriptor<DataDescriptorsFactory>, context?, owner?, item?) {
            super(description, context, owner, item);
        }

        private external: boolean;
        
        private _itemsUpToDate: boolean;
        private _items: Coral.Collection<any>;
        get items() {
            return this._items;
        }
        set items(v) {
            if (this._items == v)
                return;
            if (this._items && this._items instanceof Coral.Collection) {
                this._items.off([Collection.ADD_EVENT, this.uid]);
                this._items.off([Collection.REMOVE_EVENT, this.uid]);
                this._items.off([Collection.MOVE_EVENT, this.uid]);
                this._items.off([Collection.SET_EVENT, this.uid]);
            }
            this._items = v;
            this._itemsUpToDate = false;
            if (this._items && this._items instanceof Coral.Collection) {
                this.items.on([Collection.ADD_EVENT, this.uid], this.addHandler, this);
                this.items.on([Collection.REMOVE_EVENT, this.uid], this.removeHandler, this);
                this.items.on([Collection.MOVE_EVENT, this.uid], this.moveHandler, this);
                this.items.on([Collection.SET_EVENT, this.uid], this.setHandler, this);
            }
            this.planUpdate();
        }
        
        private _itemDescriptorUpToDate: boolean;
        private _itemDescriptor: Coral.Descriptor<Coral.DescribableObject>;
        get itemDescriptor() {
            return this._itemDescriptor;
        }
        set itemDescriptor(v) {
            if (this._itemDescriptor == v)
                return;
            this._itemDescriptor = v;
            this._itemDescriptorUpToDate = false;
            this.planUpdate();
        }

        /**
         * @private
         */
        addHandler(event: Coral.Event) {
            var instance = this.itemDescriptor.instanciate(this.external ? this.owner.context : this.owner, this.owner, event.data.value);
            if (event.data.index)
                this.collection.insert(instance, event.data.index);
            else
                this.collection.add(instance);
        }

        /**
         * @private
         */
        removeHandler(event: Coral.Event) {
            this.collection.get(event.data.index).destroy();
            this.collection.remove(this.collection.get(event.data.index));
        }

        moveHandler(event: Coral.Event) {
            this.collection.move(event.data.from, event.data.to);
        }

        /**
         * @private
         */
        setHandler(event: Coral.Event) {
            this.collection.get(event.data.at).destroy();
            var instance = this.itemDescriptor.instanciate(this.external ? this.owner.context : this.owner, this.owner, event.data.value);
            this.collection.set(instance, event.data.at);
        }

        /**
         * Asynchronous update<br/>
         * Check manually that items and collection are synchronized
         * @method update
         * @memberof Coral.DataDescriptorsFactory#
         */
        update() {
            super.update();
            if (!this._itemDescriptorUpToDate) {
                this._itemDescriptorUpToDate = true;
                while (this.collection.length > 0) {
                    var item = this.collection.get(0);
                    this.collection.remove(item);
                    item.destroy();
                }
            }
            if (!this._itemsUpToDate) {
                this._itemsUpToDate = true;
                var context = this.external ? this.owner.context : this.owner;
                if (this.items)
                    for (var j = 0; j < this.items.length; ++j) {
                        var instance = undefined;
                        if (this.collection.length > j && this.collection.get(j).item == this.items.get(j))
                            instance = this.collection[j];
                        else {
                            for (var k = j + 1; k < this.collection.length; ++k) {
                                if (this.collection.get(k).item === this.items.get(j)) {
                                    instance = this.collection.get(k);
                                    this.collection.swap(k, j);
                                }
                            }
                        }
                        if (!instance) {
                            instance = this.itemDescriptor.instanciate(context, this.owner, this.items.get(j));
                            this.collection.insert(instance, j);
                        }
                    }
                if (this.items)
                    for (var j = this.items.length; j < this.collection.length;) {
                        this.collection.get(j).destroy();
                        this.collection.remove(this.collection.get(j));
                    }
            }
        }

        destroy() {
            super.destroy();
            while (this.collection.length > 0) {
                var item = this.collection.get(0);
                this.collection.remove(item);
                item.destroy();
            }
            if (this._items && this._items instanceof Coral.Collection) {
                this._items.off([Collection.ADD_EVENT, this.uid]);
                this._items.off([Collection.REMOVE_EVENT, this.uid]);
                this._items.off([Collection.MOVE_EVENT, this.uid]);
                this._items.off([Collection.SET_EVENT, this.uid]);
            }
        }
    }
    export interface IDataDescriptorsFactoryDescriptor extends IDescribableObjectDescriptor {
        items?: Coral.Collection<any>;
        itemDescriptor?: Descriptor<Coral.DescribableObject>;
        collection?: Coral.Collection<Coral.DescribableObject>;
        itemsWatcher?;
        itemDescriptorWatcher?;
        collectionWatcher?;
    }
}

/**
 * Shortcut for creating a {@linkcode Coral.DataDescriptorsFactory} Descriptor
 * @method $DataDescriptorsFactory
 * @see Coral.DataDescriptorsFactory
 * @param description Attributes, Events and Watchers description
 * @returns {Coral.Descriptor}
 */
function $DataDescriptorsFactory(description: Coral.IDataDescriptorsFactoryDescriptor): Coral.Descriptor<Coral.DataDescriptorsFactory> {
	return new Coral.Descriptor(Coral.DataDescriptorsFactory, description)
}