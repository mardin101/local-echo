import { InjectionToken, NgZone } from '@angular/core';
import { Observable } from 'rxjs';
import Echo from 'laravel-echo/dist/echo';
/**
 * The token used to inject the config in Angular's DI system
 */
export declare const ECHO_CONFIG: InjectionToken<EchoConfig>;
/**
 * Service configuration
 */
export interface EchoConfig {
    /**
     * The name of the user model of the backend application
     */
    userModel: string;
    /**
     * The name of the namespace for notifications of the backend application
     */
    notificationNamespace: string | null;
    /**
     * Laravel Echo configuration
     */
    options: any;
}
/**
 * Possible channel types
 */
export declare type ChannelType = 'public' | 'presence' | 'private';
/**
 * Raw events from the underlying connection
 */
export interface ConnectionEvent {
    /**
     * The event type
     */
    type: string;
}
/**
 * Null connection events
 */
export interface NullConnectionEvent extends ConnectionEvent {
    /**
     * The event type
     */
    type: 'connected';
}
/**
 * Socket.io connection events
 */
export interface SocketIoConnectionEvent extends ConnectionEvent {
    /**
     * The event type
     */
    type: 'connect' | 'connect_error' | 'connect_timeout' | 'error' | 'disconnect' | 'reconnect' | 'reconnect_attempt' | 'reconnecting' | 'reconnect_error' | 'reconnect_failed' | 'ping' | 'pong';
}
/**
 * Socket.io disconnect event
 */
export interface SocketIoConnectionDisconnectEvent extends SocketIoConnectionEvent {
    /**
     * The event type
     */
    type: 'disconnect';
    /**
     * The reason, either "io server disconnect" or "io client disconnect"
     */
    reason: string;
}
/**
 * Socket.io (*_)error event
 */
export interface SocketIoConnectionErrorEvent extends SocketIoConnectionEvent {
    /**
     * The event type
     */
    type: 'connect_error' | 'error' | 'reconnect_error';
    /**
     * The error object
     */
    error: any;
}
/**
 * Socket.io reconnect event
 */
export interface SocketIoConnectionReconnectEvent extends SocketIoConnectionEvent {
    /**
     * The event type
     */
    type: 'reconnect' | 'reconnect_attempt' | 'reconnecting';
    /**
     * The current attempt count
     */
    attemptNumber: number;
}
/**
 * Socket.io timeout event
 */
export interface SocketIoConnectionTimeoutEvent extends SocketIoConnectionEvent {
    /**
     * The event type
     */
    type: 'connect_timeout';
    /**
     * The timeout
     */
    timeout: number;
}
/**
 * Socket.io pong event
 */
export interface SocketIoConnectionPongEvent extends SocketIoConnectionEvent {
    /**
     * The event type
     */
    type: 'pong';
    /**
     * The latency
     */
    latency: number;
}
/**
 * All Socket.io events
 */
export declare type SocketIoConnectionEvents = SocketIoConnectionEvent | SocketIoConnectionDisconnectEvent | SocketIoConnectionErrorEvent | SocketIoConnectionReconnectEvent | SocketIoConnectionTimeoutEvent | SocketIoConnectionPongEvent;
/**
 * Pusher connection states
 */
export declare type PusherStates = 'initialized' | 'connecting' | 'connected' | 'unavailable' | 'failed' | 'disconnected';
/**
 * Pusher connection events
 */
export interface PusherConnectionEvent {
    type: PusherStates | 'connecting_in';
}
/**
 * Pusher connecting in event
 */
export interface PusherConnectionConnectingInEvent extends PusherConnectionEvent {
    type: 'connecting_in';
    delay: number;
}
/**
 * All pusher events
 */
export declare type PusherConnectionEvents = PusherConnectionEvent | PusherConnectionConnectingInEvent;
/**
 * All connection events
 */
export declare type ConnectionEvents = NullConnectionEvent | SocketIoConnectionEvents | PusherConnectionEvents;
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
 * @NgModule({
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
 * @Component({
 * ...
 * })
 * export class ExampleComponent {
 *   constructor(echoService: EchoService) {
 *   }
 * }
 * ```
 */
export declare class EchoService {
    private ngZone;
    private config;
    private readonly _echo;
    private readonly options;
    private readonly typeFormatter;
    private readonly connected$;
    private readonly connectionState$;
    private readonly channels;
    private readonly notificationListeners;
    private userChannelName;
    /**
     * Create a new service instance.
     *
     * @param ngZone NgZone instance
     * @param config Service configuration
     */
    constructor(ngZone: NgZone, config: EchoConfig);
    /**
     * Is the socket currently connected
     */
    readonly connected: boolean;
    /**
     * Observable of connection state changes, emits true when connected and false when disconnected
     */
    readonly connectionState: Observable<boolean>;
    /**
     * Observable of raw events of the underlying connection
     */
    readonly rawConnectionState: Observable<ConnectionEvents>;
    /**
     * The echo instance, can be used to implement any custom requirements outside of this service (remember to include NgZone.run calls)
     */
    readonly echo: Echo;
    /**
     * The socket ID
     */
    readonly socketId: string;
    /**
     * Gets the named and optionally typed channel from the channels array if it exists
     *
     * @param name The name of the channel
     * @param type The type of channel to lookup
     * @returns The channel if found or null
     */
    private getChannelFromArray;
    /**
     * Gets the named and optionally typed channel from the channels array or throws if it does not exist
     *
     * @param name The name of the channel
     * @param type The type of channel to lookup
     * @returns The channel
     */
    private requireChannelFromArray;
    /**
     * Fetch or create a public channel
     *
     * @param name The name of the channel to join
     * @returns The fetched or created channel
     */
    private publicChannel;
    /**
     * Fetch or create a presence channel and subscribe to the presence events
     *
     * @param name The name of the channel to join
     * @returns The fetched or created channel
     */
    private presenceChannel;
    /**
     * Fetch or create a private channel
     *
     * @param name The name of the channel to join
     * @returns The fetched or created channel
     */
    private privateChannel;
    /**
     * Set authentication data and connect to and start listening for notifications on the users private channel
     *
     * @param headers Authentication headers to send when talking to the service
     * @param userId The current user's id
     * @returns The instance for chaining
     */
    login(headers: {
        [key: string]: string;
    }, userId: string | number): EchoService;
    /**
     * Clear authentication data and close any presence or private channels.
     *
     * @returns The instance for chaining
     */
    logout(): EchoService;
    /**
     * Join a channel of specified name and type.
     *
     * @param name The name of the channel to join
     * @param type The type of channel to join
     * @returns The instance for chaining
     */
    join(name: string, type: ChannelType): EchoService;
    /**
     * Leave a channel of the specified name.
     *
     * @param name The name of the channel to leave
     * @returns The instance for chaining
     */
    leave(name: string): EchoService;
    /**
     * Listen for events on the specified channel.
     *
     * @param name The name of the channel
     * @param event The name of the event
     * @returns An observable that emits the event data of the specified event when it arrives
     */
    listen(name: string, event: string): Observable<any>;
    /**
     * Listen for client sent events (whispers) on the specified private or presence channel channel.
     *
     * @param name The name of the channel
     * @param event The name of the event
     * @returns An observable that emits the whisper data of the specified event when it arrives
     */
    listenForWhisper(name: string, event: string): Observable<any>;
    /**
     * Listen for notifications on the users private channel.
     *
     * @param type The type of notification to listen for or `*` for any
     * @param name Optional a different channel to receive notifications on
     * @returns An observable that emits the notification of the specified type when it arrives
     */
    notification(type: string, name?: string): Observable<any>;
    /**
     * Listen for users joining the specified presence channel.
     *
     * @param name The name of the channel
     * @returns An observable that emits the user when he joins the specified channel
     */
    joining(name: string): Observable<any>;
    /**
     * Listen for users leaving the specified presence channel.
     *
     * @param name The name of the channel
     * @returns An observable that emits the user when he leaves the specified channel
     */
    leaving(name: string): Observable<any>;
    /**
     * Listen for user list updates on the specified presence channel.
     *
     * @param name The name of the channel
     * @returns An observable that emits the initial user list as soon as it's available
     */
    users(name: string): Observable<any[]>;
    /**
     * Send a client event to the specified presence or private channel (whisper).
     *
     * @param name The name of the channel
     * @param event The name of the event
     * @param data The payload for the event
     * @returns The instance for chaining
     */
    whisper(name: string, event: string, data: any): EchoService;
}
