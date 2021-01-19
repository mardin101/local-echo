import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EchoService } from './lib.service';
/**
 * An http interceptor to automatically add the socket ID header, use this as something like
 * (or use the [[AngularLaravelEchoModule.forRoot]] method):
 *
 * ```js
 * @NgModule({
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
export declare class EchoInterceptor implements HttpInterceptor {
    private echoService;
    constructor(echoService: EchoService);
    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>>;
}
