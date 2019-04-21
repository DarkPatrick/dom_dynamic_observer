var objects_to_control = [];
const SELECTORS = {
    ID: "id",
    CLASS: "class",
    TAG: "tag",
    PARENT: "parent",
    CHILDREN: "children",
    FUNCTION: "fun"
};

var events_map = {};
var functions_to_call = [];


function control_new_object_listener() {
    if (events_map[JSON.stringify(Array.prototype.slice.call(arguments, 1))] == 1) {
        if (add_object_listener.apply(this, Array.prototype.slice.call(arguments).concat(1)) == 0) {
            events_map[JSON.stringify(Array.prototype.slice.call(arguments, 1))] = 0;
        }
    } else {
        if (add_object_listener.apply(this, Array.prototype.slice.call(arguments).concat(0)) == 1) {
            events_map[JSON.stringify(Array.prototype.slice.call(arguments, 1))] = 1;
        }
    }
}

// первый раз arguments[0] = document,
// arguments[arguments.length - 1] = 1 - только проверка, 0 - установить листенер, 
// arguments[arguments.length - 2] = [], 
// arguments[arguments.length - 4]  - событие листенера
// arguments[arguments.length - 3] - функция
// самый примитивный пример: add_object_listener(document, SELECTORS.FUNCTION, 'click', function(num) {console.log(num);}, [42])
function add_object_listener() {
    try {
        let current_obj = arguments[0];

        switch (arguments[1]) {
            case SELECTORS.ID: {
                if (document.contains(current_obj.getElementById(arguments[2]))) {
                    current_obj = current_obj.getElementById(arguments[2]);
                    return (add_object_listener.apply(this, [current_obj].concat(Array.prototype.slice.call(arguments, 3))));
                }
                break;
            }
            case SELECTORS.CLASS: {
                if (arguments[3].match(/^\d+$/)) {
                    // числом указали индекс
                    if (document.contains(current_obj.getElementsByClassName(arguments[2])[Number(arguments[3])])) {
                        current_obj = current_obj.getElementsByClassName(arguments[2])[Number(arguments[3])];
                        return (add_object_listener.apply(this, [current_obj].concat(Array.prototype.slice.call(arguments, 4))));
                    }
                } else if (arguments[3].match(/^all$/i)) {
                    // для всех найденных элементов
                    if (document.contains(current_obj.getElementsByClassName(arguments[2])[0])) {
                        let sum = 0;

                        for (let id = 0; id < current_obj.getElementsByClassName(arguments[2]).length; ++id) {
                            sum += add_object_listener.apply(this, [current_obj.getElementsByClassName(arguments[2])[id]].concat(Array.prototype.slice.call(arguments, 4)));
                        }
                        if (sum == current_obj.getElementsByClassName(arguments[2]).length) {
                            return 1;
                        }
                    }
                } else if (arguments[3].match(/^[a-z]/i)) {
                    // для переменной, которую можно использовать потом (наверно)
                    if (document.contains(current_obj.getElementsByClassName(arguments[2])[0])) {
                        let sum = 0;

                        for (let id = 0; id < current_obj.getElementsByClassName(arguments[2]).length; ++id) {
                            arguments[arguments.length - 2].push(id);
                            sum += add_object_listener.apply(this, [current_obj.getElementsByClassName(arguments[2])[id]].concat(Array.prototype.slice.call(arguments, 4)));
                            arguments[arguments.length - 2].pop();
                        }
                        if (sum == current_obj.getElementsByClassName(arguments[2]).length) {
                            return 1;
                        }
                    }
                } else {
                    console.error("no such index description'" + arguments[3] + "'!");
                }
                break;
            }
            case SELECTORS.TAG: {
                if (arguments[3].match(/^\d+$/)) {
                    // числом указали индекс
                    if (document.contains(current_obj.getElementsByTagName(arguments[2])[Number(arguments[3])])) {
                        current_obj = current_obj.getElementsByTagName(arguments[2])[Number(arguments[3])];
                        return (add_object_listener.apply(this, [current_obj].concat(Array.prototype.slice.call(arguments, 4))));
                    }
                } else if (arguments[3].match(/^all$/i)) {
                    // для всех найденных элементов
                    if (document.contains(current_obj.getElementsByTagName(arguments[2])[0])) {
                        let sum = 0;

                        for (let id = 0; id < current_obj.getElementsByTagName(arguments[2]).length; ++id) {
                            sum += add_object_listener.apply(this, [current_obj.getElementsByTagName(arguments[2])[id]].concat(Array.prototype.slice.call(arguments, 4)));
                        }
                        if (sum == urrent_obj.getElementsByTagName(arguments[2]).length) {
                            return (1);
                        }
                    }
                } else if (arguments[3].match(/^[a-z]/i)) {
                    // для переменной, которую можно использовать потом (наверно)
                    if (document.contains(current_obj.getElementsByTagName(arguments[2])[0])) {
                        let sum = 0;

                        for (let id = 0; id < current_obj.getElementsByTagName(arguments[2]).length; ++id) {
                            arguments[arguments.length - 2].push(id);
                            sum += add_object_listener.apply(this, [current_obj.getElementsByTagName(arguments[2])[id]].concat(Array.prototype.slice.call(arguments, 4)));
                            arguments[arguments.length - 2].pop();
                        }
                        if (sum == urrent_obj.getElementsByTagName(arguments[2]).length) {
                            return (1);
                        }
                    }
                } else {
                    console.error("no such index description'" + arguments[3] + "'!");
                }
                break;
            }
            case SELECTORS.FUNCTION: {
                var event_listener = arguments[2];
                var function_name = arguments[3];
                var function_params = arguments[4].slice();

                if (arguments[5] == 0) {
                    (function() {
                        current_obj.addEventListener(event_listener, function() {
                            function_name(function_params);
                        }, false);
                    })();
                }

                return 1;
            }
            default: {
                console.error("no such selector '" + arguments[1] + "'!");
                break;
            }
        }
    } catch (e) {
        console.error("congratulations! some shit has happened with your arguments!");
    }

    return 0;
}

function dom_observer_function() {
    for (let i = 0; i < functions_to_call.length; ++i) {
        functions_to_call[i]();
    }
    //dom_observer.disconnect();
}

var dom_observer = new MutationObserver(function(mutations) {
    dom_observer_function();
});

dom_observer_function();

dom_observer.observe(document, {
    attributes: true,
    childList: true,
    subtree: true,
    characterData: true
});
