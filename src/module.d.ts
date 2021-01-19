import { ModuleWithProviders } from '@angular/core';
import { EchoConfig } from './services/lib.service';
/**
 * Module definition, use [[forRoot]] for easy configuration
 * of the service and interceptor
 */
export declare class NgxLaravelEchoModule {
    /**
     * Make the service and interceptor available for the current (root) module, it is recommended that this method
     * is only called from the root module otherwise multiple instances of the service and interceptor will be created
     * (one for each module it is called in)
     */
    static forRoot(config: EchoConfig): ModuleWithProviders;
}
