declare module "level" {
    interface Level {

    }
    interface LevelFactory {
        (dbName: string): Level;
    }

    var factory: LevelFactory;
    export = factory;
}