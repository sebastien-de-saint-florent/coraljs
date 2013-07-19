///<reference path="../ref.d.ts"/>
module Meta {
    /**
     * Generate Model behavior in the given object.
     * @method Meta#Model
     * @param {Object} prototype Class prototype or Object where properties will be added.
     * @param {string} name The unique name of this model.
     * @param {string} primaryKey The primary key of this model object.
     * @param {Array} keys All keys that belongs to the model.
     */
    export function Model(prototype, name: string, primaryKey: string, keys: string[]) {
        Object.defineProperty(prototype, Meta.Model.MODEL_NAME_KEY, { value: name, writable: false, enumerable: false, configurable: false });
        Object.defineProperty(prototype, Meta.Model.MODEL_PRIMARY_KEY, { value: primaryKey, writable: false, enumerable: false, configurable: false });
        Object.defineProperty(prototype, Meta.Model.MODEL_KEYS_KEY, { value: keys, writable: false, enumerable: false, configurable: false });
        Meta.Model.Store._createStore(name);
        Object.defineProperty(prototype, primaryKey, {
            get: function () {
                return this.__model ? this.__model[primaryKey] : undefined;
            },
        });
        if (keys)
            for (var i = 0; i < keys.length; ++i) {
                var key = keys[i];
                Meta.Model.ModelAttribute(prototype, key);
            }
    }

    export module Model {
        export var MODEL_NAME_KEY = "__model_name";
        export var MODEL_KEYS_KEY = "__model_keys";
        export var MODEL_PRIMARY_KEY = "__model_primary";
        export var MODEL_KEY = "__model";
        export var MODEL_DIRTY_KEY = "__model_dirty";

        /**
         * Register a new model attribute.
         * @method Meta.Model.ModelAttribute
         * @param {Object} object Class prototype or Object where property will be added.
         * @param {string} key The key to add in this model object.
         */
        export function ModelAttribute(object, key: string) {
            var hostObject = Meta.Utils.findPropertyDefinition(object, key);
            var desc = Object.getOwnPropertyDescriptor(hostObject, key);
            if (!desc) {
                Object.defineProperty(object, key, {
                    get: function () {
                        return this.__model ? this.__model[key] : undefined;
                    },
                    set: function (v) {
                        if (!this.hasOwnProperty(Meta.Model.MODEL_KEY))
                            this.__model = {};
                        this.__model[key] = v;
                        this.__model_dirty = true;
                    },
                    enumerable: desc ? desc.enumerable : true
                });
            }
            else
                Coral.Utils.error("property cannot be a Model property because the property already exist", object, key);
        }
        
        /**
         * Get the model name of this object.
         * @method Meta.Model.getModelName
         * @param {Object} object
         * @returns {string} Model name.
         */
        export function getModelName(object): string {
            return object.__model_name;
        }

        /**
         * Get the model primary key name of this object.
         * @method Meta.Model.getPrimaryKey
         * @param {Object} object
         * @returns {string} Primary key name.
         */
        export function getPrimaryKey(object): string {
            return object.__model_primary;
        }

        /**
         * Get the model keys of this object.
         * @method Meta.Model.getKeys
         * @param {Object} object
         * @returns {Array} Model keys.
         */
        export function getKeys(object): string[] {
            return object.__model_keys;
        }

        /**
         * Get the model primary key name of this object.
         * @method Meta.Model.getPrimaryValue
         * @param {Object} object
         * @returns {Object} The primary key value.
         */
        export function getPrimaryValue(object): any {
            return object.__model ? object.__model[Meta.Model.getPrimaryKey(object)] : undefined;
        }

        /**
         * Check if an object has dirty model properties.
         * @method Meta.Model.isDirty
         * @param {Object} object
         * @returns {boolean} <code>true</code> if the object is dirty.
         */
        export function isDirty(object): boolean {
            return !!object.__model_dirty;
        }

        /**
         * Change the dirty flag to false.
         * @method Meta.Model.clean
         * @param {Object} object
         */
        export function clean(object) {
            object.__model_dirty = false;
        }

        /**
         * Get all model data as a separated object.
         * @method Meta.Model.getModelData
         * @param {Object} object
         * @returns {Object} The current model data.
         */
        export function getModelData(object): any {
            return object.__model;
        }
        
        /**
         * Set the model data object.
         * @method Meta.Model.setModelData
         * @param {Object} object
         * @param {Object} data The new model data.
         * @param {boolean} [silent=false] if <code>true</code> binding are not triggered.
         */
        export function setModelData(object, data, silent?: boolean) {
            object.__model = data;
            object.__model_dirty = false;
            if (!silent)
                Meta.Bindable.triggerAll(object, Meta.Model.getKeys(object));
        }

        export module Store {
            export var _stores = { };
            export function _createStore(name: string) {
                this._stores[name] = this._stores[name] || {};
            }
            
            /**
             * Get or update the model corresponding to given parameters.
             * @method Meta.Model.Store.getModel
             * @param {Object} type Class or prototype of a model object.
             * @param {Object} rawData model data.
             * @returns {Object} model.
             */
            export function getModel(type, rawData): any {
                var prototype = type instanceof Function ? type.prototype : type;
                var primaryValue = rawData[Meta.Model.getPrimaryKey(prototype)];
                if (primaryValue) {
                    var existingModel = this.modelByKey(type, primaryValue);
                    if (existingModel) {
                        Meta.Model.setModelData(existingModel, rawData);
                        return existingModel;
                    }
                    else {
                        var newModel = type instanceof Function ? new type() : Object.create(type);
                        Meta.Model.setModelData(newModel, rawData, true);
                        this.registerModel(newModel);
                        return newModel;
                    }
                }
                return undefined;
            }
            
            /**
             * Get or update models corresponding to given parameters.
             * @method Meta.Model.Store.getModels
             * @param {Object} type Class or prototype of a model object.
             * @param {Object} rawDatas models data.
             * @returns {Array} models.
             */
            export function getModels(type, rawDatas: any[]) {
                var result = [];
                for (var i = 0; i < rawDatas.length; ++i)
                    result.push(this.getModel(type, rawDatas[i]));
                return result;
            }
            
            /**
             * Store a given model.
             * @method Meta.Model.Store.registerModel
             * @param {Object} model A model instance.
             * @returns {boolean} <code>true</code> if the model has been stored properly.
             */
            export function registerModel(model): boolean {
                var name = Meta.Model.getModelName(model);
                var primaryValue = Meta.Model.getPrimaryValue(model);
                if (name && primaryValue) {
                    var store = this._stores[name];
                    store[primaryValue] = model;
                    return true;
                }
                return false;
            }
            
            /**
             * Get a model from the cache by its primary key.
             * @method Meta.Model.Store.modelByKey
             * @param {Object} type Class or prototype of a model object.
             * @param {string} primaryValue The primary key.
             * @returns {Object} the requested model.
             */
            export function modelByKey(type, primaryValue) {
                var prototype = type instanceof Function ? type.prototype : type;
                var name = Meta.Model.getModelName(prototype);
                if (name) {
                    var store = this._stores[name];
                    return store[primaryValue];
                }
                return undefined;
            }
            
            /**
             * Clear the store of models identified by its model name.<br/>
             * If no name is specified, all stores are cleared.
             * @method Meta.Model.Store.clear
             * @param {string} [name] The name of the model.
             */
            export function clear(name: string) {
                if (!name)
                    for (var name in this._stores)
                        this._stores[name] = {};
                else
                    this._stores[name] = {};
            }
        }
    }
}