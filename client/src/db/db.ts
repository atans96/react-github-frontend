import Dexie from 'dexie';

export interface ApolloCache {
  id?: number; // make id optional because when create a data, typescript will still require this one XD
  data: string;
}

export class ApolloCacheDB extends Dexie {
  public getUserData: Dexie.Table<ApolloCache, number>; // id is number in this case
  public getUserInfoData: Dexie.Table<ApolloCache, number>;
  public getUserInfoStarred: Dexie.Table<ApolloCache, number>;
  public getSeen: Dexie.Table<ApolloCache, number>;
  public getSearchesData: Dexie.Table<ApolloCache, number>;

  public constructor() {
    super('ApolloCacheDB');
    // @ts-ignore
    this.autoOpen = false;

    this.version(1).stores({
      getUserData: '++id,data',
      getUserInfoData: '++id,data',
      getUserInfoStarred: '++id,data',
      getSeen: '++id,data',
      getSearchesData: '++id,data',
    });

    this.getUserData = this.table('getUserData');
    this.getUserInfoData = this.table('getUserInfoData');
    this.getUserInfoStarred = this.table('getUserInfoStarred');
    this.getSeen = this.table('getSeen');
    this.getSearchesData = this.table('getSearchesData');
  }
}
