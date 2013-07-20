///<reference path="../ref.d.ts"/>
module Coral {
    export class Task extends Coral.DescribableObject {
        /**
         * Run event key
         * @constant Coral.Task.RUN_EVENT
         * @type {string}
         * @default "run"
         */
	    static RUN_EVENT = "run";
        /**
         * Done event key
         * @constant Coral.Task.DONE_EVENT
         * @type {string}
         * @default "done"
         */
	    static DONE_EVENT = "done";
        /**
         * Cancel event key
         * @constant Coral.Task.CANCEL_EVENT
         * @type {string}
         * @default "cancel"
         */
	    static CANCEL_EVENT = "cancel";
	
	    canceled: boolean;
        running: boolean;
        critical: boolean;
    
        /**
         * Task is the base class for running a job.
         * @constructor Coral.Task
         * @extends Coral.DescribableObject
         * @see $Task
         * @property {boolean} running A <code>true</code> value means that the Task is running.
         * @property {boolean} canceled A <code>true</code> value means that the last execution has been canceled.
         * @property {boolean} critical A <code>true</code> value means that dependant tasks must also be canceled with this one. Default value : <code>true</code>.
         * @param {Coral.Descriptor} [description] A descriptor.
         * @param [context] The context passed to the new instance. All bindings and state dependencies will be tracked on this context.
         * @param [owner] The object that create and own the new instance.
         * @param [item] An optional item used for item rendering.
         */
        constructor(description?: Descriptor<Task>, context?, owner?, item?) {
            super(description, context, owner, item);
        }

        /**
         * Execute the task and dispatch "run" event
         * @method run
         * @memberof Coral.Task#
         */
        run() {
            if (this.running)
                throw "Task [" + this["constructor"].name + "] " + this.uid + " is already running";
            this.dispatch(new Coral.Event(Task.RUN_EVENT));
            this.canceled = false;
            this.running = true;
            this.do();
        }

        /**
         * Task stuff. Shall be override in child classes or configured dynamically.
         * @method do
         * @memberof Coral.Task#
         */
        do() {
            // task stuff here
        }

        /**
         * Cancel the task if it is running
         * If the task is canceled, a "cancel" event is dispatched
         * @method cancel
         * @memberof Coral.Task#
         */
	    cancel() {
            if (this.running) {
                this.canceled = true;
                this.running = false;
                this.dispatch(new Coral.Event(Task.CANCEL_EVENT));
            }
        }

        /**
         * End the task execution and dispatch a "done" event
         * @method done
         * @memberof Coral.Task#
         */
        done() {
            this.running = false;
            this.dispatch(new Coral.Event(Task.DONE_EVENT));
        }
    }
    Task.prototype.canceled = false;
    Task.prototype.running = false;
    Task.prototype.critical = true;

    export interface ITaskDescriptor extends IDescribableObjectDescriptor {
        do?: () => any;
        critical?: bool;
        cancelEvent?;
        runEvent?;
        doneEvent?;
        runningWatcher?;
        canceledWatcher?;
        criticalWatcher?;
    }

    export class SequentialTasks extends Task {
        tasks: Descriptor<Task>[];
        _tasks: Task[];
        /**
         * SequentialTasks is a Task that run nested "tasks" sequentialy
         * @constructor Coral.SequentialTasks
         * @extends Coral.Task
         * @see $SequentialTasks
         * @property {Array} tasks An array of {@linkcode Coral.Descriptor}. Object described must extends {@linkcode Coral.Task}.
         * @param {Coral.Descriptor} [description] A descriptor
         * @param [context] The context passed to the new instance. All bindings and state dependencies will be tracked on this context.
         * @param [owner] The object that create and own the new instance 
         * @param [item] An optional item used for item rendering
         */
        constructor(description?: Descriptor<SequentialTasks>, context?, owner?, item?) {
            super(description, context, owner, item);
        }
        private tasksInitialized: boolean;
        private taskIndex: number;

        /**
         * Execute all tasks described in tasks property sequentialy
         * @method do
         * @memberof Coral.SequentialTasks#
         */
        do() {
            if (!this.tasksInitialized && this.tasks) {
                this._tasks = Descriptor.instanciateAll(this.tasks, this.isExternal("tasks") ? this.context : this, this);
                this.tasksInitialized = true;
            }
            this.taskIndex = -1;
            this.runNext();
        }
        
        /**
         * Cancel this task by calling cancel on all runnig sub tasks
         * @method cancel
         * @memberof Coral.SequentialTasks#
         */
        cancel() {
            super.cancel();
            if (this.running) {
                if (this._tasks && this.taskIndex < this._tasks.length) {
                    this._tasks[this.taskIndex].off([Task.DONE_EVENT, this.uid]);
                    this._tasks[this.taskIndex].off([Task.CANCEL_EVENT, this.uid]);
                    this._tasks[this.taskIndex].cancel();
                }
            }
        }
    
        /**
         * @private
         */
        subTaskCanceled(event) {
            if (event.target.critical)
                this.cancel();
            else
                this.runNext();
        }
        
        /**
         * @private
         */
        runNext() {
            if (this.taskIndex >= 0) {
                this._tasks[this.taskIndex].off([Task.DONE_EVENT, this.uid]);
                this._tasks[this.taskIndex].off([Task.CANCEL_EVENT, this.uid]);
            }
            if (!this.canceled) {
                ++this.taskIndex;
                if (!this._tasks || this._tasks.length <= this.taskIndex)
                    this.done();
                else {
                    var task = this._tasks[this.taskIndex];
                    task.on([Task.DONE_EVENT, this.uid], this.runNext, this);
                    task.on([Task.CANCEL_EVENT, this.uid], this.subTaskCanceled, this);
                    task.run();
                }
            }
        }

        /**
         * Call super class destroy and destroy sub tasks
         * @method destroy
         * @memberof Coral.SequentialTasks#
         */
        destroy() {
            super.destroy();
            if (this._tasks)
                for (var i = 0; i < this._tasks.length; ++i) {
                    this._tasks[i].destroy();
                }
        }
    }

    export interface ISequentialTasksDescriptor extends ITaskDescriptor {
        tasks?: Descriptor<Coral.Task>[];
    }

    export class ParallelTasks extends Task {
        tasks: Descriptor<Task>[];
        _tasks: Task[];
        /**
         * ParallelTasks is a {@linkcode Coral.Task} that run nested <code>tasks</code> in parallel.
         * @constructor Coral.ParallelTasks
         * @extends Coral.Task
         * @see $ParallelTasks
         * @param {Coral.Descriptor} [description] A descriptor.
         * @param [context] The context passed to the new instance. All bindings and state dependencies will be tracked on this context.
         * @param [owner] The object that create and own the new instance.
         * @param [item] An optional item used for item rendering.
         */
        constructor(description?: Descriptor<ParallelTasks>, context?, owner?, item?) {
            super(description, context, owner, item);
        }
        private tasksInitialized: boolean;
        private taskCount: number;

        /**
         * Execute all tasks described in <code>tasks</code> property in parallel.
         * @method do
         * @memberof Coral.ParallelTasks#
         */
        do() {
            if (!this.tasksInitialized && this.tasks) {
                this._tasks = Descriptor.instanciateAll(this.tasks, this.isExternal("tasks") ? this.context : this, this);
                this.tasksInitialized = true;
            }
            if (!this._tasks || this._tasks.length == 0)
                this.done();
            else {
                this.taskCount = 0;
                for (var i = 0; i < this._tasks.length && !this.canceled; ++i) {
                    var task = this._tasks[i];
                    task.on([Task.DONE_EVENT, this.uid], this.partialDone, this);
                    task.on([Task.CANCEL_EVENT, this.uid], this.subTaskCanceled, this);
                    this._tasks[i].run();
                }
            }
        }
    
        /**
         * Cancel this task by calling cancel on all runnig sub tasks.
         * @method cancel
         * @memberof Coral.ParallelTasks#
         */
        cancel() {
            super.cancel();
            if (this._tasks)
                for (var i = 0; i < this._tasks.length; ++i) {
                    this._tasks[i].off([Task.DONE_EVENT, this.uid]);
                    this._tasks[i].off([Task.CANCEL_EVENT, this.uid]);
                    this._tasks[i].cancel();
                }
        }
    
        /**
         * @private
         */
        subTaskCanceled(event: Coral.Event) {
            if ((<Task>event.target).critical)
                this.cancel();
            else
                this.partialDone();
        }
    
        /**
         * @private
         */
        partialDone() {
            if (!this.canceled) {
                ++this.taskCount;
                if (this.taskCount >= this._tasks.length) {
                    for (var i = 0; i < this._tasks.length; ++i) {
                        this._tasks[i].off([Task.DONE_EVENT, this.uid]);
                        this._tasks[i].off([Task.CANCEL_EVENT, this.uid]);
                    }
                    this.done();
                }
            }
        }

        /**
         * Destroy sub tasks.
         * @method destroy
         * @memberof Coral.ParallelTasks#
         */
        destroy() {
            super.destroy();
            if (this._tasks)
                for (var i = 0; i < this._tasks.length; ++i) {
                    this._tasks[i].destroy();
                }
        }
    }
    export interface IParallelTasksDescriptor extends ITaskDescriptor {
        tasks?: Descriptor<Coral.Task>[];
    }
}

/**
 * Shortcut for creating a {@linkcode Coral.Task} Descriptor.
 * @method $Task
 * @see Coral.Task
 * @param description Attributes, Events and Watchers description
 * @returns {Coral.Descriptor}
 */
function $Task(description: Coral.ITaskDescriptor): Coral.Descriptor<Coral.Task> {
	return new Coral.Descriptor(Coral.Task, description)
}

/**
 * Shortcut for creating a {@linkcode Coral.SequentialTasks} Descriptor.
 * @method $SequentialTasks
 * @see Coral.SequentialTasks
 * @param description Attributes, Events and Watchers description
 * @returns {Coral.Descriptor}
 */
function $SequentialTasks(description: Coral.ISequentialTasksDescriptor): Coral.Descriptor<Coral.SequentialTasks> {
    return new Coral.Descriptor(Coral.SequentialTasks, description)
}

/**
 * Shortcut for creating a {@linkcode Coral.ParallelTasks} Descriptor.
 * @method $ParallelTasks
 * @see Coral.ParallelTasks
 * @param description Attributes, Events and Watchers description
 * @returns {Coral.Descriptor}
 */
function $ParallelTasks(description: Coral.IParallelTasksDescriptor): Coral.Descriptor<Coral.ParallelTasks> {
    return new Coral.Descriptor(Coral.ParallelTasks, description)
}