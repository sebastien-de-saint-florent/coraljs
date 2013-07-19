///<reference path="../ref.d.ts"/>
/**
 * AsynchronousUpdater provide functions to update an object asynchronously
 * @namespace Coral.AsynchronousUpdater
 */
module Coral.AsynchronousUpdater {   
    export interface IUpdatableMixin {
        update();
        isUpToDate: bool;
        planUpdate();
    }
    /**
     * Mixin for all objects that can be updated asynchronously
     * @constant Coral.UpdatableMixin
     * @type {Object}
     */
    export var UpdatableMixin = {
        __mixin_name: "UpdatableMixin",
        update: Meta.Mixin.VIRTUAL, // function update(): any
        isUpToDate: false,
        planUpdate: function() {
            this.isUpToDate = false;
            AsynchronousUpdater.planUpdate(this);
        }
    };
    var updateStack = [];
    var timerId:number = undefined;
    /**
     * Plan an asynchronous update of the <code>updatable</code> object.
     * @method Coral.AsynchronousUpdater.planUpdate
     * @param {Object} updatable An object that implements UpdatableMixin
     */
    export function planUpdate(updatable) {
        Meta.Mixin(updatable, UpdatableMixin);
        if (updateStack.length == 0)
            timerId = setTimeout(AsynchronousUpdater.triggerUpdate, 0);
        updateStack.push(updatable);
    }
    /**
     * Trigger update on all registered objects.<br/>
     * This method is automatically called when updates are planned.
     * @method Coral.AsynchronousUpdater.triggerUpdate
     */
    export function triggerUpdate() {
        clearTimeout(timerId);
        var stack = updateStack;
        updateStack = [];
        for (var i = 0; i < stack.length; ++i)
            if (!stack[i].isUpToDate)
                stack[i].update();
    }
}
