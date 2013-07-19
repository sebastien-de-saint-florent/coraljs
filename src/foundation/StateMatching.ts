///<reference path="../ref.d.ts"/>
module Coral {
    
    export interface IStateMixin {
        matchState(matching: StateMatching): bool;
    }

    /**
     * Mixin for all objects that can expose state behaviors
     * @constant Coral.StateMixin
     * @type {Object}
     */
    export var StateMixin = {
        __mixin_name: "StateMixin",
        matchState: Meta.Mixin.VIRTUAL // function matchState(states: Coral.StateMatching): bool
    }
    

    /**
     * Event key for state change event
     * @constant Coral.STATE_CHANGE_EVENT
     * @type {string}
     * @default "stateChange"
     */
    export var STATE_CHANGE_EVENT: string = "stateChange";

    var stateExp = /([0-9a-zA-Z_\-]*).([0-9a-zA-Z_\-.]+)/;

    export interface IStateMatching {
        [stateName: string]: string[]
    }

    export class StateMatching implements IStateMatching {
        /**
         * StateMatching class represent a state expression.<br/>
         * It is used with {@linkcode Coral.StateMixin} to provide state behaviors.
         * @constructor Coral.StateMatching
         * @param {string} statesExpression A state expression: "." separated state values surrounded with ":" separated state names.<br/>exemple ":state.value1.value2:state2.val1".
         */
        constructor(statesExpression:string) {
            var statesList = statesExpression.split(":");
            for (var i = 0; i < statesList.length; ++i) {
                var states = statesList[i];
                if (states) {
                    var match = stateExp.exec(states);
                    if (match) {
                        var stateName = match[1] || StateMatching.DEFAULT_STATE;
                        var statesValues = match[2].split(".");
                        this[stateName] = statesValues;
                    }
                    else
                        Coral.Utils.error("the state expression is malformed", this, statesExpression);
                }
            }
        }

        /**
         * The key of the default state in a StateMatching object
         * @constant Coral.StateMatching.DEFAULT_STATE
         * @type {string}
         * @default "__default"
         */
        static DEFAULT_STATE = "__default";
    }
}
