declare module "robots-txt" {
    interface RobotsInitParams {
        db?: any;
        ttl?: number;
    }

    interface RobotsFactory {
        (params?: RobotsInitParams): Robots;
    }

    interface Robots {
        isAllowed(botName: string, url: string): Promise<boolean>;
    }

    var factory: RobotsFactory;
    export = factory;
}