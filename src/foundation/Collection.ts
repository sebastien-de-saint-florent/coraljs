///<reference path="../ref.d.ts"/>
module Coral {
    export class Collection<T> extends Coral.EventDispatcher {
        /**
         * Add event key
         * @constant Coral.Collection.ADD_EVENT
         * @type {string}
         * @default "add"
         */
        static ADD_EVENT = "add";
        /**
         * Remove event key
         * @constant Coral.Collection.REMOVE_EVENT
         * @type {string}
         * @default "remove"
         */
        static REMOVE_EVENT = "remove";
        /**
         * Move event key
         * @constant Coral.Collection.MOVE_EVENT
         * @type {string}
         * @default "move"
         */
        static MOVE_EVENT = "move";
        /**
         * Set event key
         * @constant Coral.Collection.SET_EVENT
         * @type {string}
         * @default "set"
         */
        static SET_EVENT = "set";
        length:number;
        items:T[];
        /**
         * Collection class is an <code>Array</code> wrapper that dispatch events upon modification.
         * @constructor Coral.Collection
         * @property {Array} items Inner Array containing elements.
         * @property {number} length The length of the collection. It can be made Bindable.
         * @param {Array} [source] An array used to store content of the collection.
         */
        constructor(source?:T[]) {
            super(undefined);
            Object.defineProperty(this, "items", {writable:false, value: source && Array.isArray(source) ? source : []});
            this.length = this.items.length;
        }

        /**
         * Add an element to the collection and fire <code>add</code> event.
         * @method add
         * @memberof Coral.Collection#
         * @param obj The object to add.
         * @param {boolean} [unique=false] If <code>true</code>, the element is not added if it already exists in the collection.
         */
        add(obj:T, unique?:boolean) {
            if (unique)
                for (var i = 0; i < this.items.length; ++i)
                    if (this.items[i] === obj)
                        return;
            this.items.push(obj);
            this.length += 1;
            this.dispatch(new Coral.Event(Collection.ADD_EVENT, {value:obj, index:this.items.length - 1}));
        }

        /**
         * Add all elements from the Array <code>objs</code>.
         * @method addAll
         * @memberof Coral.Collection#
         * @param {Array} objs Objects to add.
         * @param {boolean} [unique=false] If <code>true</code>, elements are not added if they already exist in the collection.
         */
        addAll(objs:T[], unique?:boolean) {
            for (var i = 0; i < objs.length; ++i)
                this.add(objs[i], unique);
        }

        /**
         * Insert an element in the collection and fire <code>add</code> event.
         * @method insert
         * @memberof Coral.Collection#
         * @param obj The object to add.
         * @param {number} index The index of the added element in the collection.
         * @param {boolean} [unique=false] If <code>true</code>, the element is not added if it already exists in the collection
         */
        insert(obj:T, index:number, unique?:boolean) {
            if (index > this.items.length)
                return this.add(obj, unique);
            if (unique)
                for (var i = 0; i < this.items.length; ++i)
                    if (this.items[i] === obj)
                        return;
            this.items.splice(index, 0, obj);
            this.length += 1;
            this.dispatch(new Coral.Event(Collection.ADD_EVENT, {value:obj, index:index}));
        }

        /**
         * Remove an element from the collection and fire <code>remove</code> event.
         * @method remove
         * @memberof Coral.Collectiont#
         * @param obj The object to remove.
         * @param {boolean} [all=false] If code>true</code>, all occurrences of the element are removed.
         */
        remove(obj:T, all?:boolean) {
            for (var i = 0; i < this.items.length; ++i) {
                if (this.items[i] === obj) {
                    this.items.splice(i, 1);
                    this.length -= 1;
                    this.dispatch(new Coral.Event(Collection.REMOVE_EVENT, {value:obj, index:i}));
                    if (all)
                        --i;
                    else
                        break;
                }
            }
        }

        /**
         * Remove all elements in <code>objs</code> Array from the collection and fire <code>remove</code> events.
         * @method removeAll
         * @memberof Coral.Collection#
         * @param {Array} objs Objects to remove.
         * @param {boolean} [all=false] If true, all occurrences of elements are removed.
         */
        removeAll(objs:T[], all?:boolean) {
            for (var i = 0; i < objs.length; ++i)
                this.remove(objs[i], all);
        }

        /**
         * Move an element into the collection and fire <code>move</code> event.
         * @method move
         * @memberof Coral.Collection#
         * @param {number} from Index of the element to move.
         * @param {number} to New index of the element.
         */
        move(from:number, to:number) {
            var obj = this.items[from];
            this.items.splice(from, 1);
            this.items.splice(to, 0, obj);
            this.dispatch(new Coral.Event(Collection.MOVE_EVENT, {value:obj, from:from, to:to}));
        }

        /**
         * Swap an element with an other.
         * @method swap
         * @memberof Coral.Collection#
         * @param {number} index1 Index of the first element.
         * @param {number} index2 Index of the second element.
         */
        swap(index1:number, index2:number) {
            var item1 =  this.items[index1];
            this.set(this.items[index2], index1);
            this.set(item1, index2);
        }

        /**
         * Get an element from the collection.
         * @method get
         * @memberof Coral.Collection#
         * @param {number} at Index of the element.
         */
        get(at:number):T {
            return this.items[at];
        }

        /**
         * Get an element in the collection and fire <code>set</code> event.
         * @method set
         * @memberof Coral.Collection#
         * @param obj The object to set.
         * @param {number} at Index of the element.
         */
        set(obj:T, at:number) {
            var oldValue = this.items[at];
            this.items[at] = obj;
            this.length = this.items.length;
            this.dispatch(new Coral.Event(Collection.SET_EVENT, {value:obj, oldValue:oldValue, at:at}));
        }
    }
}
