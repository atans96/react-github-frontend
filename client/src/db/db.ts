import Dexie from 'dexie';

export interface ApolloCache {
  id?: number; // make id optional because when create a data, typescript will still require this one XD
  data: string;
}

export class ApolloCacheDB extends Dexie {
  public apolloCache: Dexie.Table<ApolloCache, number>; // id is number in this case

  public constructor() {
    super('ApolloCacheDB');
    // @ts-ignore
    this.autoOpen = false;

    this.version(1).stores({
      apolloCache: '++id,data',
    });

    this.apolloCache = this.table('apolloCache');
  }
}
