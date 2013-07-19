/**
 * Utils namespace provide common functions for the framework
 * @namespace Coral.Utils
 */
module Coral.Utils {
    var functionExp = /(.*)\(\s*\)/;

    /**
     * Create a string to represent an object in a log message.
     * @method Coral.Utils.objectInfo
     * @param {Object} object The object in relation with the warning
     * @returns {string}
     */
    export function objectInfo(object:any) {
        var id = object.id || object.uid;
        var constructor = object.constructor.name || "Object";
        if (id)
            return "[" + constructor + " #" + id + "]";
        return "[" + constructor + "]";
    }

    /**
     * Display an error in the console.
     * @method Coral.Utils.error
     * @param {string} message
     * @param {Object} [object] The object in relation with the warning
     * @param {string} [key] The property in relation with the warning
     */
    export function error(message:string, object?, key?:string) {
        if (object)
            message = Utils.objectInfo(object) + " " + message;
        if (key)
            message += " : " + key;
        throw message;
    }

    /**
     * Display a warning in the console.
     * @method Coral.Utils.warning
     * @param {string} message
     * @param {Object} [object] The object in relation with the warning
     * @param {string} [key] The property in relation with the warning
     */
    export function warning(message:string, object?, key?:string) {
        if (object)
            message = Utils.objectInfo(object) + " " + message;
        if (key)
            message += " : " + key;
        console.warn(message);
    }

    var objectCounter = 0;
    /**
     * Get a new unique identifier.
     * @method Coral.Utils.getUID
     * @returns {number} An unique identifier
     */
    export function getUID():number {
        return ++objectCounter;
    }
    
    export function getChain(object, properties: string): any;
    export function getChain(object, properties: string[]): any;
    /**
     * Resolve the value of property chain as {@linkcode Coral.Binding} does.
     * @method Coral.Utils.getChain
     * @param {Object} object
     * @param {string} properties A property chain
     * @returns The result of the property chain
     */
    export function getChain(object, properties: any): any {
        var propertiesArray = Array.isArray(properties) ? properties : properties.split(".");
        for (var i = 0; i < propertiesArray.length; ++i) {
            var property: string = propertiesArray[i];
            var isFunctionCall:bool = false;
            var exec = functionExp.exec(property);
            if (exec && exec.length > 0) {
                isFunctionCall = true;
                property = exec[1];
            }
            if (object && property in object) {
                if (isFunctionCall)
                    object = object[property]();
                else
                    object = object[property];
            }
            else
                return undefined;
        }
        return object;
    }

    /**
     * Get all values of property in the prototype chain
     * @method Coral.Utils.prototypalMerge
     * @param {Object} object
     * @param {string} property
     * @returns {Array} An array containing all values of the property
     */
    export function prototypalMerge(object, property:string):any[] {
        var result = [];
        var currentObject = object;
        while (currentObject) {
            if (currentObject.hasOwnProperty(property)) {
                var p = currentObject[property];
                if (p)
                    if (Array.isArray(p))
                        result = result.concat(p);
                    else
                        result.push(p);
            }
            currentObject = Object.getPrototypeOf(currentObject);
        }
        return result;
    }

    /**
     * Wait <code>time</code> milliseconds and then call the callback function
     * @method Coral.Utils.wait
     * @param {number} time Time to wait
     * @param {Function} callback Function to call when timer ends
     * @param {Object} context <code>this</code> for the callback Function
     */
    export function wait(time: number, callback: () => any, context: any) {
        var intervalId = setTimeout(function () {
            callback.call(context);
        }, time);
    }

    /**
     * Call the given function in a later frame update.
     * @method Coral.Utils.callback
     * @param {Function} callback Function to call
     * @param {Object} context <code>this</code> for the callback Function
     */
    export function callback(callback: () => any, context) {
        Utils.wait(10, callback, context);
    }


    /**
     * return a new object with only properties matching filter regexp
     * @method Coral.Utils.objectFilter
     * @param {Object} object source object
     * @param {RegExp} include a regular expression used to filter included properties, the first capture is used
     * @param {RegExp} exclude a regular expression used to filter excluded properties
     * @returns {Object} the filtered copy
     */
    export function objectFilter(object, include:RegExp, exclude?:RegExp):any {
        var result = {};
        if (object)
            for (var key in object) {
                if (include) {
                    var match = include.exec(key)
                    if (match && (!exclude || !exclude.test(key)))
                        result[match[1]] = object[key];
                }
                else if (exclude && !exclude.test(key))
                    result[key] = object[key];
            }
        return result;
    }
}
