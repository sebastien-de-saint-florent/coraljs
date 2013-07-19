/**
 * Utility functions designed for Meta.
 * @namespace Meta.Utils
 */
module Meta.Utils {
    /**
     * Iterate over prototype chain to find where a property has been declared.
     * @method Meta.Utils.findPropertyDefinition
     * @param {Object} object Base object where search start.
     * @param {string} key Property key to search.
     * @returns {Object} the object where the given property is defined
     */
    export function findPropertyDefinition(object, key: string) {
        var currentObject = object;
        while (currentObject) {
            if (currentObject.hasOwnProperty(key))
                break;
            currentObject = Object.getPrototypeOf(currentObject);
        }
        return currentObject || object;
    }

    /**
     * Test if a property can be wrap into a new property definition.
     * @method Meta.Utils.canWrapProperty
     * @param {Object} object Host object.
     * @param {string} key Property key to test.
     * @returns {bool} <code>true</code> if the property can be wrapped
     */
    export function canWrapProperty(object, key: string): bool {
        var desc = Object.getOwnPropertyDescriptor(object, key);
        if (desc && desc.writable && (!desc.configurable || Object.isSealed(object) || !Object.isExtensible(object) || Object.isFrozen(object)))
            return false;
        return true;
    }

    /**
     * Wrap the property key1/desc1 with desc2 by moving the first property to key2.
     * @method Meta.Utils.wrapProperty
     * @param {Object} object Host object.
     * @param {string} key1 Original property key.
     * @param {string} key2 New property key.
     * @param {object} desc1 Original property description.
     * @param {object} desc2 Wrapped property description.
     */
    export function wrapProperty(object, key1: string, key2: string, desc1: PropertyDescriptor, desc2: PropertyDescriptor) {
        Object.defineProperty(object, key2, desc1);
        Object.defineProperty(object, key1, desc2);
    }
}