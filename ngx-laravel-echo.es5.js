import { Observable, of, ReplaySubject, Subject, throwError } from 'rxjs';
import { distinctUntilChanged, map, shareReplay, startWith } from 'rxjs/operators';
import * as io$1 from 'socket.io-client';
import { CommonModule } from '@angular/common';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { Inject, Injectable, InjectionToken, NgZone, NgModule } from '@angular/core';

var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

var createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();

var _extends = Object.assign || function (target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i];

    for (var key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        target[key] = source[key];
      }
    }
  }

  return target;
};

var inherits = function (subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
};

var possibleConstructorReturn = function (self, call) {
  if (!self) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return call && (typeof call === "object" || typeof call === "function") ? call : self;
};

var Connector = function () {
    /**
     * Create a new class instance.
     */
    function Connector(options) {
        classCallCheck(this, Connector);

        /**
         * Default connector options.
         */
        this._defaultOptions = {
            auth: {
                headers: {}
            },
            authEndpoint: '/broadcasting/auth',
            broadcaster: 'pusher',
            csrfToken: null,
            host: null,
            key: null,
            namespace: 'App.Events'
        };
        this.setOptions(options);
        this.connect();
    }
    /**
     * Merge the custom options with the defaults.
     */


    createClass(Connector, [{
        key: 'setOptions',
        value: function setOptions(options) {
            this.options = _extends(this._defaultOptions, options);
            if (this.csrfToken()) {
                this.options.auth.headers['X-CSRF-TOKEN'] = this.csrfToken();
            }
            return options;
        }
        /**
         * Extract the CSRF token from the page.
         */

    }, {
        key: 'csrfToken',
        value: function csrfToken() {
            var selector = void 0;
            if (typeof window !== 'undefined' && window['Laravel'] && window['Laravel'].csrfToken) {
                return window['Laravel'].csrfToken;
            } else if (this.options.csrfToken) {
                return this.options.csrfToken;
            } else if (typeof document !== 'undefined' && (selector = document.querySelector('meta[name="csrf-token"]'))) {
                return selector.getAttribute('content');
            }
            return null;
        }
    }]);
    return Connector;
}();

/**
 * This class represents a basic channel.
 */
var Channel = function () {
  function Channel() {
    classCallCheck(this, Channel);
  }

  createClass(Channel, [{
    key: 'listenForWhisper',

    /**
     * Listen for a whisper event on the channel instance.
     */
    value: function listenForWhisper(event, callback) {
      return this.listen('.client-' + event, callback);
    }
    /**
     * Listen for an event on the channel instance.
     */

  }, {
    key: 'notification',
    value: function notification(callback) {
      return this.listen('.Illuminate\\Notifications\\Events\\BroadcastNotificationCreated', callback);
    }
  }]);
  return Channel;
}();

/**
 * Event name formatter
 */
var EventFormatter = function () {
    /**
     * Create a new class instance.
     */
    function EventFormatter(namespace) {
        classCallCheck(this, EventFormatter);

        this.setNamespace(namespace);
    }
    /**
     * Format the given event name.
     */


    createClass(EventFormatter, [{
        key: 'format',
        value: function format(event) {
            if (event.charAt(0) === '.' || event.charAt(0) === '\\') {
                return event.substr(1);
            } else if (this.namespace) {
                event = this.namespace + '.' + event;
            }
            return event.replace(/\./g, '\\');
        }
        /**
         * Set the event namespace.
         */

    }, {
        key: 'setNamespace',
        value: function setNamespace(value) {
            this.namespace = value;
        }
    }]);
    return EventFormatter;
}();

/**
 * This class represents a Pusher channel.
 */
var PusherChannel = function (_Channel) {
    inherits(PusherChannel, _Channel);

    /**
     * Create a new class instance.
     */
    function PusherChannel(pusher, name, options) {
        classCallCheck(this, PusherChannel);

        var _this = possibleConstructorReturn(this, (PusherChannel.__proto__ || Object.getPrototypeOf(PusherChannel)).call(this));

        _this.name = name;
        _this.pusher = pusher;
        _this.options = options;
        _this.eventFormatter = new EventFormatter(_this.options.namespace);
        _this.subscribe();
        return _this;
    }
    /**
     * Subscribe to a Pusher channel.
     */


    createClass(PusherChannel, [{
        key: 'subscribe',
        value: function subscribe() {
            this.subscription = this.pusher.subscribe(this.name);
        }
        /**
         * Unsubscribe from a Pusher channel.
         */

    }, {
        key: 'unsubscribe',
        value: function unsubscribe() {
            this.pusher.unsubscribe(this.name);
        }
        /**
         * Listen for an event on the channel instance.
         */

    }, {
        key: 'listen',
        value: function listen(event, callback) {
            this.on(this.eventFormatter.format(event), callback);
            return this;
        }
        /**
         * Stop listening for an event on the channel instance.
         */

    }, {
        key: 'stopListening',
        value: function stopListening(event) {
            this.subscription.unbind(this.eventFormatter.format(event));
            return this;
        }
        /**
         * Bind a channel to an event.
         */

    }, {
        key: 'on',
        value: function on(event, callback) {
            this.subscription.bind(event, callback);
            return this;
        }
    }]);
    return PusherChannel;
}(Channel);

/**
 * This class represents a Pusher private channel.
 */
var PusherPrivateChannel = function (_PusherChannel) {
    inherits(PusherPrivateChannel, _PusherChannel);

    function PusherPrivateChannel() {
        classCallCheck(this, PusherPrivateChannel);
        return possibleConstructorReturn(this, (PusherPrivateChannel.__proto__ || Object.getPrototypeOf(PusherPrivateChannel)).apply(this, arguments));
    }

    createClass(PusherPrivateChannel, [{
        key: 'whisper',

        /**
         * Trigger client event on the channel.
         */
        value: function whisper(eventName, data) {
            this.pusher.channels.channels[this.name].trigger('client-' + eventName, data);
            return this;
        }
    }]);
    return PusherPrivateChannel;
}(PusherChannel);

/**
 * This class represents a Pusher presence channel.
 */
var PusherPresenceChannel = function (_PusherChannel) {
    inherits(PusherPresenceChannel, _PusherChannel);

    function PusherPresenceChannel() {
        classCallCheck(this, PusherPresenceChannel);
        return possibleConstructorReturn(this, (PusherPresenceChannel.__proto__ || Object.getPrototypeOf(PusherPresenceChannel)).apply(this, arguments));
    }

    createClass(PusherPresenceChannel, [{
        key: 'here',

        /**
         * Register a callback to be called anytime the member list changes.
         */
        value: function here(callback) {
            this.on('pusher:subscription_succeeded', function (data) {
                callback(Object.keys(data.members).map(function (k) {
                    return data.members[k];
                }));
            });
            return this;
        }
        /**
         * Listen for someone joining the channel.
         */

    }, {
        key: 'joining',
        value: function joining(callback) {
            this.on('pusher:member_added', function (member) {
                callback(member.info);
            });
            return this;
        }
        /**
         * Listen for someone leaving the channel.
         */

    }, {
        key: 'leaving',
        value: function leaving(callback) {
            this.on('pusher:member_removed', function (member) {
                callback(member.info);
            });
            return this;
        }
        /**
         * Trigger client event on the channel.
         */

    }, {
        key: 'whisper',
        value: function whisper(eventName, data) {
            this.pusher.channels.channels[this.name].trigger('client-' + eventName, data);
            return this;
        }
    }]);
    return PusherPresenceChannel;
}(PusherChannel);

/**
 * This class represents a Socket.io channel.
 */
var SocketIoChannel = function (_Channel) {
    inherits(SocketIoChannel, _Channel);

    /**
     * Create a new class instance.
     */
    function SocketIoChannel(socket, name, options) {
        classCallCheck(this, SocketIoChannel);

        /**
         * The event callbacks applied to the channel.
         */
        var _this = possibleConstructorReturn(this, (SocketIoChannel.__proto__ || Object.getPrototypeOf(SocketIoChannel)).call(this));

        _this.events = {};
        _this.name = name;
        _this.socket = socket;
        _this.options = options;
        _this.eventFormatter = new EventFormatter(_this.options.namespace);
        _this.subscribe();
        _this.configureReconnector();
        return _this;
    }
    /**
     * Subscribe to a Socket.io channel.
     */


    createClass(SocketIoChannel, [{
        key: 'subscribe',
        value: function subscribe() {
            this.socket.emit('subscribe', {
                channel: this.name,
                auth: this.options.auth || {}
            });
        }
        /**
         * Unsubscribe from channel and ubind event callbacks.
         */

    }, {
        key: 'unsubscribe',
        value: function unsubscribe() {
            this.unbind();
            this.socket.emit('unsubscribe', {
                channel: this.name,
                auth: this.options.auth || {}
            });
        }
        /**
         * Listen for an event on the channel instance.
         */

    }, {
        key: 'listen',
        value: function listen(event, callback) {
            this.on(this.eventFormatter.format(event), callback);
            return this;
        }
        /**
         * Stop listening for an event on the channel instance.
         */

    }, {
        key: 'stopListening',
        value: function stopListening(event) {
            var name = this.eventFormatter.format(event);
            this.socket.removeListener(name);
            delete this.events[name];
            return this;
        }
        /**
         * Bind the channel's socket to an event and store the callback.
         */

    }, {
        key: 'on',
        value: function on(event, callback) {
            var _this2 = this;

            var listener = function listener(channel, data) {
                if (_this2.name == channel) {
                    callback(data);
                }
            };
            this.socket.on(event, listener);
            this.bind(event, listener);
        }
        /**
         * Attach a 'reconnect' listener and bind the event.
         */

    }, {
        key: 'configureReconnector',
        value: function configureReconnector() {
            var _this3 = this;

            var listener = function listener() {
                _this3.subscribe();
            };
            this.socket.on('reconnect', listener);
            this.bind('reconnect', listener);
        }
        /**
         * Bind the channel's socket to an event and store the callback.
         */

    }, {
        key: 'bind',
        value: function bind(event, callback) {
            this.events[event] = this.events[event] || [];
            this.events[event].push(callback);
        }
        /**
         * Unbind the channel's socket from all stored event callbacks.
         */

    }, {
        key: 'unbind',
        value: function unbind() {
            var _this4 = this;

            Object.keys(this.events).forEach(function (event) {
                _this4.events[event].forEach(function (callback) {
                    _this4.socket.removeListener(event, callback);
                });
                delete _this4.events[event];
            });
        }
    }]);
    return SocketIoChannel;
}(Channel);

/**
 * This class represents a Socket.io presence channel.
 */
var SocketIoPrivateChannel = function (_SocketIoChannel) {
    inherits(SocketIoPrivateChannel, _SocketIoChannel);

    function SocketIoPrivateChannel() {
        classCallCheck(this, SocketIoPrivateChannel);
        return possibleConstructorReturn(this, (SocketIoPrivateChannel.__proto__ || Object.getPrototypeOf(SocketIoPrivateChannel)).apply(this, arguments));
    }

    createClass(SocketIoPrivateChannel, [{
        key: 'whisper',

        /**
         * Trigger client event on the channel.
         */
        value: function whisper(eventName, data) {
            this.socket.emit('client event', {
                channel: this.name,
                event: 'client-' + eventName,
                data: data
            });
            return this;
        }
    }]);
    return SocketIoPrivateChannel;
}(SocketIoChannel);

/**
 * This class represents a Socket.io presence channel.
 */
var SocketIoPresenceChannel = function (_SocketIoPrivateChann) {
    inherits(SocketIoPresenceChannel, _SocketIoPrivateChann);

    function SocketIoPresenceChannel() {
        classCallCheck(this, SocketIoPresenceChannel);
        return possibleConstructorReturn(this, (SocketIoPresenceChannel.__proto__ || Object.getPrototypeOf(SocketIoPresenceChannel)).apply(this, arguments));
    }

    createClass(SocketIoPresenceChannel, [{
        key: 'here',

        /**
         * Register a callback to be called anytime the member list changes.
         */
        value: function here(callback) {
            this.on('presence:subscribed', function (members) {
                callback(members.map(function (m) {
                    return m.user_info;
                }));
            });
            return this;
        }
        /**
         * Listen for someone joining the channel.
         */

    }, {
        key: 'joining',
        value: function joining(callback) {
            this.on('presence:joining', function (member) {
                return callback(member.user_info);
            });
            return this;
        }
        /**
         * Listen for someone leaving the channel.
         */

    }, {
        key: 'leaving',
        value: function leaving(callback) {
            this.on('presence:leaving', function (member) {
                return callback(member.user_info);
            });
            return this;
        }
    }]);
    return SocketIoPresenceChannel;
}(SocketIoPrivateChannel);

/**
 * This class represents a null channel.
 */
var NullChannel = function (_Channel) {
  inherits(NullChannel, _Channel);

  function NullChannel() {
    classCallCheck(this, NullChannel);
    return possibleConstructorReturn(this, (NullChannel.__proto__ || Object.getPrototypeOf(NullChannel)).apply(this, arguments));
  }

  createClass(NullChannel, [{
    key: 'subscribe',

    /**
     * Subscribe to a channel.
     */
    value: function subscribe() {}
    //

    /**
     * Unsubscribe from a channel.
     */

  }, {
    key: 'unsubscribe',
    value: function unsubscribe() {}
    //

    /**
     * Listen for an event on the channel instance.
     */

  }, {
    key: 'listen',
    value: function listen(event, callback) {
      return this;
    }
    /**
     * Stop listening for an event on the channel instance.
     */

  }, {
    key: 'stopListening',
    value: function stopListening(event) {
      return this;
    }
    /**
     * Bind a channel to an event.
     */

  }, {
    key: 'on',
    value: function on(event, callback) {
      return this;
    }
  }]);
  return NullChannel;
}(Channel);

/**
 * This class represents a null private channel.
 */
var NullPrivateChannel = function (_NullChannel) {
  inherits(NullPrivateChannel, _NullChannel);

  function NullPrivateChannel() {
    classCallCheck(this, NullPrivateChannel);
    return possibleConstructorReturn(this, (NullPrivateChannel.__proto__ || Object.getPrototypeOf(NullPrivateChannel)).apply(this, arguments));
  }

  createClass(NullPrivateChannel, [{
    key: 'whisper',

    /**
     * Trigger client event on the channel.
     */
    value: function whisper(eventName, data) {
      return this;
    }
  }]);
  return NullPrivateChannel;
}(NullChannel);

/**
 * This class represents a null presence channel.
 */
var NullPresenceChannel = function (_NullChannel) {
  inherits(NullPresenceChannel, _NullChannel);

  function NullPresenceChannel() {
    classCallCheck(this, NullPresenceChannel);
    return possibleConstructorReturn(this, (NullPresenceChannel.__proto__ || Object.getPrototypeOf(NullPresenceChannel)).apply(this, arguments));
  }

  createClass(NullPresenceChannel, [{
    key: 'here',

    /**
     * Register a callback to be called anytime the member list changes.
     */
    value: function here(callback) {
      return this;
    }
    /**
     * Listen for someone joining the channel.
     */

  }, {
    key: 'joining',
    value: function joining(callback) {
      return this;
    }
    /**
     * Listen for someone leaving the channel.
     */

  }, {
    key: 'leaving',
    value: function leaving(callback) {
      return this;
    }
    /**
     * Trigger client event on the channel.
     */

  }, {
    key: 'whisper',
    value: function whisper(eventName, data) {
      return this;
    }
  }]);
  return NullPresenceChannel;
}(NullChannel);

/**
 * This class creates a connector to Pusher.
 */
var PusherConnector = function (_Connector) {
    inherits(PusherConnector, _Connector);

    function PusherConnector() {
        classCallCheck(this, PusherConnector);

        /**
         * All of the subscribed channel names.
         */
        var _this = possibleConstructorReturn(this, (PusherConnector.__proto__ || Object.getPrototypeOf(PusherConnector)).apply(this, arguments));

        _this.channels = {};
        return _this;
    }
    /**
     * Create a fresh Pusher connection.
     */


    createClass(PusherConnector, [{
        key: 'connect',
        value: function connect() {
            if (typeof this.options.client !== 'undefined') {
                this.pusher = this.options.client;
            } else {
                this.pusher = new Pusher(this.options.key, this.options);
            }
        }
        /**
         * Listen for an event on a channel instance.
         */

    }, {
        key: 'listen',
        value: function listen(name, event, callback) {
            return this.channel(name).listen(event, callback);
        }
        /**
         * Get a channel instance by name.
         */

    }, {
        key: 'channel',
        value: function channel(name) {
            if (!this.channels[name]) {
                this.channels[name] = new PusherChannel(this.pusher, name, this.options);
            }
            return this.channels[name];
        }
        /**
         * Get a private channel instance by name.
         */

    }, {
        key: 'privateChannel',
        value: function privateChannel(name) {
            if (!this.channels['private-' + name]) {
                this.channels['private-' + name] = new PusherPrivateChannel(this.pusher, 'private-' + name, this.options);
            }
            return this.channels['private-' + name];
        }
        /**
         * Get a presence channel instance by name.
         */

    }, {
        key: 'presenceChannel',
        value: function presenceChannel(name) {
            if (!this.channels['presence-' + name]) {
                this.channels['presence-' + name] = new PusherPresenceChannel(this.pusher, 'presence-' + name, this.options);
            }
            return this.channels['presence-' + name];
        }
        /**
         * Leave the given channel.
         */

    }, {
        key: 'leave',
        value: function leave(name) {
            var _this2 = this;

            var channels = [name, 'private-' + name, 'presence-' + name];
            channels.forEach(function (name, index) {
                if (_this2.channels[name]) {
                    _this2.channels[name].unsubscribe();
                    delete _this2.channels[name];
                }
            });
        }
        /**
         * Get the socket ID for the connection.
         */

    }, {
        key: 'socketId',
        value: function socketId() {
            return this.pusher.connection.socket_id;
        }
        /**
         * Disconnect Pusher connection.
         */

    }, {
        key: 'disconnect',
        value: function disconnect() {
            this.pusher.disconnect();
        }
    }]);
    return PusherConnector;
}(Connector);

/**
 * This class creates a connnector to a Socket.io server.
 */
var SocketIoConnector = function (_Connector) {
    inherits(SocketIoConnector, _Connector);

    function SocketIoConnector() {
        classCallCheck(this, SocketIoConnector);

        /**
         * All of the subscribed channel names.
         */
        var _this = possibleConstructorReturn(this, (SocketIoConnector.__proto__ || Object.getPrototypeOf(SocketIoConnector)).apply(this, arguments));

        _this.channels = {};
        return _this;
    }
    /**
     * Create a fresh Socket.io connection.
     */


    createClass(SocketIoConnector, [{
        key: 'connect',
        value: function connect() {
            var io = this.getSocketIO();
            this.socket = io(this.options.host, this.options);
            return this.socket;
        }
        /**
         * Get socket.io module from global scope or options.
         */

    }, {
        key: 'getSocketIO',
        value: function getSocketIO() {
            if (typeof io !== 'undefined') {
                return io;
            }
            if (typeof this.options.client !== 'undefined') {
                return this.options.client;
            }
            throw new Error('Socket.io client not found. Should be globally available or passed via options.client');
        }
        /**
         * Listen for an event on a channel instance.
         */

    }, {
        key: 'listen',
        value: function listen(name, event, callback) {
            return this.channel(name).listen(event, callback);
        }
        /**
         * Get a channel instance by name.
         */

    }, {
        key: 'channel',
        value: function channel(name) {
            if (!this.channels[name]) {
                this.channels[name] = new SocketIoChannel(this.socket, name, this.options);
            }
            return this.channels[name];
        }
        /**
         * Get a private channel instance by name.
         */

    }, {
        key: 'privateChannel',
        value: function privateChannel(name) {
            if (!this.channels['private-' + name]) {
                this.channels['private-' + name] = new SocketIoPrivateChannel(this.socket, 'private-' + name, this.options);
            }
            return this.channels['private-' + name];
        }
        /**
         * Get a presence channel instance by name.
         */

    }, {
        key: 'presenceChannel',
        value: function presenceChannel(name) {
            if (!this.channels['presence-' + name]) {
                this.channels['presence-' + name] = new SocketIoPresenceChannel(this.socket, 'presence-' + name, this.options);
            }
            return this.channels['presence-' + name];
        }
        /**
         * Leave the given channel.
         */

    }, {
        key: 'leave',
        value: function leave(name) {
            var _this2 = this;

            var channels = [name, 'private-' + name, 'presence-' + name];
            channels.forEach(function (name) {
                if (_this2.channels[name]) {
                    _this2.channels[name].unsubscribe();
                    delete _this2.channels[name];
                }
            });
        }
        /**
         * Get the socket ID for the connection.
         */

    }, {
        key: 'socketId',
        value: function socketId() {
            return this.socket.id;
        }
        /**
         * Disconnect Socketio connection.
         */

    }, {
        key: 'disconnect',
        value: function disconnect() {
            this.socket.disconnect();
        }
    }]);
    return SocketIoConnector;
}(Connector);

/**
 * This class creates a null connector.
 */
var NullConnector = function (_Connector) {
  inherits(NullConnector, _Connector);

  function NullConnector() {
    classCallCheck(this, NullConnector);

    /**
     * All of the subscribed channel names.
     */
    var _this = possibleConstructorReturn(this, (NullConnector.__proto__ || Object.getPrototypeOf(NullConnector)).apply(this, arguments));

    _this.channels = {};
    return _this;
  }
  /**
   * Create a fresh connection.
   */


  createClass(NullConnector, [{
    key: 'connect',
    value: function connect() {}
    //

    /**
     * Listen for an event on a channel instance.
     */

  }, {
    key: 'listen',
    value: function listen(name, event, callback) {
      return new NullChannel();
    }
    /**
     * Get a channel instance by name.
     */

  }, {
    key: 'channel',
    value: function channel(name) {
      return new NullChannel();
    }
    /**
     * Get a private channel instance by name.
     */

  }, {
    key: 'privateChannel',
    value: function privateChannel(name) {
      return new NullPrivateChannel();
    }
    /**
     * Get a presence channel instance by name.
     */

  }, {
    key: 'presenceChannel',
    value: function presenceChannel(name) {
      return new NullPresenceChannel();
    }
    /**
     * Leave the given channel.
     */

  }, {
    key: 'leave',
    value: function leave(name) {}
    //

    /**
     * Get the socket ID for the connection.
     */

  }, {
    key: 'socketId',
    value: function socketId() {
      return 'fake-socket-id';
    }
    /**
     * Disconnect the connection.
     */

  }, {
    key: 'disconnect',
    value: function disconnect() {
      //
    }
  }]);
  return NullConnector;
}(Connector);

/**
 * This class is the primary API for interacting with broadcasting.
 */

var Echo = function () {
    /**
     * Create a new class instance.
     */
    function Echo(options) {
        classCallCheck(this, Echo);

        this.options = options;
        this.connect();
        this.registerInterceptors();
    }
    /**
     * Get a channel instance by name.
     */


    createClass(Echo, [{
        key: 'channel',
        value: function channel(_channel) {
            return this.connector.channel(_channel);
        }
        /**
         * Create a new connection.
         */

    }, {
        key: 'connect',
        value: function connect() {
            if (this.options.broadcaster == 'pusher') {
                this.connector = new PusherConnector(this.options);
            } else if (this.options.broadcaster == 'socket.io') {
                this.connector = new SocketIoConnector(this.options);
            } else if (this.options.broadcaster == 'null') {
                this.connector = new NullConnector(this.options);
            }
        }
        /**
         * Disconnect from the Echo server.
         */

    }, {
        key: 'disconnect',
        value: function disconnect() {
            this.connector.disconnect();
        }
        /**
         * Get a presence channel instance by name.
         */

    }, {
        key: 'join',
        value: function join(channel) {
            return this.connector.presenceChannel(channel);
        }
        /**
         * Leave the given channel.
         */

    }, {
        key: 'leave',
        value: function leave(channel) {
            this.connector.leave(channel);
        }
        /**
         * Listen for an event on a channel instance.
         */

    }, {
        key: 'listen',
        value: function listen(channel, event, callback) {
            return this.connector.listen(channel, event, callback);
        }
        /**
         * Get a private channel instance by name.
         */

    }, {
        key: 'private',
        value: function _private(channel) {
            return this.connector.privateChannel(channel);
        }
        /**
         * Get the Socket ID for the connection.
         */

    }, {
        key: 'socketId',
        value: function socketId() {
            return this.connector.socketId();
        }
        /**
         * Register 3rd party request interceptiors. These are used to automatically
         * send a connections socket id to a Laravel app with a X-Socket-Id header.
         */

    }, {
        key: 'registerInterceptors',
        value: function registerInterceptors() {
            if (typeof Vue === 'function' && Vue.http) {
                this.registerVueRequestInterceptor();
            }
            if (typeof axios === 'function') {
                this.registerAxiosRequestInterceptor();
            }
            if (typeof jQuery === 'function') {
                this.registerjQueryAjaxSetup();
            }
        }
        /**
         * Register a Vue HTTP interceptor to add the X-Socket-ID header.
         */

    }, {
        key: 'registerVueRequestInterceptor',
        value: function registerVueRequestInterceptor() {
            var _this = this;

            Vue.http.interceptors.push(function (request, next) {
                if (_this.socketId()) {
                    request.headers.set('X-Socket-ID', _this.socketId());
                }
                next();
            });
        }
        /**
         * Register an Axios HTTP interceptor to add the X-Socket-ID header.
         */

    }, {
        key: 'registerAxiosRequestInterceptor',
        value: function registerAxiosRequestInterceptor() {
            var _this2 = this;

            axios.interceptors.request.use(function (config) {
                if (_this2.socketId()) {
                    config.headers['X-Socket-Id'] = _this2.socketId();
                }
                return config;
            });
        }
        /**
         * Register jQuery AjaxSetup to add the X-Socket-ID header.
         */

    }, {
        key: 'registerjQueryAjaxSetup',
        value: function registerjQueryAjaxSetup() {
            var _this3 = this;

            if (typeof jQuery.ajax != 'undefined') {
                jQuery.ajaxSetup({
                    beforeSend: function beforeSend(xhr) {
                        if (_this3.socketId()) {
                            xhr.setRequestHeader('X-Socket-Id', _this3.socketId());
                        }
                    }
                });
            }
        }
    }]);
    return Echo;
}();

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
 */
/** *
 * The token used to inject the config in Angular's DI system
  @type {?} */
var ECHO_CONFIG = new InjectionToken('echo.config');
/**
 * @hidden
 */
var /**
 * @hidden
 */
TypeFormatter = /** @class */ (function () {
    /**
     * Constructs a new formatter instance
     *
     * @param namespace The namespace of the notifications.
     */
    function TypeFormatter(namespace) {
        /**
         * The namespace of the notifications.
         */
        this.namespace = null;
        this.setNamespace(namespace);
    }
    /**
     * Formats the supplied type
     *
     * @param notificationType The FQN of the notification class
     * @returns The optimized type
     */
    /**
     * Formats the supplied type
     *
     * @param {?} notificationType The FQN of the notification class
     * @return {?} The optimized type
     */
    TypeFormatter.prototype.format = /**
     * Formats the supplied type
     *
     * @param {?} notificationType The FQN of the notification class
     * @return {?} The optimized type
     */
    function (notificationType) {
        if (!this.namespace) {
            return notificationType;
        }
        if (notificationType.indexOf(this.namespace) === 0) {
            return notificationType.substr(this.namespace.length);
        }
        return notificationType;
    };
    /**
     * Sets the namespace
     *
     * @param namespace The namespace of the notifications.
     * @returns The instance for chaining
     */
    /**
     * Sets the namespace
     *
     * @param {?} namespace The namespace of the notifications.
     * @return {?} The instance for chaining
     */
    TypeFormatter.prototype.setNamespace = /**
     * Sets the namespace
     *
     * @param {?} namespace The namespace of the notifications.
     * @return {?} The instance for chaining
     */
    function (namespace) {
        this.namespace = namespace;
        return this;
    };
    return TypeFormatter;
}());
/**
 * The service class, use this as something like
 * (or use the [[AngularLaravelEchoModule.forRoot]] method):
 *
 * ```js
 * export const echoConfig: SocketIoEchoConfig = {
 *   userModel: 'App.User',
 *   notificationNamespace: 'App\\Notifications',
 *   options: {
 *     broadcaster: 'socket.io',
 *     host: window.location.hostname + ':6001'
 *   }
 * }
 *
 * \@NgModule({
 *   ...
 *   providers: [
 *     ...
 *     EchoService,
 *     { provide: ECHO_CONFIG, useValue: echoConfig }
 *     ...
 *   ]
 *   ...
 * })
 * ```
 *
 * and import it in your component as
 *
 * ```js
 * \@Component({
 * ...
 * })
 * export class ExampleComponent {
 *   constructor(echoService: EchoService) {
 *   }
 * }
 * ```
 */
var EchoService = /** @class */ (function () {
    /**
     * Create a new service instance.
     *
     * @param ngZone NgZone instance
     * @param config Service configuration
     */
    function EchoService(ngZone, config) {
        var _this = this;
        this.ngZone = ngZone;
        this.config = config;
        this.channels = [];
        this.notificationListeners = {};
        this.userChannelName = null;
        /** @type {?} */
        var options = Object.assign({}, config.options);
        if (options.broadcaster === 'socket.io') {
            options = Object.assign({
                client: io$1
            }, options);
        }
        this._echo = new Echo(options);
        this.options = this.echo.connector.options;
        this.typeFormatter = new TypeFormatter(config.notificationNamespace);
        switch (options.broadcaster) {
            case 'null':
                this.connectionState$ = of({ type: 'connected' });
                break;
            case 'socket.io':
                this.connectionState$ = new Observable(function (subscriber) {
                    /** @type {?} */
                    var socket = _this._echo.connector.socket;
                    /** @type {?} */
                    var handleConnect = function () { return _this.ngZone.run(function () { return subscriber.next({ type: 'connect' }); }); };
                    /** @type {?} */
                    var handleConnectError = function (error) { return _this.ngZone.run(function () { return subscriber.next({ type: 'connect_error', error: error }); }); };
                    /** @type {?} */
                    var handleConnectTimeout = function (timeout) { return _this.ngZone.run(function () { return subscriber.next({ type: 'connect_timeout', timeout: timeout }); }); };
                    /** @type {?} */
                    var handleError = function (error) { return _this.ngZone.run(function () { return subscriber.next({ type: 'error', error: error }); }); };
                    /** @type {?} */
                    var handleDisconnect = function (reason) { return _this.ngZone.run(function () { return subscriber.next({ type: 'disconnect', reason: reason }); }); };
                    /** @type {?} */
                    var handleReconnect = function (attemptNumber) { return _this.ngZone.run(function () { return subscriber.next({ type: 'reconnect', attemptNumber: attemptNumber }); }); };
                    /** @type {?} */
                    var handleReconnectAttempt = function (attemptNumber) { return _this.ngZone.run(function () { return subscriber.next({ type: 'reconnect_attempt', attemptNumber: attemptNumber }); }); };
                    /** @type {?} */
                    var handleReconnecting = function (attemptNumber) { return _this.ngZone.run(function () { return subscriber.next({ type: 'reconnecting', attemptNumber: attemptNumber }); }); };
                    /** @type {?} */
                    var handleReconnectError = function (error) { return _this.ngZone.run(function () { return subscriber.next({ type: 'reconnect_error', error: error }); }); };
                    /** @type {?} */
                    var handleReconnectFailed = function () { return _this.ngZone.run(function () { return subscriber.next({ type: 'reconnect_failed' }); }); };
                    /** @type {?} */
                    var handlePing = function () { return _this.ngZone.run(function () { return subscriber.next({ type: 'ping' }); }); };
                    /** @type {?} */
                    var handlePong = function (latency) { return _this.ngZone.run(function () { return subscriber.next({ type: 'pong', latency: latency }); }); };
                    socket.on('connect', handleConnect);
                    socket.on('connect_error', handleConnectError);
                    socket.on('connect_timeout', handleConnectTimeout);
                    socket.on('error', handleError);
                    socket.on('disconnect', handleDisconnect);
                    socket.on('reconnect', handleReconnect);
                    socket.on('reconnect_attempt', handleReconnectAttempt);
                    socket.on('reconnecting', handleReconnecting);
                    socket.on('reconnect_error', handleReconnectError);
                    socket.on('reconnect_failed', handleReconnectFailed);
                    socket.on('ping', handlePing);
                    socket.on('pong', handlePong);
                    return function () {
                        socket.off('connect', handleConnect);
                        socket.off('connect_error', handleConnectError);
                        socket.off('connect_timeout', handleConnectTimeout);
                        socket.off('error', handleError);
                        socket.off('disconnect', handleDisconnect);
                        socket.off('reconnect', handleReconnect);
                        socket.off('reconnect_attempt', handleReconnectAttempt);
                        socket.off('reconnecting', handleReconnecting);
                        socket.off('reconnect_error', handleReconnectError);
                        socket.off('reconnect_failed', handleReconnectFailed);
                        socket.off('ping', handlePing);
                        socket.off('pong', handlePong);
                    };
                }).pipe(shareReplay(1));
                break;
            case 'pusher':
                this.connectionState$ = new Observable(function (subscriber) {
                    /** @type {?} */
                    var socket = _this._echo.connector.pusher.connection;
                    /** @type {?} */
                    var handleStateChange = function (_a) {
                        var current = _a.current;
                        return _this.ngZone.run(function () { return subscriber.next({ type: current }); });
                    };
                    /** @type {?} */
                    var handleConnectingIn = function (delay) { return _this.ngZone.run(function () { return subscriber.next({ type: 'connecting_in', delay: delay }); }); };
                    socket.bind('state_change', handleStateChange);
                    socket.bind('connecting_in', handleConnectingIn);
                    return function () {
                        socket.unbind('state_change', handleStateChange);
                        socket.unbind('connecting_in', handleConnectingIn);
                    };
                }).pipe(shareReplay(1));
                break;
            default:
                this.connectionState$ = throwError(new Error('unsupported'));
                break;
        }
        this.connected$ = (/** @type {?} */ (this.connectionState$)).pipe(map(function () { return _this.connected; }), startWith(this.connected), distinctUntilChanged(), shareReplay(1));
    }
    Object.defineProperty(EchoService.prototype, "connected", {
        /**
         * Is the socket currently connected
         */
        get: /**
         * Is the socket currently connected
         * @return {?}
         */
        function () {
            if (this.options.broadcaster === 'null') {
                // Null broadcaster is always connected
                return true;
            }
            if (this.options.broadcaster === 'pusher') {
                return this._echo.connector.pusher.connection.state === 'connected';
            }
            return this._echo.connector.socket.connected;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(EchoService.prototype, "connectionState", {
        /**
         * Observable of connection state changes, emits true when connected and false when disconnected
         */
        get: /**
         * Observable of connection state changes, emits true when connected and false when disconnected
         * @return {?}
         */
        function () {
            return this.connected$;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(EchoService.prototype, "rawConnectionState", {
        /**
         * Observable of raw events of the underlying connection
         */
        get: /**
         * Observable of raw events of the underlying connection
         * @return {?}
         */
        function () {
            return this.connectionState$;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(EchoService.prototype, "echo", {
        /**
         * The echo instance, can be used to implement any custom requirements outside of this service (remember to include NgZone.run calls)
         */
        get: /**
         * The echo instance, can be used to implement any custom requirements outside of this service (remember to include NgZone.run calls)
         * @return {?}
         */
        function () {
            return this._echo;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(EchoService.prototype, "socketId", {
        /**
         * The socket ID
         */
        get: /**
         * The socket ID
         * @return {?}
         */
        function () {
            return this.echo.socketId();
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Gets the named and optionally typed channel from the channels array if it exists
     *
     * @param {?} name The name of the channel
     * @param {?=} type The type of channel to lookup
     * @return {?} The channel if found or null
     */
    EchoService.prototype.getChannelFromArray = /**
     * Gets the named and optionally typed channel from the channels array if it exists
     *
     * @param {?} name The name of the channel
     * @param {?=} type The type of channel to lookup
     * @return {?} The channel if found or null
     */
    function (name, type) {
        if (type === void 0) { type = null; }
        /** @type {?} */
        var channel = this.channels.find(function (c) { return c !== null && c.name === name; });
        if (channel) {
            if (type && channel.type !== type) {
                throw new Error("Channel " + name + " is not a " + type + " channel");
            }
            return channel;
        }
        return null;
    };
    /**
     * Gets the named and optionally typed channel from the channels array or throws if it does not exist
     *
     * @param {?} name The name of the channel
     * @param {?=} type The type of channel to lookup
     * @return {?} The channel
     */
    EchoService.prototype.requireChannelFromArray = /**
     * Gets the named and optionally typed channel from the channels array or throws if it does not exist
     *
     * @param {?} name The name of the channel
     * @param {?=} type The type of channel to lookup
     * @return {?} The channel
     */
    function (name, type) {
        if (type === void 0) { type = null; }
        /** @type {?} */
        var channel = this.getChannelFromArray(name, type);
        if (!channel) {
            if (type) {
                throw new Error("" + type[0].toUpperCase() + type.substr(1) + " channel " + name + " does not exist");
            }
            throw new Error("Channel " + name + " does not exist");
        }
        return channel;
    };
    /**
     * Fetch or create a public channel
     *
     * @param {?} name The name of the channel to join
     * @return {?} The fetched or created channel
     */
    EchoService.prototype.publicChannel = /**
     * Fetch or create a public channel
     *
     * @param {?} name The name of the channel to join
     * @return {?} The fetched or created channel
     */
    function (name) {
        /** @type {?} */
        var channel = this.getChannelFromArray(name, 'public');
        if (channel) {
            return channel.channel;
        }
        /** @type {?} */
        var echoChannel = this.echo.channel(name);
        channel = {
            name: name,
            channel: echoChannel,
            type: 'public',
            listeners: {},
        };
        this.channels.push(channel);
        return echoChannel;
    };
    /**
     * Fetch or create a presence channel and subscribe to the presence events
     *
     * @param {?} name The name of the channel to join
     * @return {?} The fetched or created channel
     */
    EchoService.prototype.presenceChannel = /**
     * Fetch or create a presence channel and subscribe to the presence events
     *
     * @param {?} name The name of the channel to join
     * @return {?} The fetched or created channel
     */
    function (name) {
        var _this = this;
        /** @type {?} */
        var channel = this.getChannelFromArray(name, 'presence');
        if (channel) {
            return channel.channel;
        }
        /** @type {?} */
        var echoChannel = this.echo.join(name);
        channel = {
            name: name,
            channel: echoChannel,
            type: 'presence',
            listeners: {},
            users: null,
        };
        this.channels.push(channel);
        echoChannel.here(function (users) {
            _this.ngZone.run(function () {
                if (channel) {
                    channel.users = users;
                    if (channel.listeners['_users_']) {
                        channel.listeners['_users_'].next(JSON.parse(JSON.stringify(users)));
                    }
                }
            });
        });
        echoChannel.joining(function (user) {
            _this.ngZone.run(function () {
                if (channel) {
                    channel.users = channel.users || [];
                    channel.users.push(user);
                    if (channel.listeners['_joining_']) {
                        channel.listeners['_joining_'].next(JSON.parse(JSON.stringify(user)));
                    }
                }
            });
        });
        echoChannel.leaving(function (user) {
            _this.ngZone.run(function () {
                if (channel) {
                    channel.users = channel.users || [];
                    /** @type {?} */
                    var existing = channel.users.find(function (e) { return e === user; });
                    if (existing) {
                        /** @type {?} */
                        var index = channel.users.indexOf(existing);
                        if (index !== -1) {
                            channel.users.splice(index, 1);
                        }
                    }
                    if (channel.listeners['_leaving_']) {
                        channel.listeners['_leaving_'].next(JSON.parse(JSON.stringify(user)));
                    }
                }
            });
        });
        return echoChannel;
    };
    /**
     * Fetch or create a private channel
     *
     * @param {?} name The name of the channel to join
     * @return {?} The fetched or created channel
     */
    EchoService.prototype.privateChannel = /**
     * Fetch or create a private channel
     *
     * @param {?} name The name of the channel to join
     * @return {?} The fetched or created channel
     */
    function (name) {
        /** @type {?} */
        var channel = this.getChannelFromArray(name, 'private');
        if (channel) {
            return channel.channel;
        }
        /** @type {?} */
        var echoChannel = this.echo.private(name);
        channel = {
            name: name,
            channel: echoChannel,
            type: 'private',
            listeners: {},
        };
        this.channels.push(channel);
        return echoChannel;
    };
    /**
     * Set authentication data and connect to and start listening for notifications on the users private channel
     *
     * @param headers Authentication headers to send when talking to the service
     * @param userId The current user's id
     * @returns The instance for chaining
     */
    /**
     * Set authentication data and connect to and start listening for notifications on the users private channel
     *
     * @param {?} headers Authentication headers to send when talking to the service
     * @param {?} userId The current user's id
     * @return {?} The instance for chaining
     */
    EchoService.prototype.login = /**
     * Set authentication data and connect to and start listening for notifications on the users private channel
     *
     * @param {?} headers Authentication headers to send when talking to the service
     * @param {?} userId The current user's id
     * @return {?} The instance for chaining
     */
    function (headers, userId) {
        var _this = this;
        /** @type {?} */
        var newChannelName = this.config.userModel.replace('\\', '.') + "." + userId;
        if (this.userChannelName && this.userChannelName !== newChannelName) {
            this.logout();
        }
        this.options.auth = this.options.auth || {};
        this.options.auth.headers = Object.assign({}, headers);
        if (this.options.broadcaster === 'pusher') {
            /** @type {?} */
            var connector = this._echo.connector;
            if (connector.pusher.config.auth !== this.options.auth) {
                connector.pusher.config.auth = this.options.auth;
            }
        }
        if (this.userChannelName !== newChannelName) {
            this.userChannelName = newChannelName;
            this.privateChannel(newChannelName).notification(function (notification) {
                /** @type {?} */
                var type = _this.typeFormatter.format(notification.type);
                if (_this.notificationListeners[type]) {
                    _this.ngZone.run(function () { return _this.notificationListeners[type].next(notification); });
                }
                if (_this.notificationListeners['*']) {
                    _this.ngZone.run(function () { return _this.notificationListeners['*'].next(notification); });
                }
            });
        }
        return this;
    };
    /**
     * Clear authentication data and close any presence or private channels.
     *
     * @returns The instance for chaining
     */
    /**
     * Clear authentication data and close any presence or private channels.
     *
     * @return {?} The instance for chaining
     */
    EchoService.prototype.logout = /**
     * Clear authentication data and close any presence or private channels.
     *
     * @return {?} The instance for chaining
     */
    function () {
        var _this = this;
        this.channels
            .filter(function (channel) { return channel !== null && channel.type !== 'public'; })
            .forEach(function (channel) { return _this.leave(channel !== null ? channel.name : ''); });
        this.options.auth = this.options.auth || {};
        this.options.auth.headers = {};
        return this;
    };
    /**
     * Join a channel of specified name and type.
     *
     * @param name The name of the channel to join
     * @param type The type of channel to join
     * @returns The instance for chaining
     */
    /**
     * Join a channel of specified name and type.
     *
     * @param {?} name The name of the channel to join
     * @param {?} type The type of channel to join
     * @return {?} The instance for chaining
     */
    EchoService.prototype.join = /**
     * Join a channel of specified name and type.
     *
     * @param {?} name The name of the channel to join
     * @param {?} type The type of channel to join
     * @return {?} The instance for chaining
     */
    function (name, type) {
        switch (type) {
            case 'public':
                this.publicChannel(name);
                break;
            case 'presence':
                this.presenceChannel(name);
                break;
            case 'private':
                this.privateChannel(name);
                break;
        }
        return this;
    };
    /**
     * Leave a channel of the specified name.
     *
     * @param name The name of the channel to leave
     * @returns The instance for chaining
     */
    /**
     * Leave a channel of the specified name.
     *
     * @param {?} name The name of the channel to leave
     * @return {?} The instance for chaining
     */
    EchoService.prototype.leave = /**
     * Leave a channel of the specified name.
     *
     * @param {?} name The name of the channel to leave
     * @return {?} The instance for chaining
     */
    function (name) {
        /** @type {?} */
        var channel = this.getChannelFromArray(name);
        if (channel) {
            this.echo.leave(name);
            Object.keys(channel.listeners).forEach(function (key) { return channel.listeners[key].complete(); });
            if (channel.notificationListeners) {
                Object.keys(channel.notificationListeners).forEach(function (key) { return channel.notificationListeners && channel.notificationListeners[key].complete(); });
            }
            /** @type {?} */
            var index = this.channels.indexOf(channel);
            if (index !== -1) {
                this.channels.splice(index, 1);
            }
        }
        return this;
    };
    /**
     * Listen for events on the specified channel.
     *
     * @param name The name of the channel
     * @param event The name of the event
     * @returns An observable that emits the event data of the specified event when it arrives
     */
    /**
     * Listen for events on the specified channel.
     *
     * @param {?} name The name of the channel
     * @param {?} event The name of the event
     * @return {?} An observable that emits the event data of the specified event when it arrives
     */
    EchoService.prototype.listen = /**
     * Listen for events on the specified channel.
     *
     * @param {?} name The name of the channel
     * @param {?} event The name of the event
     * @return {?} An observable that emits the event data of the specified event when it arrives
     */
    function (name, event) {
        var _this = this;
        /** @type {?} */
        var channel = this.requireChannelFromArray(name);
        if (!channel.listeners[event]) {
            /** @type {?} */
            var listener_1 = new Subject();
            channel.channel.listen(event, function (e) { return _this.ngZone.run(function () { return listener_1.next(e); }); });
            channel.listeners[event] = listener_1;
        }
        return channel.listeners[event].asObservable();
    };
    /**
     * Listen for client sent events (whispers) on the specified private or presence channel channel.
     *
     * @param name The name of the channel
     * @param event The name of the event
     * @returns An observable that emits the whisper data of the specified event when it arrives
     */
    /**
     * Listen for client sent events (whispers) on the specified private or presence channel channel.
     *
     * @param {?} name The name of the channel
     * @param {?} event The name of the event
     * @return {?} An observable that emits the whisper data of the specified event when it arrives
     */
    EchoService.prototype.listenForWhisper = /**
     * Listen for client sent events (whispers) on the specified private or presence channel channel.
     *
     * @param {?} name The name of the channel
     * @param {?} event The name of the event
     * @return {?} An observable that emits the whisper data of the specified event when it arrives
     */
    function (name, event) {
        var _this = this;
        /** @type {?} */
        var channel = this.requireChannelFromArray(name);
        if (channel.type === 'public') {
            return throwError(new Error('Whisper is not available on public channels'));
        }
        if (!channel.listeners["_whisper_" + event + "_"]) {
            /** @type {?} */
            var listener_2 = new Subject();
            channel.channel.listenForWhisper(event, function (e) { return _this.ngZone.run(function () { return listener_2.next(e); }); });
            channel.listeners["_whisper_" + event + "_"] = listener_2;
        }
        return channel.listeners["_whisper_" + event + "_"].asObservable();
    };
    /**
     * Listen for notifications on the users private channel.
     *
     * @param type The type of notification to listen for or `*` for any
     * @param name Optional a different channel to receive notifications on
     * @returns An observable that emits the notification of the specified type when it arrives
     */
    /**
     * Listen for notifications on the users private channel.
     *
     * @param {?} type The type of notification to listen for or `*` for any
     * @param {?=} name Optional a different channel to receive notifications on
     * @return {?} An observable that emits the notification of the specified type when it arrives
     */
    EchoService.prototype.notification = /**
     * Listen for notifications on the users private channel.
     *
     * @param {?} type The type of notification to listen for or `*` for any
     * @param {?=} name Optional a different channel to receive notifications on
     * @return {?} An observable that emits the notification of the specified type when it arrives
     */
    function (type, name) {
        var _this = this;
        type = this.typeFormatter.format(type);
        if (name && name !== this.userChannelName) {
            /** @type {?} */
            var channel_1 = this.requireChannelFromArray(name);
            if (!channel_1.notificationListeners) {
                channel_1.notificationListeners = {};
                channel_1.channel.notification(function (notification) {
                    /** @type {?} */
                    var notificationType = _this.typeFormatter.format(notification.type);
                    if (channel_1.notificationListeners) {
                        if (channel_1.notificationListeners[notificationType]) {
                            _this.ngZone.run(function () { return channel_1.notificationListeners && channel_1.notificationListeners[notificationType].next(notification); });
                        }
                        if (channel_1.notificationListeners['*']) {
                            _this.ngZone.run(function () { return channel_1.notificationListeners && channel_1.notificationListeners['*'].next(notification); });
                        }
                    }
                });
            }
            if (!channel_1.notificationListeners[type]) {
                channel_1.notificationListeners[type] = new Subject();
            }
            return channel_1.notificationListeners[type].asObservable();
        }
        if (!this.notificationListeners[type]) {
            this.notificationListeners[type] = new Subject();
        }
        return this.notificationListeners[type].asObservable();
    };
    /**
     * Listen for users joining the specified presence channel.
     *
     * @param name The name of the channel
     * @returns An observable that emits the user when he joins the specified channel
     */
    /**
     * Listen for users joining the specified presence channel.
     *
     * @param {?} name The name of the channel
     * @return {?} An observable that emits the user when he joins the specified channel
     */
    EchoService.prototype.joining = /**
     * Listen for users joining the specified presence channel.
     *
     * @param {?} name The name of the channel
     * @return {?} An observable that emits the user when he joins the specified channel
     */
    function (name) {
        /** @type {?} */
        var channel = this.requireChannelFromArray(name, 'presence');
        if (!channel.listeners["_joining_"]) {
            channel.listeners['_joining_'] = new Subject();
        }
        return channel.listeners['_joining_'].asObservable();
    };
    /**
     * Listen for users leaving the specified presence channel.
     *
     * @param name The name of the channel
     * @returns An observable that emits the user when he leaves the specified channel
     */
    /**
     * Listen for users leaving the specified presence channel.
     *
     * @param {?} name The name of the channel
     * @return {?} An observable that emits the user when he leaves the specified channel
     */
    EchoService.prototype.leaving = /**
     * Listen for users leaving the specified presence channel.
     *
     * @param {?} name The name of the channel
     * @return {?} An observable that emits the user when he leaves the specified channel
     */
    function (name) {
        /** @type {?} */
        var channel = this.requireChannelFromArray(name, 'presence');
        if (!channel.listeners["_leaving_"]) {
            channel.listeners['_leaving_'] = new Subject();
        }
        return channel.listeners['_leaving_'].asObservable();
    };
    /**
     * Listen for user list updates on the specified presence channel.
     *
     * @param name The name of the channel
     * @returns An observable that emits the initial user list as soon as it's available
     */
    /**
     * Listen for user list updates on the specified presence channel.
     *
     * @param {?} name The name of the channel
     * @return {?} An observable that emits the initial user list as soon as it's available
     */
    EchoService.prototype.users = /**
     * Listen for user list updates on the specified presence channel.
     *
     * @param {?} name The name of the channel
     * @return {?} An observable that emits the initial user list as soon as it's available
     */
    function (name) {
        /** @type {?} */
        var channel = this.requireChannelFromArray(name, 'presence');
        if (!channel.listeners["_users_"]) {
            channel.listeners['_users_'] = new ReplaySubject(1);
        }
        return channel.listeners['_users_'].asObservable();
    };
    /**
     * Send a client event to the specified presence or private channel (whisper).
     *
     * @param name The name of the channel
     * @param event The name of the event
     * @param data The payload for the event
     * @returns The instance for chaining
     */
    /**
     * Send a client event to the specified presence or private channel (whisper).
     *
     * @param {?} name The name of the channel
     * @param {?} event The name of the event
     * @param {?} data The payload for the event
     * @return {?} The instance for chaining
     */
    EchoService.prototype.whisper = /**
     * Send a client event to the specified presence or private channel (whisper).
     *
     * @param {?} name The name of the channel
     * @param {?} event The name of the event
     * @param {?} data The payload for the event
     * @return {?} The instance for chaining
     */
    function (name, event, data) {
        /** @type {?} */
        var channel = this.requireChannelFromArray(name);
        if (channel.type === 'public') {
            throw new Error('Whisper is not available on public channels');
        }
        /** @type {?} */
        var echoChannel = channel.channel;
        echoChannel.whisper(event, data);
        return this;
    };
    EchoService.decorators = [
        { type: Injectable },
    ];
    /** @nocollapse */
    EchoService.ctorParameters = function () { return [
        { type: NgZone },
        { type: undefined, decorators: [{ type: Inject, args: [ECHO_CONFIG,] }] }
    ]; };
    return EchoService;
}());

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
 */

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
 */
/**
 * An http interceptor to automatically add the socket ID header, use this as something like
 * (or use the [[AngularLaravelEchoModule.forRoot]] method):
 *
 * ```js
 * \@NgModule({
 *   ...
 *   providers: [
 *     ...
 *     { provide: HTTP_INTERCEPTORS, useClass: EchoInterceptor, multi: true }
 *     ...
 *   ]
 *   ...
 * })
 * ```
 */
var EchoInterceptor = /** @class */ (function () {
    function EchoInterceptor(echoService) {
        this.echoService = echoService;
    }
    /**
     * @param {?} req
     * @param {?} next
     * @return {?}
     */
    EchoInterceptor.prototype.intercept = /**
     * @param {?} req
     * @param {?} next
     * @return {?}
     */
    function (req, next) {
        /** @type {?} */
        var socketId = this.echoService.socketId;
        if (this.echoService.connected && socketId) {
            req = req.clone({ headers: req.headers.append('X-Socket-ID', socketId) });
        }
        return next.handle(req);
    };
    EchoInterceptor.decorators = [
        { type: Injectable },
    ];
    /** @nocollapse */
    EchoInterceptor.ctorParameters = function () { return [
        { type: EchoService }
    ]; };
    return EchoInterceptor;
}());

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
 */
/**
 * Module definition, use [[forRoot]] for easy configuration
 * of the service and interceptor
 */
var NgxLaravelEchoModule = /** @class */ (function () {
    function NgxLaravelEchoModule() {
    }
    /**
     * Make the service and interceptor available for the current (root) module, it is recommended that this method
     * is only called from the root module otherwise multiple instances of the service and interceptor will be created
     * (one for each module it is called in)
     * @param {?} config
     * @return {?}
     */
    NgxLaravelEchoModule.forRoot = /**
     * Make the service and interceptor available for the current (root) module, it is recommended that this method
     * is only called from the root module otherwise multiple instances of the service and interceptor will be created
     * (one for each module it is called in)
     * @param {?} config
     * @return {?}
     */
    function (config) {
        return {
            ngModule: NgxLaravelEchoModule,
            providers: [
                EchoService,
                { provide: HTTP_INTERCEPTORS, useClass: EchoInterceptor, multi: true },
                { provide: ECHO_CONFIG, useValue: config },
            ]
        };
    };
    NgxLaravelEchoModule.decorators = [
        { type: NgModule, args: [{
                    imports: [CommonModule],
                },] },
    ];
    return NgxLaravelEchoModule;
}());

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
 */

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
 */

export { EchoService, EchoInterceptor, NgxLaravelEchoModule, ECHO_CONFIG };
