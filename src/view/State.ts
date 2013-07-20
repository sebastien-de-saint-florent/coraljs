///<reference path="../ref.d.ts"/>
module Coral {
    export class State extends Coral.DescribableObject {

        static CHANGE_EVENT = "change";

        name: string;
        values: Descriptor<StateValue>[];
        _values: StateValue[];
        transitions: Descriptor<Transition>[];
        _transitions: Transition[];
        css: string;

        /**
         * State class must be used with {@linkcode Coral.Component} to provide state dependencies.<br/>
         * Values of this state are defined by nested {@linkcode Coral.StateValue}.
         * @constructor Coral.State
         * @extends Coral.DescribableObject
         * @see $State 
         * @property {string} name The name of this state. Default value : <code>"state"</code>.
         * @property {string} value The current state.
         * @property {Array} values An array of {@linkcode Coral.Descriptor}. All described objects are must extend {@linkcode Coral.StateValue}.
         * @property {Array} transitions An array of {@linkcode Coral.Descriptor}. All described objects are must extend {@linkcode Coral.Transition}.
         * @param {Coral.Descriptor} [description] A descriptor.
         * @param [context] The context passed to the new instance. All bindings and state dependencies will be tracked on this context.
         * @param [owner] The object that create and own the new instance.
         */
        constructor(description?: Descriptor<State>, context?, owner?) {
            this._value = "none";
            name = "state";
            super(description, context, owner);
            if (!this.name)
                this.name = "state";
            if (this.values) {
                this._values = Descriptor.instanciateAll(this.values, this.isExternal("values") ? this.context : this, this);
                this._valuesMap = {};
                for (var i = 0; i < this._values.length; ++i) {
                    this._valuesMap[this._values[i].value] = this._values[i];
                }
            }
            if (this.transitions)
                this._transitions = Descriptor.instanciateAll(this.transitions, this.isExternal("transitions") ? this.context : this, this);
            this.css = this.name + "-none";
            this._last = "none";
            Coral.Utils.callback(this.updateState, this);
        }
        private _valuesMap: {[value: string]: StateValue};
        private _last: string;
        private _currentState: Coral.StateValue;
        private waitingChange;
        private runningTransition: Coral.Transition;

        private _value: string;
        get value() {
            return this._value;
        }
        set value(v) {
            if (this._value === v)
                return;
            this._value = v;
            if (this._valuesMap)
                this.updateState();
        }
    
        /**
         * Test if given values match the current state.
         * @method matchState
         * @memberof Coral.State#
         * @param {Array} states A states array to match with.
         * @returns {boolean} <code>true</code> if any value in the array match the current state
         */
        matchState(states: string[]) {
            for (var i = 0; i < states.length; ++i)
                if ((this._currentState && this._currentState.matchState(states[i])) || (!this._currentState && states[i] == "none"))
                    return true;
            return false;
        }
    
        /**
         * Update the state with the current value.<br/>
         * updateState may run a transition.
         * @method updateState
         * @memberof Coral.State#
         * @param {string} newValue The new state value
         */
        updateState() {
            var newValue = this._value;
            var oldValue = this.getCurrentState();
            if (newValue === oldValue)
                return;
            var matchingTransition;
            if (this._transitions)
                for (var i = 0; i < this._transitions.length; ++i)
                    if (this._transitions[i].match(oldValue, newValue)) {
                        matchingTransition = this._transitions[i];
                        break;
                    }
            if (matchingTransition) {
                if (this.runningTransition)
                    this.waitingChange = {
                        transition: matchingTransition,
                        oldValue: oldValue,
                        newValue: newValue
                    };
                else {
                    this.runningTransition = matchingTransition;
                    this.runningTransition.on([Coral.Task.DONE_EVENT, this.uid], this.transitionEnd, this);
                    this.runningTransition.on([Coral.Task.CANCEL_EVENT, this.uid], this.transitionEnd, this);
                    this.runningTransition.run(oldValue, newValue);
                }
            }
            else {
                if (this.runningTransition)
                    this.waitingChange = newValue;
                else
                    this.triggerState(newValue);
            }
        }

    
        /**
         * Transition end handler
         * @method transitionEnd
         * @memberof Coral.State#
         * @private
         */
        transitionEnd() {
            this.runningTransition.off([Coral.Task.DONE_EVENT, this.uid]);
            this.runningTransition.off([Coral.Task.CANCEL_EVENT, this.uid]);
            var waitingChange = this.waitingChange;
            this.waitingChange = this.runningTransition = undefined;
            if (waitingChange && "transition" in waitingChange) {
                this.runningTransition = waitingChange.transition;
                this.runningTransition.on([Coral.Task.DONE_EVENT, this.uid], this.transitionEnd, this);
                this.runningTransition.on([Coral.Task.CANCEL_EVENT, this.uid], this.transitionEnd, this);
                this.runningTransition.run(waitingChange.oldValue, waitingChange.newValue);
            }
            else if (waitingChange)
                this.triggerState(waitingChange);
        }
    
        /**
         * Change the current state with the given value.<br/>
         * triggerState doesn't run transition.
         * @method triggerState
         * @memberof Coral.State#
         * @param {string} stateValue The new state value
         */
        triggerState(stateValue: string) {
            var oldValue = this.getCurrentState();
            if (this._currentState)
                this._currentState.leave();
            if (!this._currentState)
                this._last = "none";
            else if (!this._currentState.intermediate)
                this._last = oldValue;
            this._currentState = this.getStateValue(stateValue);
            if (this._currentState)
                this._currentState.enter();
            var newValue = this.getCurrentState();
            this.dispatch(new Coral.Event(Coral.State.CHANGE_EVENT, { stateName: this.name, oldValue: oldValue, newValue: newValue }));
            this.css = "-" + this.name + "-" + this._last + " " + this.name + "-" + newValue;
        }
    
        /**
         * Get the nested {@linkcode Coral.StateValue} by its value property
         * @method getStateValue
         * @memberof Coral.State#
         * @param {string} value The value of the requested {@linkcode Coral.StateValue}
         * @returns {Coral.StateValue} The {@linkcode Coral.StateValue} matching <code>value</code>
         */
        getStateValue(value: string):StateValue {
            return this._valuesMap[value];
        }
    
        /**
         * Get the current {@linkcode Coral.StateValue}
         * @method getCurrentStateValue
         * @memberof Coral.State#
         * @returns {Coral.StateValue} The current {@linkcode Coral.StateValue}
         */
        getCurrentStateValue():StateValue {
            return this._currentState;
        }
    
        /**
         * Get the value of the current {@linkcode Coral.StateValue}
         * @method getCurrentState
         * @memberof Coral.State#
         * @returns {string} The current state or <code>"none"</code>
         */
        getCurrentState():string {
            return this._currentState ? this._currentState.value : "none";
        }
    
        destroy() {
            super.destroy();
            if (this._values)
                for (var i = 0; i < this._values.length; ++i)
                    this._values[i].destroy();
            if (this._transitions)
                for (i = 0; i < this._transitions.length; ++i)
                    this._transitions[i].destroy();
        }
    }
    export interface IStateDescriptor extends IDescribableObjectDescriptor {
        name?: string;
        value?: string;
        values?: Descriptor<Coral.StateValue>[];
        transitions?: Descriptor<Coral.Transition>[];
        changeEvent?;
    }

    export class StateValue extends Coral.DescribableObject {
        static ENTER_STATE_EVENT = "enterState";
        static LEAVE_STATE_EVENT = "leaveState";

        value: string;
        state: Coral.State;
        intermediate: boolean;
        /**
         * StateValue class must be used with {@linkcode Coral.State} to provide state managment.<br/>
         * It defines a possible value of the parent {@linkcode Coral.State}.
         * @constructor Coral.StateValue
         * @extends Coral.DescribableObject
         * @see $StateValue
         * @property {string} value The value described.
         * @property {Coral.State} state The parent {@linkcode Coral.State}.
         * @property {boolean} intermediate <code>true</code> if this value must only be used with {@linkcode Coral.IntermediateState}. Default: <code>false</code>.
         * @param {Coral.Descriptor} [description] A descriptor.
         * @param [context] The context passed to the new instance. All bindings and state dependencies will be tracked on this context.
         * @param [owner] The object that create and own the new instance.
         */
        constructor(description?: Descriptor<StateValue>, context?, owner?) {
            super(description, context, owner);
            console.assert(owner instanceof State, "The owner of a StateValue must be a State");
            this.state = owner;
        }

        /**
         * Trigger <code>enterState</code> event
         * @method enter
         * @memberof Coral.StateValue#
         */
        enter() {
            this.dispatch(new Coral.Event(StateValue.ENTER_STATE_EVENT));
        }

        /**
         * Trigger <code>leaveState</code> event
         * @method leave
         * @memberof Coral.StateValue#
         */
        leave() {
            this.dispatch(new Coral.Event(StateValue.LEAVE_STATE_EVENT));
        }

        /**
         * Test if a value match this {@linkcode Coral.StateValue}
         * @method matchState
         * @memberof Coral.StateValue#
         * @returns {boolean} <code>true</code> if given value match
         */
        matchState(state: string) {
            return this.value == state;
        }
    }
    export interface IStateValueDescriptor extends IDescribableObjectDescriptor {
        value?: string;
        intermediate?: bool;
        enterStateEvent?;
        leaveStateEvent?;
    }

    export class Transition extends Coral.SequentialTasks {
    
        static TRANSITION_START_EVENT = "transitionStart";
        static TRANSITION_END_EVENT = "transitionEnd";

        from: string;
        to: string;
        state: Coral.State;

        /**
         * Transition class must be used with {@linkcode Coral.State} to provide state managment.<br/>
         * It defines a sequence of {@linkcode Coral.Task} to execute when a state change.
         * @constructor Coral.Transition
         * @extends Coral.SequentialTasks
         * @see $Transition
         * @property {string} from The value of the current state. If not specfied it can be any value.
         * @property {string} to The value of the target state. If not specfied it can be any value.
         * @property {Coral.State} state The parent {@linkcode Coral.State}.
   	     * @param {Coral.Descriptor} [description] A descriptor
	     * @param [context] The context passed to the new instance. All bindings and state dependencies will be tracked on this context.
	     * @param [owner] The object that create and own the new instance.
         */
	    constructor(description?: Descriptor<Transition>, context?, owner?) {
            super(description, context, owner);
            console.assert(owner instanceof State, "The owner of a Transition must be a State");
            this.state = owner;
        }
        private stateFrom: string;
        private stateTo: string;

        /**
         * Test if a state change match this transition.
         * @method match
         * @memberof Coral.Transition#
         * @returns {boolean} <code>true</code> if <code>from</code> and <code>to</code> match
         */
        match(from: string, to: string) {
            if (this.from == "any" || (this.from == "none" && from == "none") || (from != "none" && this.state.getStateValue(from).matchState(this.from)))
                if (this.to == "any" || (this.to == "none" && to == "none") || (to != "none" && this.state.getStateValue(to).matchState(this.to)))
                    return true;
            return false;
        }
    
        /**
         * Run the transition.<br/>
         * Override {@linkcode Coral.SequentialTasks#run}
         * @method run
         * @memberof Coral.Transition#
         * @param {string} from The current state
         * @param {string} to The target state
         */
        run(from?: string, to?: string) {
            this.stateFrom = from;
            this.stateTo = to;
            this.dispatch(new Coral.Event(Transition.TRANSITION_START_EVENT, { stateFrom: this.stateFrom, stateTo: this.stateTo }));
            super.run();
        }

    
        /**
         * Cancel the transition.<br/>
         * Override {@linkcode Coral.SequentialTasks#cancel}
         * @method cancel
         * @memberof Coral.Transition#
         */
        cancel() {
            this.state.triggerState(this.stateTo);
            super.cancel();
            this.dispatch(new Coral.Event(Transition.TRANSITION_END_EVENT, { stateFrom: this.stateFrom, stateTo: this.stateTo }, true));
        }
    
        /**
         * End the transition.<br/>
         * Override {@linkcode Coral.SequentialTasks#done}
         * @method done
         * @memberof Coral.Transition#
         */
        done() {
            this.state.triggerState(this.stateTo);
            super.done();
            this.dispatch(new Coral.Event(Transition.TRANSITION_END_EVENT, { stateFrom: this.stateFrom, stateTo: this.stateTo }, true));
        }
    }
    export interface ITransitionDescriptor extends ISequentialTasksDescriptor {
        from?: string;
        to?: string;
        transitionStartEvent?;
        transitionEndEvent?;
        fromWatcher?;
        toWatcher?;
    }

    export class IntermediateState extends Coral.Task {
        time: number;
        value: string;
        /**
         * IntermediateState class must be nested in a {@linkcode Coral.Transition}.<br/>
         * It is a task that change the current state to an intermediate one.
         * @constructor Coral.IntermediateState
         * @extends Coral.Task
         * @see $IntermediateState
         * @see Coral.Transition
         * @see Coral.StateValue
         * @property {number} time The waiting time after changing the current state. Default : 300ms.
         * @property {string} value The intermediate state key.
         * @param {Coral.Descriptor} [description] A descriptor.
         * @param [context] The context passed to the new instance. All bindings and state dependencies will be tracked on this context.
         * @param [owner] The object that create and own the new instance.
         * @param [item] An optional item used for item rendering.
         */
        constructor(description?: Descriptor<IntermediateState>, context?, owner?, item?) {
            this.time = 300;
            super(description, context, owner, item);
        }

        /**
         * Change the current state to the intermediate state <code>value</code>.<br/>
         * Override {@linkcode Coral.Task#run}
         * @method run
         * @memberof Coral.IntermediateState#
         */
        do() {
            var transition = this.owner;
            while (transition && !(transition instanceof Transition))
                transition = transition.owner;
            console.assert(transition, "IntermediateState must be nested into a Transition to take effect");
            transition.state.triggerState(transition.state.getStateValue(this.value));
            var that = this;
            var timeoutId = setTimeout(function () {
                if (!that.canceled)
                    that.done();
            }, this.time);
        }
    }

    export interface IIntermediateStateDescriptor extends ITaskDescriptor {
        time?: number;
        value?: string;
        timeWatcher?;
        valueWatcher?;
    }
}

/**
 * Shortcut for creating a {@linkcode Coral.State} Descriptor.
 * @method $State
 * @see Coral.State
 * @param description Attributes, Events and Watchers description
 * @returns {Coral.Descriptor}
 */
function $State(description: Coral.IStateDescriptor): Coral.Descriptor<Coral.State> {
	return new Coral.Descriptor(Coral.State, description)
}

/**
 * Shortcut for creating a {@linkcode Coral.StateValue} Descriptor.
 * @method $StateValue
 * @see Coral.StateValue
 * @param description Attributes, Events and Watchers description
 * @returns {Coral.Descriptor}
 */
function $StateValue(description: Coral.IStateValueDescriptor): Coral.Descriptor<Coral.StateValue> {
	return new Coral.Descriptor(Coral.StateValue, description)
}

/**
 * Shortcut for creating a {@linkcode Coral.Transition} Descriptor.
 * @method $Transition
 * @see Coral.Transition
 * @param description Attributes, Events and Watchers description
 * @returns {Coral.Descriptor}
 */
function $Transition(description: Coral.ITransitionDescriptor): Coral.Descriptor<Coral.Transition> {
    return new Coral.Descriptor(Coral.Transition, description)
}

/**
 * Shortcut for creating a {@linkcode Coral.IntermediateState} Descriptor.
 * @method $IntermediateState
 * @see Coral.IntermediateState
 * @param description Attributes, Events and Watchers description
 * @returns {Coral.Descriptor}
 */
function $IntermediateState(description: Coral.IIntermediateStateDescriptor): Coral.Descriptor<Coral.IntermediateState> {
    return new Coral.Descriptor(Coral.IntermediateState, description)
}